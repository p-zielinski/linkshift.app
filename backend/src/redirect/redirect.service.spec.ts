import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { RedirectRule, RedirectService } from './redirect.service';
import { PrismaService } from '../prisma.service';
import { RuleValidatorService } from '../rule-validator/rule-validator.service';
import { OrganizationService } from '../organization/organization.service';
import { PaymentRequiredError } from '@shared/models/error.model';
import {
  CacheManagerService,
  RateLimitScope,
} from '../cache/cache-manager.service';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import { DestinationExtractorService } from '../security/destination-extractor.service';
import { SafetyScannerService } from '../security/safety-scanner.service';
import { DomainBlacklistService } from '../security/domain-blacklist.service';
import { SubdomainBlacklistService } from '../security/subdomain-blacklist.service';
import { RedirectAnalyticsService } from '../security/redirect-analytics.service';
import { Logger } from 'nestjs-pino';
import { LinkMapService } from '../link-map/link-map.service';
import { ROBOTS_ALLOW_ALL_CONTENT } from '@shared/models/robots-policy.model';
import { ConfigService } from '@nestjs/config';

const mockPrismaService = {
  domain: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  domainGroup: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  redirectRule: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockOrganizationService = {
  checkDomainGroupLimit: jest.fn(),
  checkDomainLimit: jest.fn(),
  checkRedirectRuleLimit: jest.fn(),
  checkRedirectionAccess: jest.fn(), // Added
  getEffectiveSubscription: jest.fn((config: any) => config.activeSubscription),
};

describe('RedirectService', () => {
  let service: RedirectService;
  let prisma: PrismaService;
  let organizationService: OrganizationService;
  let cacheManagerService: CacheManagerService;
  let linkMapService: LinkMapService;
  let redirectAnalyticsService: RedirectAnalyticsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedirectService,
        RuleValidatorService,
        {
          provide: ClsService,
          useValue: {
            getId: jest.fn().mockReturnValue('mock-id'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            domain: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            linkShiftSubdomain: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            redirectRule: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            linkMap: {
              findFirst: jest.fn(),
            },
            domainGroup: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'BACKEND_HOST') {
                return 'linkshift.app';
              }
              return undefined;
            }),
          },
        },
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
        {
          provide: CacheManagerService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            getRedirectContext: jest.fn(),
            setRedirectContext: jest.fn(),
            invalidateRedirectContext: jest.fn(),
            invalidateCustomCache: jest.fn(),
            getData: jest.fn(),
            getCustomCache: jest.fn(),
            setCustomCache: jest.fn(),
            checkRateLimit: jest.fn(),
          },
        },
        {
          provide: DestinationExtractorService,
          useValue: {
            extractUrls: jest.fn().mockReturnValue([]),
            extractUrl: jest.fn().mockReturnValue(null),
          },
        },
        {
          provide: SafetyScannerService,
          useValue: {
            checkUrls: jest.fn().mockResolvedValue(new Map()),
          },
        },
        {
          provide: DomainBlacklistService,
          useValue: {
            isBlacklisted: jest.fn().mockResolvedValue(false),
            addDomains: jest.fn(),
          },
        },
        {
          provide: SubdomainBlacklistService,
          useValue: {
            isReserved: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: RedirectAnalyticsService,
          useValue: {
            trackRuleHit: jest.fn().mockResolvedValue(undefined),
            getTopRulesForOrganization: jest.fn().mockResolvedValue([]),
            getTopRulesGlobal: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: LinkMapService,
          useValue: {
            resolveLinkMapDestination: jest.fn().mockResolvedValue(null),
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

    service = module.get<RedirectService>(RedirectService);
    prisma = module.get<PrismaService>(PrismaService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    cacheManagerService = module.get<CacheManagerService>(CacheManagerService);
    linkMapService = module.get<LinkMapService>(LinkMapService);
    redirectAnalyticsService = module.get<RedirectAnalyticsService>(
      RedirectAnalyticsService,
    );

    (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
  });

  const createMockRequest = (
    urlStr: string,
    headers: Record<string, string> = {},
    method = 'GET',
  ): any => {
    const url = new URL(urlStr);
    return {
      protocol: url.protocol.replace(':', ''),
      get: (header: string) => {
        if (header === 'host') return url.host;
        const lowerHeader = header.toLowerCase();
        for (const [key, value] of Object.entries(headers)) {
          if (key.toLowerCase() === lowerHeader) return value;
        }
        return undefined;
      },
      originalUrl: url.pathname + url.search,
      path: url.pathname,
      hostname: url.hostname,
      method,
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    };
  };

  describe('getTopRules', () => {
    it('should return enriched analytics with top link map keys and request variants', async () => {
      const start = new Date('2026-02-10T10:12:00Z');
      const end = new Date('2026-02-10T12:45:00Z');

      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce([
          { ruleId: 'rule-1', hits: BigInt(12) },
          { ruleId: 'rule-2', hits: '5' },
        ])
        .mockResolvedValueOnce([
          { ruleId: 'rule-1', linkMapKey: 'abc', hits: BigInt(4) },
          { ruleId: 'rule-1', linkMapKey: 'xyz', hits: BigInt(2) },
        ])
        .mockResolvedValueOnce([
          {
            ruleId: 'rule-1',
            requestMethod: 'GET',
            requestPath: '/promo/abc',
            requestQuery: 'ref=summer',
            requestUrl: '/promo/abc?ref=summer',
            destination: 'https://example.com/summer',
            linkMapKey: 'abc',
            hits: BigInt(3),
          },
          {
            ruleId: 'rule-2',
            requestMethod: 'POST',
            requestPath: '/api/go',
            requestQuery: '',
            requestUrl: '/api/go',
            destination: 'https://api.example.com/v2',
            linkMapKey: null,
            hits: BigInt(2),
          },
        ]);

      (prisma.redirectRule.findMany as jest.Mock).mockResolvedValue([
        { id: 'rule-1' },
        { id: 'rule-2' },
      ]);

      const result = await service.getTopRules('org-1', {
        limit: 10,
        start,
        end,
      });

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(3);

      expect(result.data).toEqual([
        {
          rule: { id: 'rule-1' },
          hits: 12,
          topLinkMapKeys: [
            { key: 'abc', hits: 4 },
            { key: 'xyz', hits: 2 },
          ],
          topRequestVariants: [
            {
              requestMethod: 'GET',
              requestPath: '/promo/abc',
              requestQuery: 'ref=summer',
              requestUrl: '/promo/abc?ref=summer',
              destination: 'https://example.com/summer',
              linkMapKey: 'abc',
              hits: 3,
            },
          ],
        },
        {
          rule: { id: 'rule-2' },
          hits: 5,
          topLinkMapKeys: [],
          topRequestVariants: [
            {
              requestMethod: 'POST',
              requestPath: '/api/go',
              requestQuery: '',
              requestUrl: '/api/go',
              destination: 'https://api.example.com/v2',
              linkMapKey: null,
              hits: 2,
            },
          ],
        },
      ]);
    });

    it('should reject when end is before start', async () => {
      const start = new Date('2026-02-10T12:00:00Z');
      const end = new Date('2026-02-10T10:00:00Z');

      await expect(
        service.getTopRules('org-1', {
          limit: 10,
          start,
          end,
        }),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('should reject ranges longer than 31 days', async () => {
      await expect(
        service.getTopRules('org-1', {
          limit: 10,
          start: new Date('2026-01-01T00:00:00Z'),
          end: new Date('2026-02-15T00:00:00Z'),
        }),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('Standard Rules Scenarios', () => {
    it('should handle "Blog Rule" correctly with variable extraction and chaining', async () => {
      const rules: RedirectRule[] = [
        {
          source: /^\/blog\/(.+)$/,
          destination:
            'https://new-blog.com/posts/$1?from={domain.root:to_upper_case.url_encode}',
        },
      ];

      const req = createMockRequest(
        'http://sub.my-domain.com/blog/cool-article',
      );
      const result = await service.getRedirect(req, rules);

      expect(result).toBe(
        'https://new-blog.com/posts/cool-article?from=MY-DOMAIN',
      );
    });

    it('should replace multiple regex capture groups ($1, $2, $3)', async () => {
      const rules: RedirectRule[] = [
        {
          source: /^\/go\/([^/]+)\/([^/]+)\/([^/]+)$/,
          destination: 'https://example.com/$1/$2/$3',
        },
      ];

      const req = createMockRequest('http://site.com/go/docs/api/v1');
      const result = await service.getRedirect(req, rules);

      expect(result).toBe('https://example.com/docs/api/v1');
    });

    it('should redirect www host to apex while preserving path and query', async () => {
      const rules: RedirectRule[] = [
        {
          source: /^\/(.*)$/,
          destination: 'https://{domain.extension}/$1',
        },
      ];

      const req = createMockRequest(
        'https://www.example.com/pricing/enterprise?utm_source=ad&ref=summer',
      );
      const result = await service.getRedirect(req, rules);

      expect(result).toBe(
        'https://example.com/pricing/enterprise?utm_source=ad&ref=summer',
      );
    });

    it('should support prefix source with segments variable mapping', async () => {
      const rules: RedirectRule[] = [
        {
          source: '/articles',
          destination:
            'https://docs.example.com/integrations/articles/{segments.2}',
          pathMatch: 'prefix',
          queryMatch: 'ignore',
        },
      ];

      const req = createMockRequest(
        'https://support.example.com/articles/integrations/slack-guide?utm=legacy',
      );
      const result = await service.getRedirect(req, rules);

      expect(result).toBe(
        'https://docs.example.com/integrations/articles/slack-guide',
      );
    });
  });

  describe('Method Matching', () => {
    it('should match only when request method aligns with matchMethod', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: '/get-only',
          matchMethod: ['GET'],
        },
        {
          source: '*',
          destination: '/any',
          matchMethod: [],
        },
      ];

      const reqGet = createMockRequest('http://test.com/', {}, 'GET');
      const reqPost = createMockRequest('http://test.com/', {}, 'POST');

      expect(await service.getRedirect(reqGet, rules)).toBe('/get-only');
      expect(await service.getRedirect(reqPost, rules)).toBe('/any');
    });

    it('should skip rule when matchMethod does not match', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: '/post-only',
          matchMethod: ['POST'],
        },
      ];

      const req = createMockRequest('http://test.com/', {}, 'GET');
      expect(await service.getRedirect(req, rules)).toBeNull();
    });
  });

  describe('Path and Query Matching', () => {
    it('should ignore query when queryMatch is ignore', async () => {
      const rules: RedirectRule[] = [
        {
          source: '/test',
          destination: '/matched',
          queryMatch: 'ignore',
        },
      ];

      const req = createMockRequest('http://test.com/test?foo=bar');
      expect(await service.getRedirect(req, rules)).toBe('/matched');
    });

    it('should require exact query when queryMatch is exact', async () => {
      const rules: RedirectRule[] = [
        {
          source: '/test',
          destination: '/matched',
          queryMatch: 'exact',
        },
      ];

      const req = createMockRequest('http://test.com/test?foo=bar');
      expect(await service.getRedirect(req, rules)).toBeNull();
    });

    it('should allow subset query match', async () => {
      const rules: RedirectRule[] = [
        {
          source: '/test?foo=bar',
          destination: '/matched',
          queryMatch: 'subset',
        },
      ];

      const req = createMockRequest('http://test.com/test?foo=bar&extra=1');
      expect(await service.getRedirect(req, rules)).toBe('/matched');
    });

    it('should reject subset query match when required params are missing', async () => {
      const rules: RedirectRule[] = [
        {
          source: '/test?foo=bar',
          destination: '/matched',
          queryMatch: 'subset',
        },
      ];

      const req = createMockRequest('http://test.com/test?extra=1');
      expect(await service.getRedirect(req, rules)).toBeNull();
    });

    it('should match prefix paths when pathMatch is prefix', async () => {
      const rules: RedirectRule[] = [
        {
          source: '/v1',
          destination: '/matched',
          pathMatch: 'prefix',
          queryMatch: 'ignore',
        },
      ];

      const req = createMockRequest('http://test.com/v1/users');
      expect(await service.getRedirect(req, rules)).toBe('/matched');
    });

    it('should require exact query for prefix matches when queryMatch is exact', async () => {
      const rules: RedirectRule[] = [
        {
          source: '/v1?333=1',
          destination: '/matched',
          pathMatch: 'prefix',
          queryMatch: 'exact',
        },
      ];

      const req = createMockRequest('http://test.com/v1/users?333=1');
      const reqWithExtra = createMockRequest(
        'http://test.com/v1/users?333=1&x=2',
      );

      expect(await service.getRedirect(req, rules)).toBe('/matched');
      expect(await service.getRedirect(reqWithExtra, rules)).toBeNull();
    });

    it('should not match prefix paths across boundaries', async () => {
      const rules: RedirectRule[] = [
        {
          source: '/v1',
          destination: '/matched',
          pathMatch: 'prefix',
          queryMatch: 'ignore',
        },
      ];

      const req = createMockRequest('http://test.com/v11/users');
      expect(await service.getRedirect(req, rules)).toBeNull();
    });
  });

  describe('Link Map Rules', () => {
    it('should resolve link map destination when rule matches', async () => {
      (linkMapService.resolveLinkMapDestination as jest.Mock).mockResolvedValue(
        'https://target.com',
      );

      const rules: RedirectRule[] = [
        {
          source: '/short',
          destination: 'https://placeholder.com',
          pathMatch: 'prefix',
          queryMatch: 'ignore',
          linkMapId: 'lmap_123',
        },
      ];

      const req = createMockRequest('http://test.com/short/abc');
      const result = await service.getRedirect(req, rules);

      expect(result).toBe('https://target.com');
      expect(linkMapService.resolveLinkMapDestination).toHaveBeenCalled();
    });

    it('should skip link map rule when no entry or fallback is found', async () => {
      (linkMapService.resolveLinkMapDestination as jest.Mock).mockResolvedValue(
        null,
      );

      const rules: RedirectRule[] = [
        {
          source: '/short',
          destination: 'https://placeholder.com',
          pathMatch: 'prefix',
          queryMatch: 'ignore',
          linkMapId: 'lmap_123',
        },
        {
          source: '/short/abc',
          destination: 'https://fallback.com',
        },
      ];

      const req = createMockRequest('http://test.com/short/abc');
      const result = await service.getRedirect(req, rules);

      expect(result).toBe('https://fallback.com');
    });
  });

  describe('Variable Extraction Logic', () => {
    it('should correctly extract domain parts for complicated domains', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            'out: fqdn={domain.fqdn}|label={domain.label}|root={domain.root}|ext={domain.extension}|sub={domain.subdomain}',
        },
      ];

      const req = createMockRequest('http://deep.sub.example.co.uk/path');
      const result = await service.getRedirect(req, rules);

      expect(result).toContain('fqdn=deep.sub.example.co.uk');
      expect(result).toContain('label=deep.sub.example.co');
      expect(result).toContain('root=co');
      expect(result).toContain('ext=sub.example.co.uk');
      expect(result).toContain('sub=deep.sub.example');
    });

    it('should handle localhost (single part domain)', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: 'root={domain.root}' },
      ];
      const req = createMockRequest('http://localhost/test');
      const result = await service.getRedirect(req, rules);
      expect(result).toBe('root=localhost');
    });

    it('should extract path segments and query params', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: 's0={segments.0}|s1={segments.1}|q={query.foo}',
        },
      ];
      const req = createMockRequest('http://site.com/user/123?foo=bar');
      const result = await service.getRedirect(req, rules);
      expect(result).toBe('s0=user|s1=123|q=bar');
    });
  });

  describe('Function Placeholders', () => {
    it('should resolve time() placeholder in destination', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: 'https://site.com?ts={time()}' },
      ];
      const req = createMockRequest('http://test.com/');
      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

      const result = await service.getRedirect(req, rules);

      expect(result).toBe('https://site.com?ts=1700000000000');
      dateSpy.mockRestore();
    });

    it('should resolve time() placeholder with to_iso_string manipulator', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: 'https://site.com?ts={time():to_iso_string}',
        },
      ];
      const req = createMockRequest('http://test.com/');
      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

      const result = await service.getRedirect(req, rules);

      expect(result).toBe(
        `https://site.com?ts=${new Date(1700000000000).toISOString()}`,
      );
      dateSpy.mockRestore();
    });

    it('should resolve random() placeholder in destination', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: 'https://site.com?bucket={random(0,100)}' },
      ];
      const req = createMockRequest('http://test.com/');
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await service.getRedirect(req, rules);

      expect(result).toBe('https://site.com?bucket=50');
      randomSpy.mockRestore();
    });

    it('should resolve random() placeholder with to_iso_string manipulator', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: 'https://site.com?ts={random():to_iso_string}',
        },
      ];
      const req = createMockRequest('http://test.com/');
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

      const result = await service.getRedirect(req, rules);

      expect(result).toBe(`https://site.com?ts=${new Date(0).toISOString()}`);
      randomSpy.mockRestore();
    });

    it('should use default random() range when no args are provided', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: 'https://site.com?bucket={random()}' },
      ];
      const req = createMockRequest('http://test.com/');
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

      const result = await service.getRedirect(req, rules);

      expect(result).toBe('https://site.com?bucket=0');
      randomSpy.mockRestore();
    });

    it('should allow negative minimum values in random()', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: 'https://site.com?bucket={random(-5,5)}' },
      ];
      const req = createMockRequest('http://test.com/');
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

      const result = await service.getRedirect(req, rules);

      expect(result).toBe('https://site.com?bucket=-5');
      randomSpy.mockRestore();
    });

    it('should apply modifiers to random() placeholder', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            'https://site.com?bucket={random(0,9):divide_10.divide_10}',
        },
      ];
      const req = createMockRequest('http://test.com/');
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.7);

      const result = await service.getRedirect(req, rules);

      expect(result).toBe('https://site.com?bucket=0.07');
      randomSpy.mockRestore();
    });
  });

  describe('Security & Stability (Recursion Limits)', () => {
    it('should protect against Stack Overflow by enforcing MAX_RECURSION_DEPTH', async () => {
      let deepRule = '1 == 1 ? /target : /fallback';
      for (let i = 0; i < 40; i++) {
        deepRule = `1 == 1 ? (${deepRule}) : /fallback`;
      }

      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: deepRule,
        },
      ];

      const req = createMockRequest('http://test.com/');
      const loggerSpy = jest
        .spyOn((service as any).logger, 'error')
        .mockImplementation();

      const result = await service.getRedirect(req, rules);

      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith('Error processing redirect rule', {
        source: '*',
        destination: deepRule,
        error: 'Maximum recursion depth exceeded in redirect rule.',
      });

      loggerSpy.mockRestore();
    });

    it('should continue processing subsequent rules if one rule fails due to recursion', async () => {
      let maliciousRule = '1 == 1 ? /t : /f';
      for (let i = 0; i < 35; i++) {
        maliciousRule = `1 == 1 ? (${maliciousRule}) : /f`;
      }

      const rules: RedirectRule[] = [
        { source: '/path', destination: maliciousRule },
        { source: '/path', destination: '/safe-fallback' },
      ];

      const req = createMockRequest('http://test.com/path');
      jest.spyOn((service as any).logger, 'error').mockImplementation();

      const result = await service.getRedirect(req, rules);

      expect(result).toBe('/safe-fallback');
    });
  });

  describe('Manipulators Coverage', () => {
    const testManipulator = async (
      manipulatorChain: string,
      inputValue: string,
    ) => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: `{query.var:${manipulatorChain}}`,
        },
      ];
      const req = createMockRequest(
        `http://site.com/?var=${encodeURIComponent(inputValue)}`,
      );
      return await service.getRedirect(req, rules);
    };

    it('should handle "to_lower_case"', async () => {
      expect(await testManipulator('to_lower_case', 'HELLO')).toBe('hello');
    });

    it('should handle "to_upper_case"', async () => {
      expect(await testManipulator('to_upper_case', 'hello')).toBe('HELLO');
    });

    it('should handle "url_encode" and "url_decode"', async () => {
      expect(await testManipulator('url_encode', 'a b')).toBe('a%20b');
    });

    it('should handle "base64_encode"', async () => {
      expect(await testManipulator('base64_encode', 'test')).toBe(
        Buffer.from('test').toString('base64'),
      );
    });

    it('should handle "auto_trailing_slash"', async () => {
      expect(await testManipulator('auto_trailing_slash', 'path')).toBe(
        'path/',
      );
      expect(await testManipulator('auto_trailing_slash', 'path/')).toBe(
        'path/',
      );
    });

    describe('manipulator: to_iso_string', () => {
      it('should convert epoch milliseconds to ISO string', async () => {
        expect(await testManipulator('to_iso_string', '0')).toBe(
          '1970-01-01T00:00:00.000Z',
        );
      });

      it('should fall back to now for invalid input', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-01-02T03:04:05Z'));
        try {
          expect(await testManipulator('to_iso_string', 'not-a-date')).toBe(
            '2024-01-02T03:04:05.000Z',
          );
        } finally {
          jest.useRealTimers();
        }
      });
    });

    describe('Math Manipulators', () => {
      it('should handle "add_10"', async () => {
        expect(await testManipulator('add_10', '5')).toBe('15');
        expect(await testManipulator('add_10', '-5')).toBe('5');
      });

      it('should handle "multiply_2"', async () => {
        expect(await testManipulator('multiply_2', '10')).toBe('20');
        expect(await testManipulator('multiply_2', '2.5')).toBe('5');
      });

      describe('manipulator: round', () => {
        it('should round standard floating point numbers', async () => {
          expect(await testManipulator('round', '10.6')).toBe('11');
          expect(await testManipulator('round', '10.4')).toBe('10');
        });

        it('should handle negative numbers correctly', async () => {
          expect(await testManipulator('round', '-10.6')).toBe('-11');
          expect(await testManipulator('round', '-10.5')).toBe('-10');
          expect(await testManipulator('round', '-10.4')).toBe('-10');
        });

        it('should return NaN for non-numeric input', async () => {
          expect(await testManipulator('round', 'abc')).toBe('NaN');
        });

        it('should treat empty input as 0', async () => {
          expect(await testManipulator('round', '')).toBe('0');
        });
      });

      it('should handle math on non-numeric strings safely', async () => {
        expect(await testManipulator('add_10', 'abc')).toBe('NaN');
      });

      it('should handle chained math: add_10 then multiply_2', async () => {
        expect(await testManipulator('add_10.multiply_2', '5')).toBe('30');
      });
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should return null if no rule matches', async () => {
      const rules: RedirectRule[] = [
        { source: /^\/admin/, destination: 'http://admin.com' },
      ];
      const req = createMockRequest('http://site.com/user');
      const result = await service.getRedirect(req, rules);
      expect(result).toBeNull();
    });

    it('should warn and skip unknown manipulators', async () => {
      const loggerInstance = (service as any).logger;
      const warnSpy = jest.spyOn(loggerInstance, 'warn').mockImplementation();
      const rules: RedirectRule[] = [
        { source: '*', destination: '{query.val:fake_method}' },
      ];
      const req = createMockRequest('http://site.com/?val=test');

      const result = await service.getRedirect(req, rules);

      expect(result).toBe('test');
      expect(warnSpy).toHaveBeenCalledWith('Unknown manipulator', {
        manipulator: 'fake_method',
      });
    });

    it('should handle missing variables gracefully', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: 'http://site.com/{missing_var}' },
      ];
      const req = createMockRequest('http://site.com/');
      const result = await service.getRedirect(req, rules);

      expect(result).toBe('http://site.com/{missing_var}');
    });

    it('should handle random() placeholder correctly', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: 'Random: {random(0,1000000)}' },
      ];
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const req = createMockRequest('http://site.com/');
      const result = await service.getRedirect(req, rules);
      expect(result).toBe('Random: 500000');
      randomSpy.mockRestore();
    });

    it('should catch errors inside manipulators and log them', async () => {
      const loggerSpy = jest
        .spyOn((service as any).logger, 'error')
        .mockImplementation();

      (RedirectService as any).manipulators.broken = () => {
        throw new Error('Boom');
      };

      const rules: RedirectRule[] = [
        { source: '*', destination: '{query.val:broken}' },
      ];

      const req = createMockRequest('http://site.com/?val=safe');
      const result = await service.getRedirect(req, rules);

      expect(result).toBe('safe');
      expect(loggerSpy).toHaveBeenCalledWith('Error applying manipulator', {
        manipulator: 'broken',
        error: 'Boom',
      });

      delete (RedirectService as any).manipulators.broken;
      loggerSpy.mockRestore();
    });
  });

  describe('Conditional Redirects (Traffic Splitting & Logic)', () => {
    let randomSpy: jest.SpyInstance;

    beforeEach(() => {
      randomSpy = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      randomSpy.mockRestore();
    });

    it('should split traffic based on random percentage', async () => {
      // 30% traffic to google, 70% to bing
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            'random(0,100) < 30 ? https://google.com : https://bing.com',
        },
      ];

      // Case 1: Random < 30 (e.g., 29)
      // Math.random is called twice: once for extractVariables and once for random().
      randomSpy.mockReturnValueOnce(0.29); // random(0,100) -> 29
      const req1 = createMockRequest('http://test.com');
      const result1 = await service.getRedirect(req1, rules);
      expect(result1).toBe('https://google.com');

      // Case 2: Random >= 30 (e.g., 50)
      randomSpy.mockReturnValueOnce(0.5); // random(0,100) -> 50
      const req2 = createMockRequest('http://test.com');
      const result2 = await service.getRedirect(req2, rules);
      expect(result2).toBe('https://bing.com');
    });

    it('should handle nested random() conditions', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            'random(0,9) < 5 ? (random(0,9) < 5 ? (random(0,9) < 5 ? /very-low : /low) : /mid) : /high',
        },
      ];
      const req = createMockRequest('http://test.com');
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.4);
      const result = await service.getRedirect(req, rules);
      randomSpy.mockRestore();
      expect(result).toBe('/very-low');
    });

    it('should evaluate conditions after applying modifiers to random() placeholders', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            '{random(0,100):divide_10} < 3 ? https://a.com : https://b.com',
        },
      ];

      // Math.random is called twice: once for extractVariables and once for random().
      randomSpy.mockReturnValueOnce(0.1); // extractVariables call
      randomSpy.mockReturnValueOnce(0.2); // random(0,100) -> 20, divide_10 -> 2

      const req = createMockRequest('http://test.com');
      const result = await service.getRedirect(req, rules);
      expect(result).toBe('https://a.com');
    });

    it('should route based on UserAgent regex match (~=)', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "'{user-agent}' ~= 'iPhone' ? /mobile-site : /desktop-site",
        },
      ];

      const reqMobile = createMockRequest('http://test.com', {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      });
      const result1 = await service.getRedirect(reqMobile, rules);
      expect(result1).toBe('/mobile-site');

      const reqDesktop = createMockRequest('http://test.com', {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      });
      const result2 = await service.getRedirect(reqDesktop, rules);
      expect(result2).toBe('/desktop-site');
    });

    it('should route based on UserAgent includes check with manipulation', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "'{user-agent:to_lower_case}' includes 'chrome' ? /chrome-browser : /other-browser",
        },
      ];

      // Chrome User Agent
      const reqChrome = createMockRequest('http://test.com', {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      });
      expect(await service.getRedirect(reqChrome, rules)).toBe(
        '/chrome-browser',
      );

      // Firefox User Agent (does not contain 'chrome' typically)
      const reqFirefox = createMockRequest('http://test.com', {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      });
      expect(await service.getRedirect(reqFirefox, rules)).toBe(
        '/other-browser',
      );
    });

    it('should handle nested conditions (If-Else-If logic)', async () => {
      // Logic: If Country is PL -> /pl, Else If Country is US -> /us, Else -> /global
      // Note: Test helper defaults IP to 127.0.0.1 which mocks to 'PL' in our service

      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "'{geo.country}' == 'PL' ? /pl : ('{geo.country}' == 'US' ? /us : /global)",
        },
      ];

      // Case 1: IP 127.0.0.1 -> PL
      const reqPL = createMockRequest('http://test.com');
      expect(await service.getRedirect(reqPL, rules)).toBe('/pl');

      // Case 2: Unknown IP (defaults to US in stub)
      const reqUS = createMockRequest('http://test.com');
      reqUS.ip = '8.8.8.8';
      reqUS.socket.remoteAddress = '8.8.8.8';

      // We need to re-create the service or mock the private method,
      // but since we can't easily mock private, we rely on the stub logic:
      // Stub returns 'US' for anything not local.
      expect(await service.getRedirect(reqUS, rules)).toBe('/us');
    });

    it('should handle complex mixed logic with parentheses', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: '(10 > 5) ? (2 == 2 ? yes : no) : fail',
        },
      ];
      const req = createMockRequest('http://test.com');
      expect(await service.getRedirect(req, rules)).toBe('yes');
    });

    it('should handle multiple nested operators with parentheses', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            '(random(0,1000000) >= 0) ? (random(0,1000000) < 10000000 ? /in-range : /too-high) : /negative',
        },
      ];
      const req = createMockRequest('http://test.com');
      // Random is always >= 0 and usually < 10000000 (0..1000000 in stub)
      expect(await service.getRedirect(req, rules)).toBe('/in-range');
    });

    it('should correctly process logic where operators are inside strings', async () => {
      // The '>' inside the string should be ignored by the parser
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "'{user-agent}' includes 'MSIE > 6' ? /legacy-browser : /modern-browser",
        },
      ];
      const req = createMockRequest('http://test.com', {
        'user-agent': 'Mozilla/4.0 (compatible; MSIE > 6)',
      });
      expect(await service.getRedirect(req, rules)).toBe('/legacy-browser');
    });

    it('should handle deeply nested conditions with multiple branches', async () => {
      // If A ? (B ? T1 : F1) : (C ? T2 : F2)
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            '1 > 0 ? (10 < 5 ? /fail-inner : /success-inner) : (1 == 1 ? /fail-outer : /fail-outer-2)',
        },
      ];
      const req = createMockRequest('http://test.com');
      expect(await service.getRedirect(req, rules)).toBe('/success-inner');
    });

    it('should handle extremely deep nesting of conditional logic', async () => {
      // A ? (B ? (C ? T : F) : F) : F
      // 1>0 ? (2>1 ? (3>2 ? /deep-success : /deep-fail-3) : /deep-fail-2) : /deep-fail-1
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            '1 > 0 ? (2 > 1 ? (3 > 2 ? /deep-success : /deep-fail-3) : /deep-fail-2) : /deep-fail-1',
        },
      ];
      const req = createMockRequest('http://test.com');
      expect(await service.getRedirect(req, rules)).toBe('/deep-success');
    });

    it('should correctly handle a mix of true/false branches in deep nesting', async () => {
      // 1>0 (True) -> Check Inner
      // Inner: 2<1 (False) -> Go to False branch of Inner
      // Inner False Branch: 4>3 (True) -> /branch-success
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            '1 > 0 ? (2 < 1 ? /fail-1 : (4 > 3 ? /branch-success : /fail-2)) : /fail-3',
        },
      ];
      const req = createMockRequest('http://test.com');
      expect(await service.getRedirect(req, rules)).toBe('/branch-success');
    });

    it('should handle logic where condition itself is wrapped in many parentheses', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: '(((( 5 > 1 )))) ? /paren-success : /paren-fail',
        },
      ];
      const req = createMockRequest('http://test.com');
      expect(await service.getRedirect(req, rules)).toBe('/paren-success');
    });
  });

  describe('Date/Time Based Conditionals', () => {
    let dateSpy: jest.SpyInstance;

    beforeEach(() => {
      // Mock current time to 2024-06-15 12:00:00 UTC
      const mockDate = new Date('2024-06-15T12:00:00Z');
      dateSpy = jest
        .spyOn(global.Date, 'now')
        .mockReturnValue(mockDate.getTime());
    });

    afterEach(() => {
      dateSpy.mockRestore();
    });

    it('should route based on current time being after a specific date', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "time() > datetime('2024-01-01') ? /new-year-passed : /before-new-year",
        },
      ];

      const req = createMockRequest('http://test.com');
      expect(await service.getRedirect(req, rules)).toBe('/new-year-passed');
    });

    it('should route based on current time being before a specific date', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "time() < datetime('2025-01-01') ? /this-year : /next-year",
        },
      ];

      const req = createMockRequest('http://test.com');
      expect(await service.getRedirect(req, rules)).toBe('/this-year');
    });

    it('should handle datetime with specific time (UTC default)', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "time() > datetime('2024-06-15 10:00') ? /after-10am : /before-10am",
        },
      ];

      const req = createMockRequest('http://test.com');
      // Current mocked time is 12:00 UTC, which is > 10:00 UTC
      expect(await service.getRedirect(req, rules)).toBe('/after-10am');
    });

    it('should handle datetime with timezone specification', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "time() > datetime('2024-06-15 08:00', 'America/New_York') ? /after-8am-ny : /before-8am-ny",
        },
      ];

      const req = createMockRequest('http://test.com');
      // Current mocked time is 12:00 UTC = 08:00 EDT (New York)
      // So time() (12:00 UTC) > datetime('2024-06-15 08:00', 'America/New_York') (also 12:00 UTC)
      // This should be false (equal times)
      expect(await service.getRedirect(req, rules)).toBe('/before-8am-ny');
    });

    it('should handle date-only format (defaults to 00:00 UTC)', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "time() >= datetime('2024-06-15') ? /today-or-after : /before-today",
        },
      ];

      const req = createMockRequest('http://test.com');
      // Current mocked time is 2024-06-15 12:00 UTC, datetime('2024-06-15') = 2024-06-15 00:00 UTC
      expect(await service.getRedirect(req, rules)).toBe('/today-or-after');
    });

    it('should handle invalid dates gracefully (return false/NaN logic)', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: "time() > datetime('invalid-date') ? /yes : /no",
        },
      ];

      const req = createMockRequest('http://test.com');
      // Invalid date should parse to NaN, comparison with NaN is always false
      expect(await service.getRedirect(req, rules)).toBe('/no');
    });

    it('should handle comparison between two datetime values', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "datetime('2024-12-25') < datetime('2025-01-01') ? /christmas-first : /newyear-first",
        },
      ];

      const req = createMockRequest('http://test.com');
      expect(await service.getRedirect(req, rules)).toBe('/christmas-first');
    });

    it('should support complex nested datetime conditions', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "time() < datetime('2024-06-01') ? /may : (time() < datetime('2024-07-01') ? /june : /july-or-later)",
        },
      ];

      const req = createMockRequest('http://test.com');
      // Current mocked time is 2024-06-15, which is after June 1 but before July 1
      expect(await service.getRedirect(req, rules)).toBe('/june');
    });

    it('should handle equality checks with datetime', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "datetime('2024-01-01') == datetime('2024-01-01') ? /same : /different",
        },
      ];

      const req = createMockRequest('http://test.com');
      expect(await service.getRedirect(req, rules)).toBe('/same');
    });
  });

  describe('Advanced Conditional Operators Execution', () => {
    it('should execute inequality (!=) correctly', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: "'{method}' != 'POST' ? /not-post : /is-post",
        },
      ];
      const req = createMockRequest('http://test.com'); // Default GET
      expect(await service.getRedirect(req, rules)).toBe('/not-post');
    });

    it('should execute includes operator correctly', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "'{user-agent}' includes 'Mobile' ? /mobile-auth : /web-auth",
        },
      ];
      const req = createMockRequest('http://test.com', {
        'user-agent': 'Some Mobile Device v1',
      });
      expect(await service.getRedirect(req, rules)).toBe('/mobile-auth');
    });

    it('should execute regex match (~=) with flags (case insensitive)', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination: "'{path}' ~= /admin/i ? /secure-area : /public-area",
        },
      ];
      // Path contains 'ADMIN' (uppercase), regex uses /i flag
      const req = createMockRequest('http://test.com/ADMIN/dashboard');
      expect(await service.getRedirect(req, rules)).toBe('/secure-area');
    });

    it('should execute numeric comparisons (>=, <=)', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: '10 <= 10 ? /eq : /fail' },
        { source: '*', destination: '5 >= 6 ? /fail : /pass' },
      ];

      const req = createMockRequest('http://test.com');
      // 10 <= 10 -> true
      expect(await service.getRedirect(req, [rules[0]])).toBe('/eq');
      // 5 >= 6 -> false
      expect(await service.getRedirect(req, [rules[1]])).toBe('/pass');
    });

    it('should handle complex mixed conditions', async () => {
      // If (path includes 'shop') AND (true) -> /commerce
      // Since our parser doesn't support logical AND/OR yet (&&, ||),
      // we simulate AND using nested ternaries: ConditionA ? (ConditionB ? True : False) : False
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "'{path}' includes 'shop' ? (1 == 1 ? /commerce : /blog) : /home",
        },
      ];

      const req = createMockRequest('http://test.com/my-shop/items');
      expect(await service.getRedirect(req, rules)).toBe('/commerce');
    });
  });

  describe('Match Method Validation', () => {
    const organizationId = 'org_123';
    const domainGroupId = 'dg_123';

    beforeEach(() => {
      (prisma.domainGroup.findFirst as jest.Mock).mockResolvedValue({
        id: domainGroupId,
      });
      mockOrganizationService.checkRedirectRuleLimit.mockResolvedValue(
        undefined,
      );
    });

    it('should allow empty matchMethod arrays (all methods)', async () => {
      (prisma.redirectRule.create as jest.Mock).mockResolvedValue({
        id: 'rule_1',
        domainGroupId,
      });

      await service.createRule(organizationId, {
        source: '/foo',
        destination: 'https://example.com/bar',
        statusCode: 302,
        matchMethod: [],
        domainGroupId,
        priority: 0,
      });

      expect(prisma.redirectRule.create).toHaveBeenCalled();
    });

    it('should allow link map rules without destination', async () => {
      (prisma.redirectRule.create as jest.Mock).mockResolvedValue({
        id: 'rule_link_map',
        domainGroupId,
      });
      (prisma.linkMap.findFirst as jest.Mock).mockResolvedValue({
        id: 'link_map_1',
      });

      await service.createRule(organizationId, {
        source: '/short',
        destination: '',
        statusCode: 302,
        matchMethod: [],
        pathMatch: 'prefix',
        queryMatch: 'ignore',
        domainGroupId,
        priority: 0,
        linkMapId: 'link_map_1',
      });

      expect(prisma.redirectRule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            destination: null,
          }),
        }),
      );
    });

    it('should update link map rule with null destination', async () => {
      (prisma.redirectRule.findFirst as jest.Mock).mockResolvedValue({
        id: 'rule_link_map_update',
        source: '/short',
        destination: null,
        statusCode: 302,
        matchMethod: [],
        queryMatch: 'ignore',
        pathMatch: 'prefix',
        linkMapId: 'link_map_1',
        domainGroupId,
      });
      (prisma.linkMap.findFirst as jest.Mock).mockResolvedValue({
        id: 'link_map_1',
      });
      (prisma.redirectRule.update as jest.Mock).mockResolvedValue({
        id: 'rule_link_map_update',
        domainGroupId,
      });

      await service.updateRule('rule_link_map_update', organizationId, {
        linkMapId: 'link_map_1',
        destination: null,
      });

      expect(prisma.redirectRule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            destination: null,
          }),
        }),
      );
    });

    it('should require destination when removing link map', async () => {
      (prisma.redirectRule.findFirst as jest.Mock).mockResolvedValue({
        id: 'rule_link_map_remove',
        source: '/short',
        destination: null,
        statusCode: 302,
        matchMethod: [],
        queryMatch: 'ignore',
        pathMatch: 'prefix',
        linkMapId: 'link_map_1',
        domainGroupId,
      });

      await expect(
        service.updateRule('rule_link_map_remove', organizationId, {
          linkMapId: null,
        }),
      ).rejects.toThrow();
    });

    it('should reject duplicate matchMethod values', async () => {
      await expect(
        service.createRule(organizationId, {
          source: '/foo',
          destination: 'https://example.com/bar',
          statusCode: 302,
          matchMethod: ['GET', 'get'],
          domainGroupId,
          priority: 0,
        }),
      ).rejects.toThrow();

      expect(prisma.redirectRule.create).not.toHaveBeenCalled();
    });
  });

  describe('Organization Limits Enforcement', () => {
    const organizationId = 'org_123';

    // Helper to simulate the error thrown by OrganizationService
    const simulateLimitError = () => {
      try {
        throwHttpException(
          new PaymentRequiredError({
            details: 'Limit reached',
            requestId: 'req_1',
          }),
        );
      } catch (e) {
        return Promise.reject(e);
      }
      return Promise.resolve(); // Should not reach here
    };

    it('should prevent Domain Group creation when limit is reached', async () => {
      // Arrange
      mockOrganizationService.checkDomainGroupLimit.mockImplementation(
        simulateLimitError,
      );

      // Act & Assert
      await expect(
        service.createDomainGroup(organizationId, { name: 'Test Group' }),
      ).rejects.toThrow();

      // Ensure Prisma was NOT called
      expect(prisma.domainGroup.create).not.toHaveBeenCalled();
      expect(
        mockOrganizationService.checkDomainGroupLimit,
      ).toHaveBeenCalledWith(organizationId);
    });

    it('should prevent Domain creation when limit is reached', async () => {
      // Arrange
      const domainGroupId = 'dg_123';
      mockOrganizationService.checkDomainLimit.mockImplementation(
        simulateLimitError,
      );

      // Act & Assert
      await expect(
        service.createDomain(organizationId, {
          name: 'example.com',
          domainGroupId,
        }),
      ).rejects.toThrow();

      // Ensure Prisma was NOT called
      expect(prisma.domain.create).not.toHaveBeenCalled();
      expect(mockOrganizationService.checkDomainLimit).toHaveBeenCalledWith(
        organizationId,
        domainGroupId,
      );
    });

    it('should prevent Redirect Rule creation when limit is reached', async () => {
      // Arrange
      const domainGroupId = 'dg_123';
      mockOrganizationService.checkRedirectRuleLimit.mockImplementation(
        simulateLimitError,
      );

      // Act & Assert
      await expect(
        service.createRule(organizationId, {
          source: '/foo',
          destination: 'https://example.com/bar',
          statusCode: 301,
          matchMethod: [],
          domainGroupId,
          priority: 1,
        }),
      ).rejects.toThrow();

      // Ensure Prisma was NOT called
      expect(prisma.redirectRule.create).not.toHaveBeenCalled();
      expect(
        mockOrganizationService.checkRedirectRuleLimit,
      ).toHaveBeenCalledWith(organizationId, domainGroupId);
    });

    it('should proceed with Rule creation if limits are not reached', async () => {
      // Arrange
      const domainGroupId = 'dg_123';
      mockOrganizationService.checkRedirectRuleLimit.mockResolvedValue(
        undefined,
      );
      (prisma.domainGroup.findFirst as jest.Mock).mockResolvedValue({
        id: domainGroupId,
      });
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.redirectRule.create as jest.Mock).mockResolvedValue({
        id: 'rule_1',
        domainGroupId: domainGroupId,
      });

      // Act
      await service.createRule(organizationId, {
        source: '/foo',
        destination: 'https://example.com/bar',
        statusCode: 301,
        matchMethod: [],
        domainGroupId,
        priority: 1,
      });

      // Assert
      expect(mockOrganizationService.checkRedirectRuleLimit).toHaveBeenCalled();
      expect(prisma.redirectRule.create).toHaveBeenCalled();
    });

    it('should return 402 Payment Required in applyRedirect if organization is suspended', async () => {
      // Arrange
      const req = createMockRequest('http://suspended.com');
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      } as any;

      (cacheManagerService.getCustomCache as jest.Mock).mockResolvedValue(true);

      // Mock domain finding
      (prisma.domain.findFirst as jest.Mock).mockResolvedValue({
        domainGroup: {
          organizationId: 'org_suspended',
          redirectRules: [],
          organization: { id: 'org_suspended' },
        },
      });

      // Mock Organization Service to throw
      mockOrganizationService.checkRedirectionAccess.mockImplementation(
        simulateLimitError,
      );

      // Act
      await service.applyRedirect(req, res);

      // Assert
      expect(
        mockOrganizationService.checkRedirectionAccess,
      ).toHaveBeenCalledWith('org_suspended');
      expect(res.status).toHaveBeenCalledWith(402);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 402,
          message: 'Payment required',
        }),
      );
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect using rule status code', async () => {
      const req = createMockRequest('http://example.com/old', {}, 'POST');
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      } as any;

      (cacheManagerService.getCustomCache as jest.Mock).mockResolvedValue(true);

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue({
        domainGroup: {
          organizationId: 'org_1',
          redirectRules: [
            {
              source: '*',
              destination: 'https://example.com/new',
              statusCode: 301,
              matchMethod: [],
            },
          ],
        },
      });
      (cacheManagerService.getData as jest.Mock).mockResolvedValue({
        configuration: null,
      });
      (cacheManagerService.checkRateLimit as jest.Mock).mockResolvedValue(
        undefined,
      );
      mockOrganizationService.checkRedirectionAccess.mockResolvedValue(
        undefined,
      );

      await service.applyRedirect(req, res);

      expect(cacheManagerService.checkRateLimit).toHaveBeenCalledWith(
        RateLimitScope.REDIRECTION,
        'org_1',
        10,
      );
      expect(res.redirect).toHaveBeenCalledWith(301, 'https://example.com/new');
    });

    it('should return robots.txt content and skip redirect rules when robots policy is active', async () => {
      const req = createMockRequest('http://example.com/robots.txt?from=test');
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
        type: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue({
        domainGroup: {
          organizationId: 'org_1',
          robotsPolicy: 'ALLOW_ALL',
          customRobotsContent: null,
          redirectRules: [
            {
              source: '/robots.txt',
              destination: 'https://example.com/should-not-run',
              statusCode: 301,
              matchMethod: [],
              queryMatch: 'ignore',
              pathMatch: 'exact',
            },
          ],
        },
      });
      (cacheManagerService.getData as jest.Mock).mockResolvedValue({
        configuration: null,
      });
      (cacheManagerService.checkRateLimit as jest.Mock).mockResolvedValue(
        undefined,
      );
      mockOrganizationService.checkRedirectionAccess.mockResolvedValue(
        undefined,
      );

      await service.applyRedirect(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.type).toHaveBeenCalledWith('text/plain; charset=utf-8');
      expect(res.send).toHaveBeenCalledWith(ROBOTS_ALLOW_ALL_CONTENT);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should continue standard rule matching for /robots.txt when robots policy is NONE', async () => {
      const req = createMockRequest('http://example.com/robots.txt');
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
        type: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue({
        domainGroup: {
          organizationId: 'org_1',
          robotsPolicy: 'NONE',
          customRobotsContent: null,
          redirectRules: [
            {
              source: '/robots.txt',
              destination: 'https://example.com/robots-public',
              statusCode: 301,
              matchMethod: [],
              queryMatch: 'exact',
              pathMatch: 'exact',
            },
          ],
        },
      });
      (cacheManagerService.getData as jest.Mock).mockResolvedValue({
        configuration: null,
      });
      (cacheManagerService.checkRateLimit as jest.Mock).mockResolvedValue(
        undefined,
      );
      mockOrganizationService.checkRedirectionAccess.mockResolvedValue(
        undefined,
      );

      await service.applyRedirect(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        301,
        'https://example.com/robots-public',
      );
      expect(res.send).not.toHaveBeenCalled();
    });

    it('should return custom robots.txt content when robots policy is CUSTOM', async () => {
      const req = createMockRequest('http://example.com/robots.txt');
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
        type: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      const customRobots = 'User-agent: *\nDisallow: /private';

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue({
        domainGroup: {
          organizationId: 'org_1',
          robotsPolicy: 'CUSTOM',
          customRobotsContent: customRobots,
          redirectRules: [],
        },
      });
      (cacheManagerService.getData as jest.Mock).mockResolvedValue({
        configuration: null,
      });
      (cacheManagerService.checkRateLimit as jest.Mock).mockResolvedValue(
        undefined,
      );
      mockOrganizationService.checkRedirectionAccess.mockResolvedValue(
        undefined,
      );

      await service.applyRedirect(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.type).toHaveBeenCalledWith('text/plain; charset=utf-8');
      expect(res.send).toHaveBeenCalledWith(customRobots);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should apply a stored www to apex rule and keep path with query', async () => {
      const req = createMockRequest(
        'https://www.example.com/docs/intro?ref=campaign&utm_medium=cpc',
      );
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      } as any;

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue({
        domainGroup: {
          organizationId: 'org_1',
          redirectRules: [
            {
              source: '/^\\/(.*)$/',
              destination: 'https://{domain.extension}/$1',
              statusCode: 308,
              matchMethod: [],
              queryMatch: 'exact',
              pathMatch: 'exact',
            },
          ],
        },
      });
      (cacheManagerService.getData as jest.Mock).mockResolvedValue({
        configuration: null,
      });
      (cacheManagerService.checkRateLimit as jest.Mock).mockResolvedValue(
        undefined,
      );
      mockOrganizationService.checkRedirectionAccess.mockResolvedValue(
        undefined,
      );

      await service.applyRedirect(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        308,
        'https://example.com/docs/intro?ref=campaign&utm_medium=cpc',
      );
    });

    it('should track link map key and request payload in analytics tracking', async () => {
      const req = createMockRequest('http://example.com/short/abc?ref=summer');
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      } as any;

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue({
        domainGroup: {
          organizationId: 'org_1',
          redirectRules: [
            {
              id: 'rule_linkmap',
              source: '/short',
              destination: null,
              statusCode: 302,
              matchMethod: [],
              queryMatch: 'ignore',
              pathMatch: 'prefix',
              linkMapId: 'lmap_1',
            },
          ],
        },
      });
      (cacheManagerService.getData as jest.Mock).mockResolvedValue({
        configuration: null,
      });
      (cacheManagerService.checkRateLimit as jest.Mock).mockResolvedValue(
        undefined,
      );
      mockOrganizationService.checkRedirectionAccess.mockResolvedValue(
        undefined,
      );
      (linkMapService.resolveLinkMapDestination as jest.Mock).mockResolvedValue(
        'https://target.example/page',
      );

      await service.applyRedirect(req, res);

      expect(redirectAnalyticsService.trackRuleHit).toHaveBeenCalledWith(
        'rule_linkmap',
        'org_1',
        expect.objectContaining({
          requestMethod: 'GET',
          requestPath: '/short/abc',
          requestQuery: 'ref=summer',
          requestUrl: '/short/abc?ref=summer',
          destination: 'https://target.example/page',
          linkMapKey: 'abc',
        }),
      );
    });

    it('should continue to the next rule in applyRedirect when link map has no match and no fallback', async () => {
      const req = createMockRequest('http://example.com/short/abc');
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      } as any;

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue({
        domainGroup: {
          organizationId: 'org_1',
          redirectRules: [
            {
              id: 'rule_linkmap',
              source: '/short',
              destination: 'https://placeholder.example',
              statusCode: 301,
              matchMethod: [],
              queryMatch: 'ignore',
              pathMatch: 'prefix',
              linkMapId: 'lmap_1',
            },
            {
              id: 'rule_fallback',
              source: '/short/abc',
              destination: 'https://next-rule.example',
              statusCode: 307,
              matchMethod: [],
              queryMatch: 'exact',
              pathMatch: 'exact',
              linkMapId: null,
            },
          ],
        },
      });
      (cacheManagerService.getData as jest.Mock).mockResolvedValue({
        configuration: null,
      });
      (cacheManagerService.checkRateLimit as jest.Mock).mockResolvedValue(
        undefined,
      );
      mockOrganizationService.checkRedirectionAccess.mockResolvedValue(
        undefined,
      );
      (linkMapService.resolveLinkMapDestination as jest.Mock).mockResolvedValue(
        null,
      );

      await service.applyRedirect(req, res);

      expect(linkMapService.resolveLinkMapDestination).toHaveBeenCalledWith(
        'lmap_1',
        'abc',
        expect.any(URLSearchParams),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        307,
        'https://next-rule.example',
      );
      expect(res.status).not.toHaveBeenCalledWith(404);
    });

    it('should return 404 in applyRedirect when link map has no match and there is no next rule', async () => {
      const req = createMockRequest('http://example.com/short/abc');
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      } as any;

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue({
        domainGroup: {
          organizationId: 'org_1',
          redirectRules: [
            {
              id: 'rule_linkmap_only',
              source: '/short',
              destination: 'https://placeholder.example',
              statusCode: 301,
              matchMethod: [],
              queryMatch: 'ignore',
              pathMatch: 'prefix',
              linkMapId: 'lmap_1',
            },
          ],
        },
      });
      (cacheManagerService.getData as jest.Mock).mockResolvedValue({
        configuration: null,
      });
      (cacheManagerService.checkRateLimit as jest.Mock).mockResolvedValue(
        undefined,
      );
      mockOrganizationService.checkRedirectionAccess.mockResolvedValue(
        undefined,
      );
      (linkMapService.resolveLinkMapDestination as jest.Mock).mockResolvedValue(
        null,
      );

      await service.applyRedirect(req, res);

      expect(linkMapService.resolveLinkMapDestination).toHaveBeenCalledWith(
        'lmap_1',
        'abc',
        expect.any(URLSearchParams),
      );
      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Not Found',
          statusCode: 404,
        }),
      );
    });
  });

  describe('Redirect Context Caching And Invalidation', () => {
    it('uses normalized hostname and treats cached null as cache hit', async () => {
      const req = createMockRequest('http://example.com/path');
      req.hostname = 'Example.COM.';
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      } as any;

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue(
        null,
      );

      await service.applyRedirect(req, res);

      expect(cacheManagerService.getRedirectContext).toHaveBeenCalledWith(
        'example.com',
      );
      expect(prisma.domain.findFirst).not.toHaveBeenCalled();
      expect(cacheManagerService.setRedirectContext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('queries only active domain groups on cache miss and caches by normalized hostname', async () => {
      const req = createMockRequest('http://example.com/path');
      req.hostname = 'Example.COM.';
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      } as any;

      (cacheManagerService.getRedirectContext as jest.Mock).mockResolvedValue(
        undefined,
      );
      (prisma.domain.findFirst as jest.Mock).mockResolvedValue(null);

      await service.applyRedirect(req, res);

      expect(prisma.domain.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'example.com',
          deletedAt: null,
          domainGroup: { deletedAt: null },
        },
        include: {
          domainGroup: {
            include: {
              redirectRules: {
                where: { deletedAt: null, isBlocked: false },
                orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
              },
            },
          },
        },
      });
      expect(cacheManagerService.setRedirectContext).toHaveBeenCalledWith(
        'example.com',
        null,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('invalidates redirect and caddy cache on domain group update', async () => {
      (prisma.domainGroup.findFirst as jest.Mock).mockResolvedValue({
        id: 'dg_1',
        organizationId: 'org_1',
        deletedAt: null,
      });
      (prisma.domainGroup.update as jest.Mock).mockResolvedValue({
        id: 'dg_1',
        name: 'new-name',
      });
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        { name: 'One.com' },
        { name: 'two.com.' },
      ]);

      await service.updateDomainGroup('dg_1', 'org_1', { name: 'new-name' });

      expect(
        cacheManagerService.invalidateRedirectContext,
      ).toHaveBeenCalledWith('one.com');
      expect(
        cacheManagerService.invalidateRedirectContext,
      ).toHaveBeenCalledWith('two.com');
      expect(cacheManagerService.invalidateCustomCache).toHaveBeenCalledWith(
        'CADDY_DOMAIN_ALLOWED:one.com',
      );
      expect(cacheManagerService.invalidateCustomCache).toHaveBeenCalledWith(
        'CADDY_DOMAIN_ALLOWED:two.com',
      );
    });

    it('invalidates redirect and caddy cache on domain group delete', async () => {
      (prisma.domainGroup.findFirst as jest.Mock).mockResolvedValue({
        id: 'dg_2',
        organizationId: 'org_1',
        deletedAt: null,
      });
      (prisma.domainGroup.update as jest.Mock).mockResolvedValue({
        id: 'dg_2',
      });
      (prisma.domain.findMany as jest.Mock).mockResolvedValue([
        { name: 'deleted-group.com' },
      ]);

      await service.deleteDomainGroup('dg_2', 'org_1');

      expect(
        cacheManagerService.invalidateRedirectContext,
      ).toHaveBeenCalledWith('deleted-group.com');
      expect(cacheManagerService.invalidateCustomCache).toHaveBeenCalledWith(
        'CADDY_DOMAIN_ALLOWED:deleted-group.com',
      );
    });
  });
});
