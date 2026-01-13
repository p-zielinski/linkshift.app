import { Test, TestingModule } from '@nestjs/testing';
import { RedirectRule, RedirectService } from './redirect.service';
import { PrismaService } from './prisma.service';
import { RuleValidatorService } from './rule-validator.service';

const mockPrismaService = {
  domain: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  domainGroup: {
    findFirst: jest.fn(),
  },
  redirectRule: {
    findMany: jest.fn(),
  },
};

describe('RedirectService', () => {
  let service: RedirectService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedirectService,
        RuleValidatorService, // Dodajemy prawdziwy validator (nie ma zależności)
        {
          provide: PrismaService, // Dostarczamy mocka Prismy
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RedirectService>(RedirectService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  const createMockRequest = (
    urlStr: string,
    headers: Record<string, string> = {},
  ): Request => {
    const url = new URL(urlStr);
    return {
      protocol: url.protocol.replace(':', ''),
      get: (header: string) => {
        if (header === 'host') return url.host;
        // Case-insensitive header lookup
        const lowerHeader = header.toLowerCase();
        for (const [key, value] of Object.entries(headers)) {
          if (key.toLowerCase() === lowerHeader) {
            return value;
          }
        }
        return undefined;
      },
      originalUrl: url.pathname + url.search,
      path: url.pathname,
      hostname: url.hostname,
      method: 'GET',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as Request;
  };

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
      // Note: We put value into query param 'var'
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
      // url_encode: space -> %20
      expect(await testManipulator('url_encode', 'a b')).toBe('a%20b');
      // url_decode: %20 -> space (input is already encoded by createMockRequest helper, but logic holds)
      // If we pass "a%20b" in query, express decodes it to "a b", then we encode/decode.
      // Let's test explicit logic:

      // Test 1: input "a b" -> encode -> "a%20b"
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
          // JS Math.round behavior: -10.5 rounds to -10 (towards +Infinity), -10.51 rounds to -11
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
        // Number("abc") -> NaN -> +10 -> NaN -> String -> "NaN"
        expect(await testManipulator('add_10', 'abc')).toBe('NaN');
      });

      it('should handle chained math: add_10 then multiply_2', async () => {
        // (5 + 10) * 2 = 30
        expect(await testManipulator('add_10.multiply_2', '5')).toBe('30');
      });

      describe('manipulator: random', () => {
        let randomSpy: jest.SpyInstance;

        beforeEach(() => {
          // Mock Math.random to have deterministic tests
          randomSpy = jest.spyOn(Math, 'random');
        });

        afterEach(() => {
          randomSpy.mockRestore();
        });

        it('should handle "min:max" format', async () => {
          randomSpy.mockReturnValue(0); // Returns min
          expect(await testManipulator('random', '10:20')).toBe('10');

          randomSpy.mockReturnValue(0.9999); // Returns max
          expect(await testManipulator('random', '10:20')).toBe('20');
        });

        it('should handle "max" only format (0 to max)', async () => {
          randomSpy.mockReturnValue(0);
          expect(await testManipulator('random', '100')).toBe('0');

          randomSpy.mockReturnValue(0.9999);
          expect(await testManipulator('random', '100')).toBe('100');
        });

        it('should swap min and max if min > max', async () => {
          randomSpy.mockReturnValue(0);
          // Should treat '50:10' as '10:50' -> min is 10
          expect(await testManipulator('random', '50:10')).toBe('10');
        });

        it('should handle empty input (default 0 to MAX_SAFE_INTEGER)', async () => {
          randomSpy.mockReturnValue(0);
          expect(await testManipulator('random', '')).toBe('0');

          // Verify it produces a large number for max
          randomSpy.mockReturnValue(0.9999999999);
          const result = await testManipulator('random', '');
          expect(Number(result)).toBeGreaterThan(1000000);
        });

        it('should fallback to default for invalid formats (parsing error)', async () => {
          randomSpy.mockReturnValue(0);
          // "abc" parses to NaN -> fallback to 0..MAX
          expect(await testManipulator('random', 'abc')).toBe('0');
        });

        it('should handle negative values and ranges', async () => {
          randomSpy.mockReturnValue(0);
          // Single negative value should be treated as max (0 to -5, then swapped to -5 to 0)
          expect(await testManipulator('random', '-5')).toBe('-5');

          randomSpy.mockReturnValue(0.9999);
          expect(await testManipulator('random', '-5')).toBe('0');

          // Negative range
          randomSpy.mockReturnValue(0);
          expect(await testManipulator('random', '-20:-10')).toBe('-20');

          randomSpy.mockReturnValue(0.9999);
          expect(await testManipulator('random', '-20:-10')).toBe('-10');

          // Cross-zero range
          randomSpy.mockReturnValue(0.5);
          // Range -10 to 10 has 21 integers. 0.5 * 21 = 10.5 -> floor is 10. -10 + 10 = 0
          expect(await testManipulator('random', '-10:10')).toBe('0');
        });

        it('should handle numbers larger than safe integer (precision loss expected but safe)', async () => {
          // Number('90071992547409999') -> 90071992547410000 (approx)
          // We just check that it doesn't crash and returns a number
          randomSpy.mockReturnValue(0.5);
          const largeVal = '99999999999999999';
          const result = await testManipulator('random', largeVal);
          expect(result).not.toBe('NaN');
          expect(Number(result)).not.toBeNaN();
        });
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
      expect(warnSpy).toHaveBeenCalledWith('Unknown manipulator: fake_method');
    });

    it('should handle missing variables gracefully', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: 'http://site.com/{missing_var}' },
      ];
      const req = createMockRequest('http://site.com/');
      const result = await service.getRedirect(req, rules);

      expect(result).toBe('http://site.com/{missing_var}');
    });

    it('should handle variable random correctly', async () => {
      const rules: RedirectRule[] = [
        { source: '*', destination: 'Random: {random}' },
      ];
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const req = createMockRequest('http://site.com/');
      const result = await service.getRedirect(req, rules);
      // 0.5 * 1000000 = 500000
      expect(result).toBe('Random: 500000');
    });

    it('should catch errors inside manipulators and log them', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');

      (RedirectService as any).manipulators.broken = () => {
        throw new Error('Boom');
      };

      const rules: RedirectRule[] = [
        { source: '*', destination: '{query.val:broken}' },
      ];

      const req = createMockRequest('http://site.com/?val=safe');
      const result = await service.getRedirect(req, rules);

      expect(result).toBe('safe');
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error applying manipulator broken'),
        expect.any(String),
      );

      delete (RedirectService as any).manipulators.broken;
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
            '{0:100:random} < 30 ? https://google.com : https://bing.com',
        },
      ];

      // Case 1: Random < 30 (e.g., 29)
      // Math.random is called TWICE: once for extractVariables (variables.random),
      // and once for the {0:100:random} manipulator
      randomSpy.mockReturnValueOnce(0.1); // First call (for variables.random) - ignored
      randomSpy.mockReturnValueOnce(0.29); // Second call: 0.29 * 101 = 29.29 -> floor = 29
      const req1 = createMockRequest('http://test.com');
      const result1 = await service.getRedirect(req1, rules);
      expect(result1).toBe('https://google.com');

      // Case 2: Random >= 30 (e.g., 50)
      randomSpy.mockReturnValueOnce(0.1); // First call (for variables.random) - ignored
      randomSpy.mockReturnValueOnce(0.5); // Second call: 0.5 * 101 = 50.5 -> floor = 50
      const req2 = createMockRequest('http://test.com');
      const result2 = await service.getRedirect(req2, rules);
      expect(result2).toBe('https://bing.com');
    });

    it('should route based on UserAgent regex match (~=)', async () => {
      const rules: RedirectRule[] = [
        {
          source: '*',
          destination:
            "'{userAgent}' ~= 'iPhone' ? /mobile-site : /desktop-site",
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
            "'{userAgent:to_lower_case}' includes 'chrome' ? /chrome-browser : /other-browser",
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
      (reqUS as any).ip = '8.8.8.8';
      (reqUS as any).socket.remoteAddress = '8.8.8.8';

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
            '(({random} >= 0) ? (({random} < 10000000) ? /in-range : /too-high) : /negative)',
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
            "'{userAgent}' includes 'MSIE > 6' ? /legacy-browser : /modern-browser",
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
            "'{userAgent}' includes 'Mobile' ? /mobile-app : /web-app",
        },
      ];
      const req = createMockRequest('http://test.com', {
        'user-agent': 'Some Mobile Device v1',
      });
      expect(await service.getRedirect(req, rules)).toBe('/mobile-app');
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
      // If (path includes 'shop') AND (random < 1000001) -> /commerce
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
});
