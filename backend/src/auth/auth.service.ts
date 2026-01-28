import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { JwtService } from './jwt.service';
import { RegisterDto, LoginDto } from '../zod-schames/auth.schemas';
import { AppEntity, createCustomCuid, throwHttpException } from '../utils';
import { CacheManagerService, DataType } from '../cache/cache-manager.service';
import { ConflictError, UnauthorizedError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { BillingService } from '../billing/billing.service';
import { OrganizationPlan } from '@shared/models/organization-config.model';
import { LoginRateLimitService } from './login-rate-limit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly clsService: ClsService,
    private readonly billingService: BillingService,
    private readonly loginRateLimitService: LoginRateLimitService,
  ) {}

  async register(data: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: data.email,
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

    // 3. Create organization and user in a transaction
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
          email: data.email,
          passwordHash,
          organizationId: organization.id,
          isOwner: true,
        },
      });

      return { user, organization };
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
    ]);

    const selectedPlan = (data.plan ??
      OrganizationPlan.FREE) as OrganizationPlan;
    const shouldCreateCheckout =
      selectedPlan === OrganizationPlan.STARTER ||
      selectedPlan === OrganizationPlan.PRO;

    const checkout = shouldCreateCheckout
      ? await this.billingService.createCheckout({
          organizationId: result.organization.id,
          userId: result.user.id,
          plan: selectedPlan,
        })
      : null;

    // 4. Generate JWT token
    const tokens = this.jwtService.generateTokens({
      userId: result.user.id,
      organizationId: result.user.organizationId,
    });

    return {
      user: result.user,
      organization: result.organization,
      checkoutUrl: checkout?.checkoutUrl ?? null,
      ...tokens,
    };
  }

  async login(data: LoginDto, ip: string | null) {
    await this.loginRateLimitService.assertNotBlocked(ip);

    // 1. Find user
    const user = await this.prisma.user.findFirst({
      where: {
        email: data.email,
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

    // 3. Blacklist the OLD token via CacheManager
    await this.blacklistRefreshToken(payload as RefreshTokenPayload);

    return this.jwtService.generateTokens({
      userId: payload.userId,
      organizationId: payload.organizationId,
    });
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
