import { Request, Response } from 'express';
import {
  buildCurrentRequestUrl,
  escapeHtml,
  isRedirectDemoDestinationTarget,
  isRedirectDemoMode,
  resolveRedirectDestinationUrl,
  sendRedirectDemoPage,
} from './redirect-demo-page';

function createMockRequest(overrides: Partial<Request> = {}): Request {
  const headers: Record<string, string> = {};
  return {
    protocol: 'http',
    hostname: 'localhost',
    originalUrl: '/test',
    url: '/test',
    get(name: string) {
      const key = name.toLowerCase();
      return headers[key];
    },
    ...overrides,
  } as Request;
}

function createMockResponse(): Response {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: '',
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    setHeader(name: string, value: string) {
      res.headers[name] = value;
      return res;
    },
    send(body: string) {
      res.body = body;
      return res;
    },
  };
  return res as unknown as Response;
}

describe('redirect-demo-page', () => {
  describe('isRedirectDemoMode', () => {
    it('enables demo mode on production test subdomain', () => {
      expect(
        isRedirectDemoMode({
          isProduction: true,
          requestHostname: 'test.linkshift.app',
          apiHostname: 'linkshift.app',
          originalUrl: '/anything',
        }),
      ).toBe(true);
    });

    it('disables demo mode on other production subdomains', () => {
      expect(
        isRedirectDemoMode({
          isProduction: true,
          requestHostname: 'mysite.linkshift.app',
          apiHostname: 'linkshift.app',
          originalUrl: '/go/abc',
        }),
      ).toBe(false);
    });

    it('enables demo mode on dev /test paths', () => {
      for (const originalUrl of ['/test', '/test/', '/test/foo', '/test?x=1']) {
        expect(
          isRedirectDemoMode({
            isProduction: false,
            requestHostname: 'localhost',
            apiHostname: 'localhost',
            originalUrl,
          }),
        ).toBe(true);
      }
    });

    it('disables demo mode on similar but non-demo dev paths', () => {
      for (const originalUrl of ['/testing', '/api/test', '/nottest']) {
        expect(
          isRedirectDemoMode({
            isProduction: false,
            requestHostname: 'localhost',
            apiHostname: 'localhost',
            originalUrl,
          }),
        ).toBe(false);
      }
    });
  });

  describe('buildCurrentRequestUrl', () => {
    it('builds URL from protocol, host, and originalUrl', () => {
      const req = createMockRequest({
        protocol: 'https',
        originalUrl: '/test/demo?x=1',
        get(name: string) {
          if (name.toLowerCase() === 'host') {
            return 'test.linkshift.app';
          }
          return undefined;
        },
      });

      expect(buildCurrentRequestUrl(req)).toBe(
        'https://test.linkshift.app/test/demo?x=1',
      );
    });

    it('prefers x-forwarded-proto when present', () => {
      const req = createMockRequest({
        protocol: 'http',
        originalUrl: '/test',
        get(name: string) {
          const key = name.toLowerCase();
          if (key === 'host') return 'localhost:3000';
          if (key === 'x-forwarded-proto') return 'https';
          return undefined;
        },
      });

      expect(buildCurrentRequestUrl(req)).toBe('https://localhost:3000/test');
    });
  });

  describe('isRedirectDemoDestinationTarget', () => {
    it('detects dev demo destinations by path', () => {
      expect(
        isRedirectDemoDestinationTarget('http://localhost:3000/test/', {
          isProduction: false,
          apiHostname: 'localhost',
        }),
      ).toBe(true);
      expect(
        isRedirectDemoDestinationTarget('/test/', {
          isProduction: false,
          apiHostname: 'localhost',
        }),
      ).toBe(true);
    });

    it('detects production demo destinations by test subdomain', () => {
      expect(
        isRedirectDemoDestinationTarget('https://test.linkshift.app/', {
          isProduction: true,
          apiHostname: 'linkshift.app',
        }),
      ).toBe(true);
    });
  });

  describe('resolveRedirectDestinationUrl', () => {
    it('resolves relative demo targets against the request origin', () => {
      expect(
        resolveRedirectDestinationUrl(
          '/test/',
          'https://ee08.ngrok-free.app/short',
        ),
      ).toBe('https://ee08.ngrok-free.app/test/');
    });
  });

  describe('sendRedirectDemoPage', () => {
    it('renders current URL and referer in escaped HTML', () => {
      const req = createMockRequest({
        originalUrl: '/test/demo',
        get(name: string) {
          const key = name.toLowerCase();
          if (key === 'host') return 'localhost:3000';
          if (key === 'referer') return 'https://example.com/from?a=1&b=2';
          return undefined;
        },
      });
      const res = createMockResponse();

      sendRedirectDemoPage(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Content-Type']).toBe('text/html; charset=utf-8');
      expect(res.headers['Content-Security-Policy']).toContain(
        "style-src 'unsafe-inline'",
      );
      expect(res.body).toContain('http://localhost:3000/test/demo');
      expect(res.body).toContain(
        'https://example.com/from?a=1&amp;b=2',
      );
      expect(res.body).toContain('Current address');
      expect(res.body).toContain('Referred from');
    });

    it('shows fallback copy when referer is missing', () => {
      const req = createMockRequest({
        originalUrl: '/test',
        get(name: string) {
          if (name.toLowerCase() === 'host') return 'localhost:3000';
          return undefined;
        },
      });
      const res = createMockResponse();

      sendRedirectDemoPage(req, res);

      expect(res.body).toContain('Referrer not available');
    });

    it('uses explicit content overrides from redirect engine', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      sendRedirectDemoPage(req, res, {
        currentUrl: 'http://localhost:3000/test/',
        referer: 'https://ee08.ngrok-free.app/',
      });

      expect(res.body).toContain('http://localhost:3000/test/');
      expect(res.body).toContain('https://ee08.ngrok-free.app/');
    });
  });

  describe('escapeHtml', () => {
    it('escapes HTML-sensitive characters', () => {
      expect(escapeHtml(`<script>"'&</script>`)).toBe(
        '&lt;script&gt;&quot;&#39;&amp;&lt;/script&gt;',
      );
    });
  });
});
