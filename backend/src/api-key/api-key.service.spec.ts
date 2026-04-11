import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { OrganizationPlan, OrganizationSubscription } from '@shared/models/organization-config.model';
import { ApiKeyService } from './api-key.service';
import { PrismaService } from '../prisma.service';
import {
  CacheManagerService,
  CachedByProperty,
  DataType,
  RateLimitScope,
} from '../cache/cache-manager.service';
import { OrganizationService } from '../organization/organization.service';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let prisma: {
    apiKey: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let cacheManager: {
    setDataExist: jest.Mock;
    getData: jest.Mock;
    checkRateLimit: jest.Mock;
    invalidateData: jest.Mock;
  };
  let organizationService: {
    getConfiguration: jest.Mock;
    getEffectiveSubscription: jest.Mock;
  };

  const mockApiKey = {
    id: 'apk_1',
    organizationId: 'org_1',
    name: 'Deploy integration',
    tokenHash: 'hash_123',
    tokenPrefix: 'lsk_live_abcd1234',
    expiresAt: null,
    lastUsedAt: null,
    createdAt: new Date('2026-04-10T10:00:00.000Z'),
    updatedAt: new Date('2026-04-10T10:00:00.000Z'),
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      apiKey: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    cacheManager = {
      setDataExist: jest.fn(),
      getData: jest.fn(),
      checkRateLimit: jest.fn(),
      invalidateData: jest.fn(),
    };

    organizationService = {
      getConfiguration: jest.fn(),
      getEffectiveSubscription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: CacheManagerService,
          useValue: cacheManager,
        },
        {
          provide: OrganizationService,
          useValue: organizationService,
        },
        {
          provide: ClsService,
          useValue: {
            getId: jest.fn().mockReturnValue('req_1'),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            setContext: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ApiKeyService);
  });

  it('enforces API key quota for paid plans with finite limits', async () => {
    prisma.apiKey.count.mockResolvedValue(1);
    const subscription = new OrganizationSubscription({
      plan: OrganizationPlan.BASIC,
      limits: {
        maxDomainGroups: 1,
        maxDomainsPerGroup: 10,
        maxTotalDomains: 10,
        maxRulesPerGroup: 250,
        maxTotalRules: 250,
        maxTestsPerGroup: 500,
        maxTotalTests: 500,
        maxUsers: 3,
        redirectionLimitPerMinute: 50,
        maxApiKeys: 1,
        apiKeyCallsPerMinute: 10,
        maxLinkMaps: 5,
        maxLinkMapEntriesTotal: 5000,
        maxLinkMapEntriesPerMap: 2000,
        analyticsRetentionDays: 30,
      },
    });

    organizationService.getConfiguration.mockResolvedValue({});
    organizationService.getEffectiveSubscription.mockReturnValue(subscription);

    await expect(
      service.create('org_1', { name: 'CLI', expiresAt: null }),
    ).rejects.toHaveProperty('status', 402);
  });

  it('invalidates cache entries on expiresAt update', async () => {
    prisma.apiKey.findFirst.mockResolvedValue(mockApiKey);
    prisma.apiKey.update.mockResolvedValue({
      ...mockApiKey,
      expiresAt: new Date('2026-05-10T10:00:00.000Z'),
      updatedAt: new Date('2026-04-11T10:00:00.000Z'),
    });

    await service.update('apk_1', 'org_1', {
      expiresAt: new Date('2026-05-10T10:00:00.000Z'),
    });

    expect(cacheManager.invalidateData).toHaveBeenCalledWith({
      dataType: DataType.API_KEYS,
      properties: {
        [CachedByProperty.ID]: 'apk_1',
      },
    });
    expect(cacheManager.invalidateData).toHaveBeenCalledWith({
      dataType: DataType.API_KEYS,
      properties: {
        [CachedByProperty.TOKEN_HASH]: 'hash_123',
      },
    });
  });

  it('invalidates cache entries on delete', async () => {
    prisma.apiKey.findFirst.mockResolvedValue(mockApiKey);
    prisma.apiKey.update.mockResolvedValue({
      ...mockApiKey,
      deletedAt: new Date('2026-04-11T10:00:00.000Z'),
    });

    await service.delete('apk_1', 'org_1');

    expect(cacheManager.invalidateData).toHaveBeenCalledWith({
      dataType: DataType.API_KEYS,
      properties: {
        [CachedByProperty.ID]: 'apk_1',
      },
    });
    expect(cacheManager.invalidateData).toHaveBeenCalledWith({
      dataType: DataType.API_KEYS,
      properties: {
        [CachedByProperty.TOKEN_HASH]: 'hash_123',
      },
    });
  });

  it('returns payment required for free-tier API key usage', async () => {
    cacheManager.getData.mockResolvedValue(mockApiKey);
    const freeSubscription = new OrganizationSubscription({
      plan: OrganizationPlan.FREE,
    });

    organizationService.getConfiguration.mockResolvedValue({});
    organizationService.getEffectiveSubscription.mockReturnValue(freeSubscription);

    await expect(service.authenticate('lsk_live_token')).rejects.toHaveProperty(
      'status',
      402,
    );
    expect(cacheManager.checkRateLimit).not.toHaveBeenCalled();
  });

  it('blocks API key usage when active keys exceed subscription quota', async () => {
    cacheManager.getData.mockResolvedValue(mockApiKey);
    prisma.apiKey.count.mockResolvedValue(2);

    const basicSubscription = new OrganizationSubscription({
      plan: OrganizationPlan.BASIC,
      limits: {
        maxDomainGroups: 1,
        maxDomainsPerGroup: 10,
        maxTotalDomains: 10,
        maxRulesPerGroup: 250,
        maxTotalRules: 250,
        maxTestsPerGroup: 500,
        maxTotalTests: 500,
        maxUsers: 3,
        redirectionLimitPerMinute: 50,
        maxApiKeys: 1,
        apiKeyCallsPerMinute: 10,
        maxLinkMaps: 5,
        maxLinkMapEntriesTotal: 5000,
        maxLinkMapEntriesPerMap: 2000,
        analyticsRetentionDays: 30,
      },
    });

    organizationService.getConfiguration.mockResolvedValue({});
    organizationService.getEffectiveSubscription.mockReturnValue(basicSubscription);

    await expect(service.authenticate('lsk_live_token')).rejects.toMatchObject({
      status: 402,
      response: expect.objectContaining({
        details: expect.stringContaining(
          'exceeded the subscription limit for the number of API keys',
        ),
      }),
    });

    expect(cacheManager.checkRateLimit).not.toHaveBeenCalled();
  });

  it('applies per-key rate limits for paid plans', async () => {
    cacheManager.getData.mockResolvedValue(mockApiKey);

    const basicSubscription = new OrganizationSubscription({
      plan: OrganizationPlan.BASIC,
      limits: {
        maxDomainGroups: 1,
        maxDomainsPerGroup: 10,
        maxTotalDomains: 10,
        maxRulesPerGroup: 250,
        maxTotalRules: 250,
        maxTestsPerGroup: 500,
        maxTotalTests: 500,
        maxUsers: 3,
        redirectionLimitPerMinute: 50,
        maxApiKeys: 1,
        apiKeyCallsPerMinute: 10,
        maxLinkMaps: 5,
        maxLinkMapEntriesTotal: 5000,
        maxLinkMapEntriesPerMap: 2000,
        analyticsRetentionDays: 30,
      },
    });

    organizationService.getConfiguration.mockResolvedValue({});
    organizationService.getEffectiveSubscription.mockReturnValue(basicSubscription);

    const result = await service.authenticate('lsk_live_token');

    expect(result).toEqual({
      organizationId: 'org_1',
      apiKeyId: 'apk_1',
    });
    expect(cacheManager.checkRateLimit).toHaveBeenCalledWith(
      RateLimitScope.API_KEY,
      'apk_1',
      10,
    );
  });
});
