import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { AuthService } from './auth.service';
import { OrganizationBootstrapService } from '../organization/organization-bootstrap.service';
import { DataType } from '../cache/cache-manager.service';

type AuthServicePrivate = AuthService & {
  resolveOrganizationName(
    providedOrganizationName: string | undefined,
    normalizedEmail: string,
  ): string;
};

describe('AuthService - organization name resolution', () => {
  let service: AuthServicePrivate;

  beforeEach(() => {
    service = new AuthService(
      {} as any,
      {} as any,
      {} as any,
      { getId: jest.fn().mockReturnValue('req_test') } as unknown as ClsService,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
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

  it('provisions starter resources during registration without creating a subdomain', async () => {
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
    expect(cacheManagerService.setDataExist).not.toHaveBeenCalledWith(
      expect.objectContaining({ dataType: DataType.SUBDOMAINS }),
    );
    expect(result.user).toEqual(
      expect.objectContaining({
        id: 'usr_test',
        email: 'owner@example.com',
      }),
    );
    expect(result.accessToken).toBe('access-token');
  });
});
