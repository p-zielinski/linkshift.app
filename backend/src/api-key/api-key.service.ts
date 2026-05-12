import { Injectable } from '@nestjs/common';
import { ApiKey } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service';
import {
  CachedByProperty,
  CacheManagerService,
  DataType,
  RateLimitScope,
} from '../cache/cache-manager.service';
import { OrganizationService } from '../organization/organization.service';
import { AppEntity, createCustomCuid, throwHttpException } from '../utils';
import {
  NotFoundError,
  PaymentRequiredError,
  UnauthorizedError,
} from '@shared/models/error.model';
import { QueryResult } from '@shared/models/query-result.model';
import * as apiKeySchemas from '../zod-schames/api-key.schemas';

type ApiKeyListItem = {
  id: string;
  name: string;
  tokenPrefix: string;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ApiKeyCreateResponse = ApiKeyListItem & {
  key: string;
};

type ApiKeyAuthContext = {
  organizationId: string;
  apiKeyId: string;
};

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly organizationService: OrganizationService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  async listForOrganization(
    organizationId: string,
  ): Promise<QueryResult<ApiKeyListItem>> {
    const keys = await this.prisma.apiKey.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return new QueryResult<ApiKeyListItem>({
      dataType: DataType.API_KEYS,
      data: keys.map((key) => this.mapApiKey(key)),
    });
  }

  async create(
    organizationId: string,
    payload: apiKeySchemas.CreateApiKeyDto,
  ): Promise<ApiKeyCreateResponse> {
    const subscription = await this.getEffectiveSubscription(organizationId);
    await this.checkKeyQuota(organizationId, subscription.getApiKeyQuota());

    const key = this.generateRawKey();
    const tokenHash = this.hashToken(key);

    const created = await this.prisma.apiKey.create({
      data: {
        id: createCustomCuid(AppEntity.ApiKey),
        organizationId,
        name: payload.name.trim(),
        tokenHash,
        tokenPrefix: this.getTokenPrefix(key),
        expiresAt: payload.expiresAt ?? null,
      },
    });

    await this.cacheManagerService.setDataExist<ApiKey>({
      dataType: DataType.API_KEYS,
      data: created,
    });

    return {
      ...this.mapApiKey(created),
      key,
    };
  }

  async getById(id: string, organizationId: string): Promise<ApiKeyListItem> {
    const apiKey = await this.findActiveApiKey(id, organizationId);
    return this.mapApiKey(apiKey);
  }

  async update(
    id: string,
    organizationId: string,
    payload: apiKeySchemas.UpdateApiKeyDto,
  ): Promise<ApiKeyListItem> {
    const existing = await this.findActiveApiKey(id, organizationId);

    const updated = await this.prisma.apiKey.update({
      where: { id: existing.id },
      data: {
        name: payload.name?.trim() ?? existing.name,
        expiresAt:
          payload.expiresAt !== undefined
            ? payload.expiresAt
            : existing.expiresAt,
      },
    });

    await this.invalidateApiKeyCache(updated);
    await this.cacheManagerService.setDataExist<ApiKey>({
      dataType: DataType.API_KEYS,
      data: updated,
    });

    return this.mapApiKey(updated);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const existing = await this.findActiveApiKey(id, organizationId);

    const deleted = await this.prisma.apiKey.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.invalidateApiKeyCache(deleted);
  }

  async authenticate(rawToken: string): Promise<ApiKeyAuthContext> {
    const token = rawToken.trim();
    if (!token) {
      return this.throwUnauthorized();
    }

    const tokenHash = this.hashToken(token);
    const apiKey = await this.cacheManagerService.getData<ApiKey>({
      dataType: DataType.API_KEYS,
      properties: {
        [CachedByProperty.TOKEN_HASH]: tokenHash,
      },
    });

    if (!apiKey) {
      return this.throwUnauthorized();
    }

    if (this.isExpired(apiKey.expiresAt)) {
      await this.invalidateApiKeyCache(apiKey);
      return this.throwUnauthorized();
    }

    const subscription = await this.getEffectiveSubscription(
      apiKey.organizationId,
    );

    if (!subscription.canUseApiAccess()) {
      return throwHttpException(
        new PaymentRequiredError({
          requestId: this.clsService.getId(),
          feature: 'api_access',
          details:
            'API key usage is available on paid plans only. Upgrade your subscription to use API access.',
        }),
      );
    }

    await this.ensureApiKeyCountWithinPlanLimit(
      apiKey.organizationId,
      subscription.getApiKeyQuota(),
    );

    await this.cacheManagerService.checkRateLimit(
      RateLimitScope.API_KEY,
      apiKey.id,
      subscription.getApiKeyCallsPerMinute(),
    );

    return {
      organizationId: apiKey.organizationId,
      apiKeyId: apiKey.id,
    };
  }

  private async checkKeyQuota(
    organizationId: string,
    maxApiKeys: number | null,
  ): Promise<void> {
    if (maxApiKeys === null) {
      return;
    }

    const keysCount = await this.prisma.apiKey.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    if (keysCount >= maxApiKeys) {
      return throwHttpException(
        new PaymentRequiredError({
          requestId: this.clsService.getId(),
          feature: 'api_access',
          details: `API key quota reached (${keysCount}/${maxApiKeys}). Upgrade your plan to create more keys.`,
        }),
      );
    }
  }

  private async ensureApiKeyCountWithinPlanLimit(
    organizationId: string,
    maxApiKeys: number | null,
  ): Promise<void> {
    if (maxApiKeys === null) {
      return;
    }

    const keysCount = await this.prisma.apiKey.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    if (keysCount > maxApiKeys) {
      return throwHttpException(
        new PaymentRequiredError({
          requestId: this.clsService.getId(),
          feature: 'api_access',
          details:
            `Your organization has exceeded the subscription limit for the number of API keys (${keysCount}/${maxApiKeys}). ` +
            'Please remove API keys until usage is within the plan limit, or upgrade your subscription.',
        }),
      );
    }
  }

  private async getEffectiveSubscription(organizationId: string) {
    const config =
      await this.organizationService.getConfiguration(organizationId);
    return this.organizationService.getEffectiveSubscription(config);
  }

  private async findActiveApiKey(
    id: string,
    organizationId: string,
  ): Promise<ApiKey> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!apiKey) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `API key ${id} not found`,
          relatedObject: 'ApiKey',
          relatedObjectId: id,
        }),
      );
    }

    return apiKey;
  }

  private mapApiKey(key: ApiKey): ApiKeyListItem {
    return {
      id: key.id,
      name: key.name,
      tokenPrefix: key.tokenPrefix,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    };
  }

  private async invalidateApiKeyCache(
    key: Pick<ApiKey, 'id' | 'tokenHash'>,
  ): Promise<void> {
    await Promise.all([
      this.cacheManagerService.invalidateData({
        dataType: DataType.API_KEYS,
        properties: {
          [CachedByProperty.ID]: key.id,
        },
      }),
      this.cacheManagerService.invalidateData({
        dataType: DataType.API_KEYS,
        properties: {
          [CachedByProperty.TOKEN_HASH]: key.tokenHash,
        },
      }),
    ]);
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private generateRawKey(): string {
    const random = crypto.randomBytes(32).toString('base64url');
    return `lsk_live_${random}`;
  }

  private getTokenPrefix(rawToken: string): string {
    return rawToken.slice(0, 16);
  }

  private isExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) {
      return false;
    }
    return expiresAt.getTime() <= Date.now();
  }

  private throwUnauthorized(): never {
    this.logger.warn('API key authentication failed', {
      requestId: this.clsService.getId(),
    });

    return throwHttpException(
      new UnauthorizedError({
        requestId: this.clsService.getId(),
        details: 'Missing or invalid API key.',
      }),
    );
  }
}
