import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodFilter } from './filters/zod.filter';
import express from 'express';
import { ConfigService } from '@nestjs/config';
import { setCuidFingerprint } from './utils';
import { Logger } from 'nestjs-pino';
import { init as initSentry } from '@sentry/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const isProduction = nodeEnv === 'production';
  setCuidFingerprint(configService.get<string>('HOST_ID') ?? undefined);
  const sentryDsn =
    configService.get<string>('SENTRY_DSN') ??
    configService.get<string>('GLITCHTIP_DSN') ??
    '';
  if (sentryDsn) {
    initSentry({
      dsn: sentryDsn,
      environment: nodeEnv,
    });
  }

  const expressApp = app.getHttpAdapter().getInstance();
  if (configService.get<string>('TRUST_PROXY') === 'true') {
    expressApp.set('trust proxy', 1);
  }
  expressApp.disable('x-powered-by');
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );

  const corsOrigins = (configService.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const appWebOrigin = safeOrigin(
    configService.get<string>('APP_WEB_URL') ?? '',
  );
  const allowedOrigins = [
    ...corsOrigins,
    ...(appWebOrigin ? [appWebOrigin] : []),
  ];
  if (allowedOrigins.length === 0) {
    allowedOrigins.push('http://localhost:4200');
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'X-Requested-With',
      'X-XSRF-TOKEN',
    ],
  });

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()',
    );
    if (isProduction) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=15552000; includeSubDomains',
      );
    }
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none';",
    );
    next();
  });
  app.useGlobalFilters(new ZodFilter(logger, isProduction));

  const port = Number(configService.get<string>('PORT') ?? 3000);
  await app.listen(port);

  logger.log('Application port', { port });
  const ngrokUrl = configService.get<string>('NGROK_URL');
  if (ngrokUrl) {
    logger.log('Ngrok tunnel available', { url: ngrokUrl });
  }
}

bootstrap();

function safeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
