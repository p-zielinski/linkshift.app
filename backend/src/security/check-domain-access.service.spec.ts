import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { CheckDomainAccessService } from './check-domain-access.service';

describe('CheckDomainAccessService', () => {
  let service: CheckDomainAccessService;
  let configGet: jest.Mock;

  beforeEach(async () => {
    configGet = jest.fn().mockReturnValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckDomainAccessService,
        {
          provide: ConfigService,
          useValue: {
            get: configGet,
          },
        },
        {
          provide: Logger,
          useValue: {
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CheckDomainAccessService>(CheckDomainAccessService);
    service.onModuleInit();
  });

  describe('normalizeClientIp', () => {
    it('normalizes IPv4-mapped IPv6 addresses', () => {
      expect(service.normalizeClientIp('::ffff:10.0.0.5')).toBe('10.0.0.5');
      expect(service.normalizeClientIp('::FFFF:192.168.1.1')).toBe('192.168.1.1');
    });

    it('returns null for empty or invalid values', () => {
      expect(service.normalizeClientIp(undefined)).toBeNull();
      expect(service.normalizeClientIp('')).toBeNull();
      expect(service.normalizeClientIp('not-an-ip')).toBeNull();
    });
  });

  describe('isAllowed', () => {
    it('allows loopback IPv4 and IPv6', () => {
      expect(service.isAllowed('127.0.0.1')).toBe(true);
      expect(service.isAllowed('127.255.0.1')).toBe(true);
      expect(service.isAllowed('::1')).toBe(true);
    });

    it('allows RFC1918 private ranges', () => {
      expect(service.isAllowed('10.1.2.3')).toBe(true);
      expect(service.isAllowed('172.16.0.1')).toBe(true);
      expect(service.isAllowed('172.31.255.255')).toBe(true);
      expect(service.isAllowed('192.168.0.10')).toBe(true);
    });

    it('allows link-local addresses', () => {
      expect(service.isAllowed('169.254.10.20')).toBe(true);
    });

    it('allows IPv4-mapped private addresses', () => {
      expect(service.isAllowed('::ffff:172.18.0.2')).toBe(true);
    });

    it('denies public addresses by default', () => {
      expect(service.isAllowed('8.8.8.8')).toBe(false);
      expect(service.isAllowed('95.217.107.125')).toBe(false);
      expect(service.isAllowed('2001:4860:4860::8888')).toBe(false);
    });

    it('allows extra configured IPs and CIDRs', async () => {
      configGet.mockImplementation((key: string) => {
        if (key === 'CADDY_CHECK_DOMAIN_ALLOWED_IPS') {
          return '95.217.107.125/32,203.0.113.0/24';
        }
        return undefined;
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CheckDomainAccessService,
          {
            provide: ConfigService,
            useValue: { get: configGet },
          },
          {
            provide: Logger,
            useValue: { warn: jest.fn() },
          },
        ],
      }).compile();

      const configuredService = module.get<CheckDomainAccessService>(
        CheckDomainAccessService,
      );
      configuredService.onModuleInit();

      expect(configuredService.isAllowed('95.217.107.125')).toBe(true);
      expect(configuredService.isAllowed('203.0.113.44')).toBe(true);
      expect(configuredService.isAllowed('203.0.114.1')).toBe(false);
    });

    it('treats single extra IPs as host routes', async () => {
      configGet.mockImplementation((key: string) => {
        if (key === 'CADDY_CHECK_DOMAIN_ALLOWED_IPS') {
          return '198.51.100.9';
        }
        return undefined;
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CheckDomainAccessService,
          {
            provide: ConfigService,
            useValue: { get: configGet },
          },
          {
            provide: Logger,
            useValue: { warn: jest.fn() },
          },
        ],
      }).compile();

      const configuredService = module.get<CheckDomainAccessService>(
        CheckDomainAccessService,
      );
      configuredService.onModuleInit();

      expect(configuredService.isAllowed('198.51.100.9')).toBe(true);
      expect(configuredService.isAllowed('198.51.100.10')).toBe(false);
    });
  });

  describe('isAllowedRequest', () => {
    it('uses request ip with trust proxy semantics', () => {
      expect(service.isAllowedRequest({ ip: '10.0.0.12' })).toBe(true);
      expect(service.isAllowedRequest({ ip: '1.2.3.4' })).toBe(false);
    });
  });
});
