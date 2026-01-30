import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.disable('x-powered-by');

app.get('/runtime-config.js', (_req, res) => {
  const config = {
    APP_API_BASE_URL: process.env['APP_API_BASE_URL'] ?? 'http://localhost:3000',
    APP_SITE_NAME: process.env['APP_SITE_NAME'] ?? 'Redirect Control',
    APP_SITE_TAGLINE:
      process.env['APP_SITE_TAGLINE'] ?? 'Signal-driven redirect automation',
    APP_SUPPORT_EMAIL:
      process.env['APP_SUPPORT_EMAIL'] ?? 'support@redirectcontrol.app',
    APP_LEGAL_NAME:
      process.env['APP_LEGAL_NAME'] ?? 'Independent operator',
    APP_LEGAL_ADDRESS:
      process.env['APP_LEGAL_ADDRESS'] ?? 'Available upon request',
    APP_PRIVACY_EMAIL:
      process.env['APP_PRIVACY_EMAIL'] ?? process.env['APP_SUPPORT_EMAIL'] ?? 'privacy@redirectcontrol.app',
    APP_MIN_AGE: process.env['APP_MIN_AGE'] ?? '16',
    APP_LEGAL_VERSION: process.env['APP_LEGAL_VERSION'] ?? 'v1',
  };

  res.type('application/javascript');
  res.send(
    Object.entries(config)
      .map(([key, value]) => `window.${key} = ${JSON.stringify(value)};`)
      .join('\n'),
  );
});

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()',
  );

  const apiBase = process.env['APP_API_BASE_URL'] ?? 'http://localhost:3000';
  const apiOrigin = safeOrigin(apiBase);
  const connectSrc = apiOrigin ? `'self' ${apiOrigin}` : "'self'";

  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      `connect-src ${connectSrc}`,
      "frame-ancestors 'none'",
    ].join('; '),
  );

  next();
});
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * auth.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

function safeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
