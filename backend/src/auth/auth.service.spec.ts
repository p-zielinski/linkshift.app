import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { AuthService } from './auth.service';
import { SubdomainBlacklistService } from '../security/subdomain-blacklist.service';
import { OrganizationBootstrapService } from '../organization/organization-bootstrap.service';
import { DataType } from '../cache/cache-manager.service';

jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'a1b2c3d4e5',
}));

type AuthServicePrivate = AuthService & {
  normalizeOrganizationNameForSubdomain(value: string): string;
  resolveOrganizationName(
    providedOrganizationName: string | undefined,
    normalizedEmail: string,
  ): string;
  resolveInitialSubdomainName(
    tx: {
      linkShiftSubdomain: {
        findFirst: jest.Mock<Promise<{ id: string } | null>, any>;
      };
    },
    organizationName: string,
  ): Promise<string>;
};

describe('AuthService - starter subdomain normalization', () => {
  let service: AuthServicePrivate;
  let subdomainBlacklistService: { isReserved: jest.Mock<boolean, [string]> };

  beforeEach(() => {
    subdomainBlacklistService = {
      isReserved: jest.fn().mockReturnValue(false),
    };

    service = new AuthService(
      {} as any,
      {} as any,
      {} as any,
      { getId: jest.fn().mockReturnValue('req_test') } as unknown as ClsService,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      subdomainBlacklistService as unknown as SubdomainBlacklistService,
      {} as unknown as OrganizationBootstrapService,
      {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        setContext: jest.fn(),
      } as unknown as Logger,
    ) as AuthServicePrivate;
  });

  it('normalizes SQL-like payload to a safe slug', () => {
    const normalized = service.normalizeOrganizationNameForSubdomain(
      "Acme'; DROP TABLE users; --",
    );

    expect(normalized).toBe('acme-drop-table-users');
    expect(normalized).toMatch(/^[a-z0-9-]+$/);
  });

  it('removes diacritics and collapses separators', () => {
    const normalized = service.normalizeOrganizationNameForSubdomain(
      'Zażółć   Gęślą___Jaźń',
    );

    expect(normalized).toBe('zazo-c-gesla-jazn');
  });

  it('falls back to default value when input has no allowed characters', () => {
    const normalized = service.normalizeOrganizationNameForSubdomain('🔥🔥🔥');
    expect(normalized).toBe('org');
  });

  it('uses provided organization name when available', () => {
    const resolved = service.resolveOrganizationName(
      'Acme Team',
      'owner@example.com',
    );
    expect(resolved).toBe('Acme Team');
  });

  it('derives organization name from email prefix when missing', () => {
    const resolved = service.resolveOrganizationName(
      undefined,
      'john.doe+dev@example.com',
    );
    expect(resolved).toBe('john-doe-dev');
  });

  it('falls back to default organization name when email prefix has no letters', () => {
    const resolved = service.resolveOrganizationName(undefined, '12345@example.com');
    expect(resolved).toBe('Organization');
  });

  it('uses fallback with random 10-char suffix when base name is unavailable', async () => {
    const tx = {
      linkShiftSubdomain: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce({ id: 'sub_existing' })
          .mockResolvedValueOnce(null),
      },
    };

    const resolved = await service.resolveInitialSubdomainName(tx, 'Acme');

    expect(resolved).toBe('acmea1b2c3d4e5');
    expect(tx.linkShiftSubdomain.findFirst).toHaveBeenCalledTimes(2);
  });

  it('skips DB check for reserved base names and retries with suffix', async () => {
    subdomainBlacklistService.isReserved.mockImplementation(
      (name: string) => name === 'admin',
    );

    const tx = {
      linkShiftSubdomain: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    const resolved = await service.resolveInitialSubdomainName(tx, 'admin');

    expect(resolved).toBe('admina1b2c3d4e5');
    expect(tx.linkShiftSubdomain.findFirst).toHaveBeenCalledTimes(1);
  });
});

describe('AuthService.register', () => {
  let service: AuthService;
  let prisma: {
    user: { findFirst: jest.Mock };
    $transaction: jest.Mock;
  };
  let cacheManagerService: {
    setDataExist: jest.Mock;
  };
  let organizationBootstrapService: {
    provisionStarterResourcesInTransaction: jest.Mock;
    invalidateStarterResourcesCache: jest.Mock;
  };
  let legalService: {
    buildConsentRecord: jest.Mock;
  };
  let authTokenService: {
    createToken: jest.Mock;
  };
  let emailService: {
    sendVerificationEmail: jest.Mock;
  };
  let jwtService: {
    generateTokens: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn(),
    };
    cacheManagerService = {
      setDataExist: jest.fn().mockResolvedValue(undefined),
    };
    organizationBootstrapService = {
      provisionStarterResourcesInTransaction: jest.fn().mockResolvedValue({
        linkMap: { id: 'lmap_starter' },
        redirectRule: { id: 'rule_starter' },
      }),
      invalidateStarterResourcesCache: jest.fn().mockResolvedValue(undefined),
    };
    legalService = {
      buildConsentRecord: jest.fn().mockReturnValue({
        termsAcceptedAt: new Date('2026-01-01T00:00:00.000Z'),
        privacyAcceptedAt: new Date('2026-01-01T00:00:00.000Z'),
        ageConfirmedAt: new Date('2026-01-01T00:00:00.000Z'),
        legalVersion: '2026-01',
      }),
    };
    authTokenService = {
      createToken: jest.fn().mockResolvedValue('verification-token'),
    };
    emailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    };
    jwtService = {
      generateTokens: jest.fn().mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    };

    prisma.$transaction.mockImplementation(async (callback) =>
      callback({
        organization: {
          create: jest.fn().mockResolvedValue({
            id: 'org_test',
            name: 'Acme',
          }),
        },
        user: {
          create: jest.fn().mockResolvedValue({
            id: 'usr_test',
            email: 'owner@example.com',
            passwordHash: 'hashed-password',
            organizationId: 'org_test',
            isOwner: true,
          }),
        },
        domainGroup: {
          create: jest.fn().mockResolvedValue({
            id: 'dmg_test',
            name: 'Default',
            organizationId: 'org_test',
          }),
        },
        linkShiftSubdomain: {
          create: jest.fn().mockResolvedValue({
            id: 'sub_test',
            name: 'acme',
            domainGroupId: 'dmg_test',
          }),
          findFirst: jest.fn().mockResolvedValue(null),
        },
      }),
    );

    service = new AuthService(
      prisma as any,
      jwtService as any,
      cacheManagerService as any,
      { getId: jest.fn().mockReturnValue('req_test') } as unknown as ClsService,
      {} as any,
      emailService as any,
      authTokenService as any,
      legalService as any,
      {
        isReserved: jest.fn().mockReturnValue(false),
      } as unknown as SubdomainBlacklistService,
      organizationBootstrapService as unknown as OrganizationBootstrapService,
      {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        setContext: jest.fn(),
      } as unknown as Logger,
    );
  });

  it('provisions starter resources during registration and invalidates caches', async () => {
    const result = await service.register({
      email: 'owner@example.com',
      password: 'password123',
      organizationName: 'Acme',
      acceptTerms: true,
      acceptPrivacy: true,
      confirmAge: true,
    });

    expect(
      organizationBootstrapService.provisionStarterResourcesInTransaction,
    ).toHaveBeenCalledWith(expect.any(Object), {
      domainGroupId: 'dmg_test',
    });
    expect(
      organizationBootstrapService.invalidateStarterResourcesCache,
    ).toHaveBeenCalledWith({
      domainGroupId: 'dmg_test',
      linkMapId: 'lmap_starter',
    });
    expect(cacheManagerService.setDataExist).toHaveBeenCalledWith({
      dataType: DataType.DOMAIN_GROUPS,
      data: expect.objectContaining({ id: 'dmg_test' }),
    });
    expect(result.user).toEqual(
      expect.objectContaining({
        id: 'usr_test',
        email: 'owner@example.com',
      }),
    );
    expect(result.accessToken).toBe('access-token');
  });
});
