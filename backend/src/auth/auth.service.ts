import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { JwtService } from './jwt.service';
import { RegisterDto, LoginDto } from '../zod-schames/auth.schemas';
import { AppEntity, createCustomCuid, throwHttpException } from '../utils';
import { CacheManagerService, DataType } from '../cache/cache-manager.service';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { BillingService } from '../billing/billing.service';
import { OrganizationPlan } from '@shared/models/organization-config.model';
import { LoginRateLimitService } from './login-rate-limit.service';
import { EmailService } from '../email/email.service';
import { AuthTokenService } from './auth-token.service';
import { LegalService } from '../legal/legal.service';
import { Logger } from 'nestjs-pino';

const DEFAULT_DOMAIN_GROUP_NAME = 'Default';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly clsService: ClsService,
    private readonly billingService: BillingService,
    private readonly loginRateLimitService: LoginRateLimitService,
    private readonly emailService: EmailService,
    private readonly authTokenService: AuthTokenService,
    private readonly legalService: LegalService,
    private readonly logger: Logger,
  ) {}

  async register(data: RegisterDto) {
    const normalizedEmail = data.email.trim().toLowerCase();
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (existingUser) {
      return throwHttpException(
        new ConflictError({
          requestId: this.clsService.getId(),
          details: `User with this email already exists (${existingUser.email})`,
        }),
      );
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);
    const legalConsent = this.legalService.buildConsentRecord();

    // 3. Create organization, user, and default domain group in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          id: createCustomCuid(AppEntity.Organization),
          name: data.organizationName,
        },
      });

      // Create user as owner
      const user = await tx.user.create({
        data: {
          id: createCustomCuid(AppEntity.User),
          email: normalizedEmail,
          passwordHash,
          organizationId: organization.id,
          isOwner: true,
          ...legalConsent,
        },
      });

      const domainGroup = await tx.domainGroup.create({
        data: {
          id: createCustomCuid(AppEntity.DomainGroup),
          name: DEFAULT_DOMAIN_GROUP_NAME,
          organizationId: organization.id,
        },
      });

      return { user, organization, domainGroup };
    });

    await Promise.all([
      this.cacheManagerService.setDataExist({
        dataType: DataType.USERS,
        data: result.user as any,
      }),
      this.cacheManagerService.setDataExist({
        dataType: DataType.ORGANIZATIONS,
        data: result.organization,
      }),
      this.cacheManagerService.setDataExist({
        dataType: DataType.DOMAIN_GROUPS,
        data: result.domainGroup as any,
      }),
    ]);

    const selectedPlan = (data.plan ??
      OrganizationPlan.FREE) as OrganizationPlan;
    const selectedInterval = data.billingInterval ?? 'MONTHLY';
    const shouldCreateCheckout =
      selectedPlan === OrganizationPlan.BASIC ||
      selectedPlan === OrganizationPlan.PRO;

    const checkout = shouldCreateCheckout
      ? await this.billingService.createCheckout({
          organizationId: result.organization.id,
          userId: result.user.id,
          plan: selectedPlan,
          interval: selectedInterval,
        })
      : null;

    const verificationToken = await this.authTokenService.createToken(
      'email_verification',
      {
        userId: result.user.id,
        email: normalizedEmail,
      },
    );
    await this.emailService.sendVerificationEmail({
      email: normalizedEmail,
      token: verificationToken,
    });

    // 4. Generate JWT token
    const tokens = this.jwtService.generateTokens({
      userId: result.user.id,
      organizationId: result.user.organizationId,
    });

    const { passwordHash: _passwordHash, ...userWithoutPassword } = result.user;

    return {
      user: userWithoutPassword,
      organization: result.organization,
      checkoutUrl: checkout?.checkoutUrl ?? null,
      ...tokens,
    };
  }

  async login(data: LoginDto, ip: string | null) {
    await this.loginRateLimitService.assertNotBlocked(ip);
    const normalizedEmail = data.email.trim().toLowerCase();

    // 1. Find user
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        deletedAt: null,
      },
      include: {
        organization: true,
      },
    });

    if (!user) {
      await this.loginRateLimitService.registerFailure(ip);
      return throwHttpException(
        new UnauthorizedError({
          requestId: this.clsService.getId(),
          details: 'Invalid email or password',
        }),
      );
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.loginRateLimitService.registerFailure(ip);
      return throwHttpException(
        new UnauthorizedError({
          requestId: this.clsService.getId(),
          details: 'Invalid email or password',
        }),
      );
    }

    await this.loginRateLimitService.reset(ip);

    if (user.isBlocked) {
      return throwHttpException(
        new ForbiddenError({
          requestId: this.clsService.getId(),
          details: 'Account is blocked by the organization owner.',
        }),
      );
    }

    await this.cacheManagerService.setDataExist({
      dataType: DataType.USERS,
      data: user,
    });

    if (user.organization) {
      await this.cacheManagerService.setDataExist({
        dataType: DataType.ORGANIZATIONS,
        data: user.organization as any,
      });
    }

    // 3. Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;

    // 4. Generate JWT token
    const tokens = this.jwtService.generateTokens({
      userId: user.id,
      organizationId: user.organizationId,
    });

    return {
      user: userWithoutPassword,
      organization: user.organization,
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    // 1. Verify signature
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return throwHttpException(
        new UnauthorizedError({
          requestId: this.clsService.getId(),
          details: 'Invalid refresh token',
        }),
      );
    }

    // 2. Check for Token Reuse via CacheManager
    await this.ensureRefreshTokenNotReused(payload as RefreshTokenPayload);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId, deletedAt: null },
    });
    if (!user) {
      return throwHttpException(
        new UnauthorizedError({
          requestId: this.clsService.getId(),
          details: 'User not found',
        }),
      );
    }

    if (user.isBlocked) {
      return throwHttpException(
        new ForbiddenError({
          requestId: this.clsService.getId(),
          details: 'Account is blocked by the organization owner.',
        }),
      );
    }

    // 3. Blacklist the OLD token via CacheManager
    await this.blacklistRefreshToken(payload as RefreshTokenPayload);

    return this.jwtService.generateTokens({
      userId: payload.userId,
      organizationId: payload.organizationId,
    });
  }

  async getSession(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { organization: true },
    });

    if (!user) {
      return throwHttpException(
        new UnauthorizedError({
          requestId: this.clsService.getId(),
          details: 'User not found',
        }),
      );
    }

    if (user.isBlocked) {
      return throwHttpException(
        new ForbiddenError({
          requestId: this.clsService.getId(),
          details: 'Account is blocked by the organization owner.',
        }),
      );
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      organization: user.organization,
    };
  }

  async logout(refreshToken: string | null) {
    if (!refreshToken) {
      return;
    }

    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return;
    }

    await this.blacklistRefreshToken(payload as RefreshTokenPayload);
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `User ${userId} not found.`,
          relatedObject: 'User',
          relatedObjectId: userId,
        }),
      );
    }

    if (user.emailVerifiedAt) {
      return { alreadyVerified: true };
    }

    const token = await this.authTokenService.createToken(
      'email_verification',
      {
        userId: user.id,
        email: user.email,
      },
    );
    await this.emailService.sendVerificationEmail({
      email: user.email,
      token,
    });

    return { sent: true };
  }

  async verifyEmail(token: string) {
    const payload = await this.authTokenService.consumeToken(
      'email_verification',
      token,
    );
    if (!payload?.userId || !payload.email) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Verification token is invalid or expired.',
        }),
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId, deletedAt: null },
    });
    if (!user) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `User ${payload.userId} not found.`,
          relatedObject: 'User',
          relatedObjectId: payload.userId,
        }),
      );
    }

    if (user.email !== payload.email) {
      return throwHttpException(
        new ConflictError({
          requestId: this.clsService.getId(),
          details: 'Email address does not match the verification request.',
        }),
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });

    await this.cacheManagerService.setDataExist({
      dataType: DataType.USERS,
      data: updated,
    });

    return { verified: true };
  }

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (!user) {
      return { sent: true };
    }

    const token = await this.authTokenService.createToken('password_reset', {
      userId: user.id,
      email: user.email,
    });
    await this.emailService.sendPasswordResetEmail({
      email: user.email,
      token,
    });

    return { sent: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = await this.authTokenService.consumeToken(
      'password_reset',
      token,
    );
    if (!payload?.userId) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Reset token is invalid or expired.',
        }),
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId, deletedAt: null },
    });
    if (!user) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `User ${payload.userId} not found.`,
          relatedObject: 'User',
          relatedObjectId: payload.userId,
        }),
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await this.cacheManagerService.setDataExist({
      dataType: DataType.USERS,
      data: updated,
    });

    return { success: true };
  }

  async updateEmailForUnverified(userId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `User ${userId} not found.`,
          relatedObject: 'User',
          relatedObjectId: userId,
        }),
      );
    }

    if (user.emailVerifiedAt) {
      return throwHttpException(
        new ConflictError({
          requestId: this.clsService.getId(),
          details: 'Email is already verified. Use the secure change flow.',
        }),
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existingUser) {
      return throwHttpException(
        new ConflictError({
          requestId: this.clsService.getId(),
          details: `User with email ${normalizedEmail} already exists.`,
        }),
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: normalizedEmail,
        emailVerifiedAt: null,
      },
    });

    const token = await this.authTokenService.createToken(
      'email_verification',
      {
        userId: updated.id,
        email: normalizedEmail,
      },
    );
    await this.emailService.sendVerificationEmail({
      email: normalizedEmail,
      token,
    });

    await this.cacheManagerService.setDataExist({
      dataType: DataType.USERS,
      data: updated,
    });

    return { updated: true };
  }

  async requestEmailChange(userId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `User ${userId} not found.`,
          relatedObject: 'User',
          relatedObjectId: userId,
        }),
      );
    }

    if (!user.emailVerifiedAt) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Email is not verified. Update it directly instead.',
        }),
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existingUser) {
      return throwHttpException(
        new ConflictError({
          requestId: this.clsService.getId(),
          details: `User with email ${normalizedEmail} already exists.`,
        }),
      );
    }

    const code = await this.authTokenService.createCode('email_change', {
      userId: user.id,
      newEmail: normalizedEmail,
    });

    await this.emailService.sendEmailChangeCode({
      email: normalizedEmail,
      code,
    });

    return { sent: true };
  }

  async confirmEmailChange(userId: string, code: string) {
    const payload = await this.authTokenService.consumeToken(
      'email_change',
      code,
    );

    if (!payload?.userId || !payload.newEmail) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Email change code is invalid or expired.',
        }),
      );
    }

    if (payload.userId !== userId) {
      return throwHttpException(
        new ForbiddenError({
          requestId: this.clsService.getId(),
          details: 'Email change code does not match this account.',
        }),
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: payload.newEmail,
        emailVerifiedAt: new Date(),
      },
    });

    await this.cacheManagerService.setDataExist({
      dataType: DataType.USERS,
      data: updated,
    });

    return { updated: true };
  }

  async acceptLegalConsent(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `User ${userId} not found.`,
          relatedObject: 'User',
          relatedObjectId: userId,
        }),
      );
    }

    const consent = this.legalService.buildConsentRecord();
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        termsAcceptedAt: consent.termsAcceptedAt,
        privacyAcceptedAt: consent.privacyAcceptedAt,
        ageConfirmedAt: consent.ageConfirmedAt,
        legalVersion: consent.legalVersion,
      },
    });

    await this.cacheManagerService.setDataExist({
      dataType: DataType.USERS,
      data: updated,
    });

    const { passwordHash: _passwordHash, ...userWithoutPassword } = updated;
    return { user: userWithoutPassword };
  }

  private async ensureRefreshTokenNotReused(
    payload: RefreshTokenPayload,
  ): Promise<void> {
    const jti = payload.jti;
    if (!jti) {
      return;
    }

    const isBlacklisted =
      await this.cacheManagerService.isTokenBlacklisted(jti);
    if (isBlacklisted) {
      return throwHttpException(
        new UnauthorizedError({
          requestId: this.clsService.getId(),
          details: 'Refresh token has already been used. Please login again.',
        }),
      );
    }
  }

  private async blacklistRefreshToken(
    payload: RefreshTokenPayload,
  ): Promise<void> {
    const jti = payload.jti;
    const exp = payload.exp;
    if (!jti || !exp) {
      return;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const ttl = exp - currentTimestamp;

    if (ttl > 0) {
      await this.cacheManagerService.blacklistToken(jti, ttl);
    }
  }
}

type RefreshTokenPayload = {
  jti?: string;
  exp?: number;
  userId: string;
  organizationId: string;
};
