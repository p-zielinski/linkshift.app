import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ClsModule } from 'nestjs-cls';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import type { Request } from 'express';
import { DocsAssistantController } from './api/docs-assistant.controller';
import { McpController } from './mcp/mcp.controller';
import { PublicToolsController } from './api/public-tools.controller';
import { TraceController } from './api/trace.controller';
import { AppController } from './app.controller';
import { DocsAssistantRateLimitService } from './docs-assistant/docs-assistant-rate-limit.service';
import { DocsAssistantService } from './docs-assistant/docs-assistant.service';
import { DocsCatalogService } from './docs-assistant/docs-catalog.service';
import { DocsContentLoaderService } from './docs-assistant/docs-content-loader.service';
import { RedisModule } from './redis/redis.module';
import { QrCodeService } from './qr-code/qr-code.service';
import { QrCodeRateLimitService } from './qr-code/qr-code-rate-limit.service';
import { RedirectTraceService } from './redirect-trace/redirect-trace.service';
import { RedirectTraceRateLimitService } from './redirect-trace/redirect-trace-rate-limit.service';
import { McpDocsCatalogSearchService } from './mcp/mcp-docs-catalog-search.service';
import { McpHttpService } from './mcp/mcp-http.service';
import { McpRateLimitService } from './mcp/mcp-rate-limit.service';
import { TurnstileGuard } from './security/turnstile.guard';
import { createRequestId } from './utils';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
        const isProduction = nodeEnv === 'production';
        const usePrettyLogs =
          !isProduction &&
          (configService.get<string>('LOG_PRETTY') ?? 'false') === 'true';

        return {
          pinoHttp: {
            level: 'debug',
            transport: usePrettyLogs
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,
            redact: {
              paths: ['authorization', '*.authorization', 'req.headers.authorization'],
              remove: true,
            },
            genReqId: (req, res) => {
              const header = req.headers['x-request-id'];
              const requestId = Array.isArray(header)
                ? header[0]
                : (header ?? createRequestId());
              res.setHeader('X-Request-Id', requestId);
              return requestId;
            },
            customProps: (req) => ({
              requestId: req.id,
            }),
          },
        };
      },
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request): string => {
          const header = req.headers['x-request-id'];
          if (Array.isArray(header)) {
            return header[0] ?? createRequestId();
          }
          return header ?? createRequestId();
        },
      },
    }),
    HttpModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    RedisModule,
  ],
  controllers: [
    AppController,
    PublicToolsController,
    TraceController,
    DocsAssistantController,
    McpController,
  ],
  providers: [
    QrCodeService,
    QrCodeRateLimitService,
    RedirectTraceService,
    RedirectTraceRateLimitService,
    DocsCatalogService,
    DocsContentLoaderService,
    DocsAssistantService,
    DocsAssistantRateLimitService,
    McpRateLimitService,
    McpHttpService,
    McpDocsCatalogSearchService,
    TurnstileGuard,
  ],
})
export class AppModule {}
