import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { promises as dnsPromises } from 'dns';
import { DnsVerificationService } from './dns-verification.service';
import { CacheManagerService } from '../cache/cache-manager.service';

jest.mock('dns', () => ({
  promises: {
    resolve4: jest.fn(),
    resolveCname: jest.fn(),
  },
}));

describe('DnsVerificationService', () => {
  let service: DnsVerificationService;
  let cacheManagerService: {
    getCustomCache: jest.Mock;
    setCustomCache: jest.Mock;
  };

  const resolve4 = dnsPromises.resolve4 as jest.Mock;
  const resolveCname = dnsPromises.resolveCname as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    cacheManagerService = {
      getCustomCache: jest.fn().mockResolvedValue(undefined),
      setCustomCache: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DnsVerificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'APP_DOMAIN_TARGET_IP') {
                return '203.0.113.10';
              }
              return undefined;
            }),
          },
        },
        {
          provide: CacheManagerService,
          useValue: cacheManagerService,
        },
        {
          provide: Logger,
          useValue: {
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(DnsVerificationService);
  });

  describe('pointsToTarget', () => {
    it('returns true when A record matches target IP', async () => {
      resolve4.mockResolvedValue(['203.0.113.10']);
      resolveCname.mockRejectedValue(new Error('ENODATA'));

      await expect(service.pointsToTarget('example.com')).resolves.toBe(true);
      expect(resolve4).toHaveBeenCalledWith('example.com');
    });

    it('follows CNAME chain before comparing A records', async () => {
      resolveCname.mockResolvedValue(['target.example.com.']);
      resolve4.mockResolvedValue(['203.0.113.10']);

      await expect(service.pointsToTarget('www.example.com')).resolves.toBe(true);
      expect(resolveCname).toHaveBeenCalledWith('www.example.com');
      expect(resolve4).toHaveBeenCalledWith('target.example.com');
    });

    it('returns false when A records do not include target IP', async () => {
      resolve4.mockResolvedValue(['198.51.100.1']);
      resolveCname.mockRejectedValue(new Error('ENODATA'));

      await expect(service.pointsToTarget('example.com')).resolves.toBe(false);
    });

    it('returns false when APP_DOMAIN_TARGET_IP is empty', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DnsVerificationService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(''),
            },
          },
          {
            provide: CacheManagerService,
            useValue: cacheManagerService,
          },
          {
            provide: Logger,
            useValue: {
              warn: jest.fn(),
              debug: jest.fn(),
            },
          },
        ],
      }).compile();

      const emptyTargetService = module.get(DnsVerificationService);

      await expect(emptyTargetService.pointsToTarget('example.com')).resolves.toBe(
        false,
      );
      expect(resolve4).not.toHaveBeenCalled();
    });
  });

  describe('getCachedOrVerify', () => {
    it('returns cached value without DNS lookup', async () => {
      cacheManagerService.getCustomCache.mockResolvedValue(true);

      await expect(service.getCachedOrVerify('example.com')).resolves.toBe(true);
      expect(resolve4).not.toHaveBeenCalled();
    });

    it('stores DNS lookup result in cache', async () => {
      resolve4.mockResolvedValue(['203.0.113.10']);
      resolveCname.mockRejectedValue(new Error('ENODATA'));

      await expect(service.getCachedOrVerify('example.com')).resolves.toBe(true);
      expect(cacheManagerService.setCustomCache).toHaveBeenCalledWith(
        'dns-verify:example.com',
        true,
        600,
      );
    });
  });
});
