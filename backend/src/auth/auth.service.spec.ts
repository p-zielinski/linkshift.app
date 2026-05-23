import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { AuthService } from './auth.service';
import { SubdomainBlacklistService } from '../security/subdomain-blacklist.service';

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
