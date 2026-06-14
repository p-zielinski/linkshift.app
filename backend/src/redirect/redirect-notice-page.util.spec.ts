import {
  buildRedirectNoticeHtml,
  escapeHtml,
  REDIRECT_NOTICE_CONTENT_SECURITY_POLICY,
  sendRedirectNoticePage,
} from './redirect-notice-page.util';

describe('redirect-notice-page.util', () => {
  describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
      expect(escapeHtml('<script>"\'&</script>')).toBe(
        '&lt;script&gt;&quot;&#39;&amp;&lt;/script&gt;',
      );
    });
  });

  describe('buildRedirectNoticeHtml', () => {
    it('includes escaped destination and safe JSON target', () => {
      const target = 'https://example.com/path?x=1&y="2"';
      const html = buildRedirectNoticeHtml(target, 10);

      expect(html).toContain('https://example.com/path?x=1&amp;y=&quot;2&quot;');
      expect(html).toContain(
        'var target = "https://example.com/path?x=1&y=\\"2\\"";',
      );
      expect(html).toContain('id="countdown-number">10</div>');
      expect(html).toContain('Redirecting in 10 seconds…');
      expect(html).toContain('Continue now');
      expect(html).toContain('#c03762');
      expect(html).toContain("event.persisted");
      expect(html).toContain('startCountdown()');
    });

    it('sendRedirectNoticePage sets html content type and permissive csp', () => {
      const res = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      sendRedirectNoticePage(res as any, 'https://example.com/new', 10);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/html; charset=utf-8',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        REDIRECT_NOTICE_CONTENT_SECURITY_POLICY,
      );
      expect(REDIRECT_NOTICE_CONTENT_SECURITY_POLICY).toContain(
        "style-src 'unsafe-inline'",
      );
      expect(REDIRECT_NOTICE_CONTENT_SECURITY_POLICY).toContain(
        "script-src 'unsafe-inline'",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('https://example.com/new'),
      );
    });

    it('clamps delay between 1 and 60 seconds', () => {
      const html = buildRedirectNoticeHtml('https://example.com', 120);

      expect(html).toContain('var total = 60;');
    });

    it('uses default delay for invalid values', () => {
      const html = buildRedirectNoticeHtml('https://example.com', Number.NaN);

      expect(html).toContain('var total = 10;');
    });
  });
});
