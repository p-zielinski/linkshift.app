import {
  extractTurnstileTokenFromHeader,
  shouldSkipTurnstileVerification,
  verifyTurnstileToken,
} from '@shared/security/turnstile-verify';

describe('turnstile-verify', () => {
  describe('shouldSkipTurnstileVerification', () => {
    it('skips when TURNSTILE_SKIP_VERIFY is true in non-production', () => {
      expect(
        shouldSkipTurnstileVerification({
          nodeEnv: 'development',
          skipVerify: 'true',
          secretKey: 'secret',
        }),
      ).toBe('skip_verify_flag');
    });

    it('skips when secret is missing in non-production', () => {
      expect(
        shouldSkipTurnstileVerification({
          nodeEnv: 'development',
          skipVerify: 'false',
          secretKey: '',
        }),
      ).toBe('missing_secret_non_production');
    });

    it('does not skip in production without secret', () => {
      expect(
        shouldSkipTurnstileVerification({
          nodeEnv: 'production',
          skipVerify: 'false',
          secretKey: '',
        }),
      ).toBeNull();
    });
  });

  describe('extractTurnstileTokenFromHeader', () => {
    it('returns first token from array header', () => {
      expect(extractTurnstileTokenFromHeader([' token-1 ', 'token-2'])).toBe('token-1');
    });

    it('returns undefined for empty header', () => {
      expect(extractTurnstileTokenFromHeader(undefined)).toBeUndefined();
    });
  });

  describe('verifyTurnstileToken', () => {
    it('returns missing_token when token is blank', async () => {
      await expect(
        verifyTurnstileToken({
          secretKey: 'secret',
          token: '   ',
        }),
      ).resolves.toEqual({ ok: false, reason: 'missing_token' });
    });

    it('returns ok on successful verification', async () => {
      const fetchImpl = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await expect(
        verifyTurnstileToken({
          secretKey: 'secret',
          token: 'token',
          remoteIp: '127.0.0.1',
          fetchImpl,
        }),
      ).resolves.toEqual({ ok: true });

      expect(fetchImpl).toHaveBeenCalledWith(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            secret: 'secret',
            response: 'token',
            remoteip: '127.0.0.1',
          }),
        }),
      );
    });

    it('returns verification_failed when Cloudflare rejects token', async () => {
      const fetchImpl = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false }),
      });

      await expect(
        verifyTurnstileToken({
          secretKey: 'secret',
          token: 'token',
          fetchImpl,
        }),
      ).resolves.toEqual({ ok: false, reason: 'verification_failed' });
    });

    it('returns request_failed when fetch throws', async () => {
      const fetchImpl = jest.fn().mockRejectedValue(new Error('network'));

      await expect(
        verifyTurnstileToken({
          secretKey: 'secret',
          token: 'token',
          fetchImpl,
        }),
      ).resolves.toEqual({ ok: false, reason: 'request_failed' });
    });
  });
});
