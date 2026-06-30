const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileSkipReason = 'skip_verify_flag' | 'missing_secret_non_production';

export type TurnstileVerifyResult =
  | { ok: true; skipped?: false }
  | { ok: true; skipped: true; reason: TurnstileSkipReason }
  | { ok: false; reason: 'missing_token' | 'verification_failed' | 'request_failed' | 'not_configured' };

export type TurnstileSkipOptions = {
  nodeEnv?: string;
  skipVerify?: string;
  secretKey?: string;
};

export type TurnstileVerifyOptions = {
  secretKey: string;
  token: string;
  remoteIp?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export function shouldSkipTurnstileVerification(
  options: TurnstileSkipOptions,
): TurnstileSkipReason | null {
  const secretKey = options.secretKey?.trim();
  if (secretKey) {
    const skipInDev =
      (options.nodeEnv ?? 'development') !== 'production' &&
      (options.skipVerify ?? 'false') === 'true';
    if (skipInDev) {
      return 'skip_verify_flag';
    }
    return null;
  }

  if ((options.nodeEnv ?? 'development') !== 'production') {
    return 'missing_secret_non_production';
  }

  return null;
}

export async function verifyTurnstileToken(
  options: TurnstileVerifyOptions,
): Promise<TurnstileVerifyResult> {
  const token = options.token.trim();
  if (!token) {
    return { ok: false, reason: 'missing_token' };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 5_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: options.secretKey,
        response: token,
        remoteip: options.remoteIp,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, reason: 'request_failed' };
    }

    const payload = (await response.json()) as { success?: boolean };
    if (payload.success) {
      return { ok: true };
    }

    return { ok: false, reason: 'verification_failed' };
  } catch {
    return { ok: false, reason: 'request_failed' };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function extractTurnstileTokenFromHeader(
  header: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(header) ? header[0] : header;
  const trimmed = raw?.trim();
  return trimmed || undefined;
}
