import { Request, Response } from 'express';

const REDIRECT_DEMO_SUBDOMAIN = 'test';
const REDIRECT_DEMO_DEV_PATH_PREFIX = '/test';

export type RedirectDemoModeInput = {
  isProduction: boolean;
  requestHostname: string;
  apiHostname: string;
  originalUrl: string;
};

export function isRedirectDemoMode(input: RedirectDemoModeInput): boolean {
  const { isProduction, requestHostname, apiHostname, originalUrl } = input;

  if (isProduction) {
    return (
      extractSubdomainLabel(requestHostname, apiHostname) ===
      REDIRECT_DEMO_SUBDOMAIN
    );
  }

  return isDevRedirectDemoPath(originalUrl);
}

export function buildCurrentRequestUrl(req: Request): string {
  const forwardedProto = req.get('x-forwarded-proto');
  const protocol =
    forwardedProto?.split(',')[0]?.trim() || req.protocol || 'http';
  const host = req.get('host') ?? '';
  const path = req.originalUrl ?? req.url ?? '/';
  return `${protocol}://${host}${path}`;
}

export type RedirectDemoDestinationInput = {
  isProduction: boolean;
  apiHostname: string;
};

export function isRedirectDemoDestinationTarget(
  target: string,
  options: RedirectDemoDestinationInput,
): boolean {
  const trimmed = target.trim();
  if (!trimmed) {
    return false;
  }

  try {
    if (trimmed.startsWith('/')) {
      if (options.isProduction) {
        return false;
      }
      return isDevRedirectDemoPath(trimmed);
    }

    const parsed = new URL(trimmed);
    const hostname = normalizeDemoHostname(parsed.hostname);

    if (options.isProduction) {
      return (
        extractSubdomainLabel(
          hostname,
          normalizeDemoHostname(options.apiHostname),
        ) === REDIRECT_DEMO_SUBDOMAIN
      );
    }

    return isDevRedirectDemoPath(
      `${parsed.pathname}${parsed.search}${parsed.hash}`,
    );
  } catch {
    return false;
  }
}

export function resolveRedirectDestinationUrl(
  target: string,
  requestBaseUrl: string,
): string {
  const trimmed = target.trim();
  if (!trimmed) {
    return requestBaseUrl;
  }

  try {
    if (trimmed.startsWith('/')) {
      return new URL(trimmed, requestBaseUrl).toString();
    }
    return new URL(trimmed).toString();
  } catch {
    return trimmed;
  }
}

export type RedirectDemoPageContent = {
  currentUrl: string;
  referer: string;
};

export function sendRedirectDemoPage(
  req: Request,
  res: Response,
  content?: Partial<RedirectDemoPageContent>,
): void {
  const currentUrl = content?.currentUrl ?? buildCurrentRequestUrl(req);
  const referer =
    content?.referer ??
    (req.get('referer') ?? req.get('referrer') ?? '').trim();

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'",
  );
  res.status(200).send(buildRedirectDemoHtml({ currentUrl, referer }));
}

function extractSubdomainLabel(
  hostname: string,
  baseHost: string,
): string | null {
  if (!hostname || !baseHost || hostname === baseHost) {
    return null;
  }

  const suffix = `.${baseHost}`;
  if (!hostname.endsWith(suffix)) {
    return null;
  }

  const label = hostname.slice(0, hostname.length - suffix.length);
  if (!label || label.includes('.')) {
    return null;
  }

  return label;
}

function isDevRedirectDemoPath(originalUrl: string): boolean {
  const path = originalUrl.split('?')[0]?.split('#')[0] ?? '';
  return (
    path === REDIRECT_DEMO_DEV_PATH_PREFIX ||
    path.startsWith(`${REDIRECT_DEMO_DEV_PATH_PREFIX}/`)
  );
}

function normalizeDemoHostname(value: string): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
}

function buildRedirectDemoHtml({
  currentUrl,
  referer,
}: {
  currentUrl: string;
  referer: string;
}): string {
  const refererContent = referer
    ? `<a class="url" href="${escapeHtmlAttribute(referer)}">${escapeHtml(referer)}</a>`
    : `<span class="muted">Referrer not available</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LinkShift redirect demo</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #38bdf8;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at top, #1e3a5f 0%, var(--bg) 55%);
      color: var(--text);
      display: grid;
      place-items: center;
      padding: 24px;
    }
    main {
      width: min(640px, 100%);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px 24px;
      box-shadow: 0 24px 48px rgba(15, 23, 42, 0.35);
    }
    h1 {
      margin: 0 0 8px;
      font-size: 1.35rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .intro {
      margin: 0 0 24px;
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    section + section { margin-top: 20px; }
    .label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .value {
      padding: 12px 14px;
      border-radius: 10px;
      background: rgba(15, 23, 42, 0.55);
      border: 1px solid var(--border);
      word-break: break-all;
      font-size: 0.92rem;
      line-height: 1.45;
    }
    .url { color: var(--accent); text-decoration: none; }
    .url:hover { text-decoration: underline; }
    .muted { color: var(--muted); }
  </style>
</head>
<body>
  <main>
    <h1>Redirect demo</h1>
    <p class="intro">This page shows where your browser landed and where it came from, when that data is available.</p>
    <section>
      <div class="label">Current address</div>
      <div class="value"><a class="url" href="${escapeHtmlAttribute(currentUrl)}">${escapeHtml(currentUrl)}</a></div>
    </section>
    <section>
      <div class="label">Referred from</div>
      <div class="value">${refererContent}</div>
    </section>
  </main>
</body>
</html>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value);
}
