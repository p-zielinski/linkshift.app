import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import express from 'express';
import { init as initSentry } from '@sentry/nestjs';
import { createSentryInitOptions } from './sentry/sentry.config';
import { AppModule } from './app.module';
import { ZodFilter } from './filters/zod.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const isProduction = nodeEnv === 'production';

  const sentryDsn = configService.get<string>('SENTRY_DSN') ?? '';
  if (sentryDsn) {
    initSentry(createSentryInitOptions(nodeEnv, sentryDsn));
  }

  const expressApp = app.getHttpAdapter().getInstance();
  if (configService.get<string>('TRUST_PROXY') === 'true') {
    expressApp.set('trust proxy', 1);
  }
  expressApp.disable('x-powered-by');

  app.use(
    express.json({
      limit: '512kb',
    }),
  );

  const corsOrigins = (configService.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const appWebOrigin = safeOrigin(configService.get<string>('APP_WEB_URL') ?? '');
  const appToolsOrigin = safeOrigin(configService.get<string>('APP_TOOLS_BASE_URL') ?? '');
  const allowedOrigins = [
    ...corsOrigins,
    ...(appWebOrigin ? [appWebOrigin] : []),
    ...(appToolsOrigin ? [appToolsOrigin] : []),
  ]
    .filter((value, index, array) => array.indexOf(value) === index);

  if (allowedOrigins.length === 0) {
    allowedOrigins.push('http://localhost:4200', 'http://localhost:4000');
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'X-Requested-With',
      'X-XSRF-TOKEN',
      'X-Turnstile-Token',
      'User-Agent',
      'Cache-Control',
      'Pragma',
      'Expires',
    ],
  });

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    if (isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
    next();
  });

  app.useGlobalFilters(new ZodFilter(logger, isProduction));

  const port = Number(configService.get<string>('PORT') ?? '3030');
  await app.listen(port);

  logger.log('Backend-tools application port', { port });
}

bootstrap();

function safeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
