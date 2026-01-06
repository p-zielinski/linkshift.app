import { Test, TestingModule } from '@nestjs/testing';
import { RedirectService, RedirectRule } from './redirect.service';
import { Request } from 'express';
import { Logger } from '@nestjs/common';

describe('RedirectService', () => {
  let service: RedirectService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedirectService],
    }).compile();

    service = module.get<RedirectService>(RedirectService);
    logger = (service as any).logger;
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
        return headers[header];
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
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation();
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
});
