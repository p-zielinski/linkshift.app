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
  const apiOrigin = safeOrigin(apiBase);
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

  const connectSrc = apiOrigin ? `'self' ${apiOrigin}` : "'self'";

  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
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
  const config = {
    APP_BASE_URL: process.env['APP_BASE_URL'] ?? 'http://localhost:3000',
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

  res.type('application/javascript');
  res.send(`window.APP_CONFIG = ${JSON.stringify(config)};`);
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
  '/profile',
  '/organization',
  '/domains',
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
