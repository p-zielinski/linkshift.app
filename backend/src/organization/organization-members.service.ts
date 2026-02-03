import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ClsService } from 'nestjs-cls';
import { OrganizationService } from './organization.service';
import { EmailService } from '../email/email.service';
import { AppEntity, createCustomCuid, throwHttpException } from '../utils';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '@shared/models/error.model';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthTokenService } from '../auth/auth-token.service';
import { CacheManagerService, DataType } from '../cache/cache-manager.service';
import { LegalService } from '../legal/legal.service';
import { Logger } from 'nestjs-pino';

const INVITE_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class OrganizationMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
    private readonly organizationService: OrganizationService,
    private readonly emailService: EmailService,
    private readonly authTokenService: AuthTokenService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly legalService: LegalService,
    private readonly logger: Logger,
  ) {
  }

  async createInvite(params: {
    organizationId: string;
    inviterId: string;
    email: string;
  }) {
    const inviter = await this.assertOwner(params.inviterId, params.organizationId);
    await this.organizationService.checkActiveUserLimit(params.organizationId);

    const normalizedEmail = params.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' }, deletedAt: null },
    });
    if (existingUser) {
      return throwHttpException(
        new ConflictError({
          requestId: this.cls.getId(),
          details: `User with email ${normalizedEmail} already exists.`,
        }),
      );
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: params.organizationId, deletedAt: null },
    });
    if (!organization) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.cls.getId(),
          details: `Organization ${params.organizationId} not found.`,
          relatedObject: 'Organization',
          relatedObjectId: params.organizationId,
        }),
      );
    }

    const token = this.generateInviteToken();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    await this.prisma.organizationInvite.updateMany({
      where: {
        organizationId: params.organizationId,
        email: normalizedEmail,
        acceptedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    const invite = await this.prisma.organizationInvite.create({
      data: {
        id: createCustomCuid(AppEntity.OrganizationInvite),
        organizationId: params.organizationId,
        email: normalizedEmail,
        tokenHash,
        expiresAt,
        createdByUserId: params.inviterId,
      },
    });

    await this.emailService.sendOrganizationInvite({
      email: normalizedEmail,
      inviter: inviter.email,
      organization: organization.name,
      token,
    });

    return {
      id: invite.id,
      email: invite.email,
      expiresAt: invite.expiresAt,
    };
  }

  async lookupInvite(token: string) {
    const invite = await this.findInviteByToken(token);
    if (!invite) {
      return null;
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: invite.organizationId },
    });
    return {
      email: invite.email,
      organizationName: organization?.name ?? 'Organization',
      expiresAt: invite.expiresAt,
    };
  }

  async registerFromInvite(params: {
    token: string;
    email: string;
    password: string;
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    confirmAge: boolean;
  }) {
    const invite = await this.findInviteByToken(params.token);
    if (!invite) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.cls.getId(),
          details: 'Invite link is invalid or has expired.',
        }),
      );
    }

    const normalizedEmail = params.email.trim().toLowerCase();
    if (invite.email !== normalizedEmail) {
      return throwHttpException(
        new ForbiddenError({
          requestId: this.cls.getId(),
          details: 'Invite email does not match.',
        }),
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' }, deletedAt: null },
    });
    if (existingUser) {
      return throwHttpException(
        new ConflictError({
          requestId: this.cls.getId(),
          details: `User with email ${normalizedEmail} already exists.`,
        }),
      );
    }

    const passwordHash = await bcrypt.hash(params.password, 10);
    const legalConsent = this.legalService.buildConsentRecord();

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          id: createCustomCuid(AppEntity.User),
          email: normalizedEmail,
          passwordHash,
          organizationId: invite.organizationId,
          isOwner: false,
          isBlocked: true,
          blockedAt: new Date(),
          ...legalConsent,
        },
      });

      await tx.organizationInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return created;
    });

    await this.cacheManagerService.setDataExist({
      dataType: DataType.USERS,
      data: user as any,
    });

    const verificationToken = await this.authTokenService.createToken(
      'email_verification',
      {
        userId: user.id,
        email: normalizedEmail,
      },
    );
    await this.emailService.sendVerificationEmail({
      email: normalizedEmail,
      token: verificationToken,
    });

    return { success: true };
  }

  async listMembers(params: { organizationId: string; requesterId: string }) {
    await this.assertMember(params.requesterId, params.organizationId);

    return this.prisma.user.findMany({
      where: {
        organizationId: params.organizationId,
        deletedAt: null,
      },
      orderBy: [{ isOwner: 'desc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        email: true,
        isOwner: true,
        isBlocked: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateMemberStatus(params: {
    organizationId: string;
    requesterId: string;
    userId: string;
    blocked: boolean;
  }) {
    await this.assertOwner(params.requesterId, params.organizationId);

    const user = await this.prisma.user.findFirst({
      where: {
        id: params.userId,
        organizationId: params.organizationId,
        deletedAt: null,
      },
    });

    if (!user) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.cls.getId(),
          details: `User ${params.userId} not found.`,
          relatedObject: 'User',
          relatedObjectId: params.userId,
        }),
      );
    }

    if (user.isOwner) {
      return throwHttpException(
        new ForbiddenError({
          requestId: this.cls.getId(),
          details: 'Owners cannot be blocked.',
        }),
      );
    }

    if (!params.blocked) {
      await this.organizationService.checkActiveUserLimit(params.organizationId);
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isBlocked: params.blocked,
        blockedAt: params.blocked ? new Date() : null,
      },
    });

    await this.cacheManagerService.setDataExist({
      dataType: DataType.USERS,
      data: updated as any,
    });

    return {
      id: updated.id,
      email: updated.email,
      isOwner: updated.isOwner,
      isBlocked: updated.isBlocked,
      emailVerifiedAt: updated.emailVerifiedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  private async assertOwner(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!user || !user.isOwner) {
      return throwHttpException(
        new ForbiddenError({
          requestId: this.cls.getId(),
          details: 'Only organization owners can perform this action.',
        }),
      );
    }

    return user;
  }

  private async assertMember(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!user) {
      return throwHttpException(
        new ForbiddenError({
          requestId: this.cls.getId(),
          details: 'Organization membership required.',
        }),
      );
    }

    return user;
  }

  private async findInviteByToken(token: string) {
    if (!token) {
      return null;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const invite = await this.prisma.organizationInvite.findFirst({
      where: {
        tokenHash,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    return invite;
  }

  private generateInviteToken(): string {
    return (
      crypto.randomUUID().replace(/-/g, '') +
      crypto.randomUUID().replace(/-/g, '')
    );
  }
}
