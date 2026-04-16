import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

require('dotenv').config();

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();

app.disable('x-powered-by');

app.use((req, res, next) => {
  const apiBase = process.env['APP_BASE_URL'] ?? 'http://localhost:3000';
  const toolsApiBase = resolveToolsApiBase(apiBase);
  const apiOrigin = safeOrigin(apiBase);
  const toolsApiOrigin = safeOrigin(toolsApiBase);
  const origin = req.headers.origin;

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, X-Requested-With, X-XSRF-TOKEN',
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  const connectOrigins = [apiOrigin, toolsApiOrigin].filter(
    (value, index, array): value is string => !!value && array.indexOf(value) === index,
  );
  const connectSrc = connectOrigins.length
    ? `'self' ${connectOrigins.join(' ')}`
    : "'self'";

  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      `connect-src ${connectSrc}`,
      "frame-ancestors 'none'",
    ].join('; '),
  );

  next();
});

app.get('/robots.txt', (req, res) => {
  res.sendFile(join(browserDistFolder, 'robots.txt'));
});

app.get('/runtime-config.js', (_req, res) => {
  const appBaseUrl = process.env['APP_BASE_URL'] ?? 'http://localhost:3000';
  const config = {
    APP_BASE_URL: appBaseUrl,
    APP_TOOLS_BASE_URL: resolveToolsApiBase(appBaseUrl),
    APP_SITE_NAME: process.env['APP_SITE_NAME'] ?? 'LinkShift.app',
    APP_SITE_TAGLINE: process.env['APP_SITE_TAGLINE'] ?? 'Signal-driven redirect automation',
    APP_SUPPORT_EMAIL: process.env['APP_SUPPORT_EMAIL'] ?? 'support@redirectcontrol.app',
    APP_LEGAL_NAME: process.env['APP_LEGAL_NAME'] ?? 'Independent operator',
    APP_LEGAL_ADDRESS: process.env['APP_LEGAL_ADDRESS'] ?? 'Available upon request',
    APP_PRIVACY_EMAIL:
      process.env['APP_PRIVACY_EMAIL'] ??
      process.env['APP_SUPPORT_EMAIL'] ??
      'privacy@redirectcontrol.app',
    APP_MIN_AGE: process.env['APP_MIN_AGE'] ?? '16',
    APP_LEGAL_VERSION: process.env['APP_LEGAL_VERSION'] ?? 'v1',
    APP_AUTH_GATE_ENABLED: process.env['APP_AUTH_GATE_ENABLED'] ?? 'false',
    APP_DOMAIN_TARGET_IP: process.env['APP_DOMAIN_TARGET_IP'] ?? '',
  };

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.type('application/javascript');
  res.send(`window.APP_CONFIG = ${JSON.stringify(config)};`);
});

app.get('/linkshift-api-keys.openapi.yaml', (_req, res) => {
  const filePath = join(browserDistFolder, 'linkshift-api-keys.openapi.yaml');
  res.sendFile(filePath, (error) => {
    if (error) {
      if (!res.headersSent) {
        res.status(404).type('text/plain').send('Not found');
      }
    }
  });
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    fallthrough: true,
  }),
);

const CSR_ROUTES = [
  '/dashboard',
  '/tools',
  '/redirect-rules-analytics',
  '/profile',
  '/organization',
  '/domains',
  '/link-maps',
  '/domain-groups',
  '/redirect-rules',
  '/tests',
  '/legal/consent',
];

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const isCsrRoute = CSR_ROUTES.some((route) => req.path.startsWith(route));

  if (isCsrRoute) {
    res.sendFile(join(browserDistFolder, 'index.html'), (err) => {
      if (err) {
        next();
      }
    });
  } else {
    next();
  }
});

const angularApp = new AngularNodeAppEngine();

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);

function safeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function resolveToolsApiBase(appBaseUrl: string): string {
  const explicitToolsBaseUrl = process.env['APP_TOOLS_BASE_URL']?.trim();
  if (explicitToolsBaseUrl) {
    return explicitToolsBaseUrl;
  }

  return isLocalOrigin(appBaseUrl) ? 'http://localhost:3030' : appBaseUrl;
}

function isLocalOrigin(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  } catch {
    return false;
  }
}
