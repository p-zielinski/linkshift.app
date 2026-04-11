import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedirectService } from './redirect/redirect.service';
import { RuleValidatorService } from './rule-validator/rule-validator.service';
import { PrismaService } from './prisma.service';
import { JwtService } from './auth/jwt.service';
import { AuthGuard } from './auth/auth.guard';
import { DomainGroupsController } from './api/domain-groups.controller';
import { DomainsController } from './api/domains.controller';
import { RedirectRulesController } from './api/redirect-rules.controller';
import { AuthController } from './api/auth.controller';
import { BillingController } from './api/billing.controller';
import { OrganizationController } from './api/organization.controller';
import { RedirectTestsController } from './api/redirect-tests.controller';
import { LinkMapsController } from './api/link-maps.controller';
import { LinkMapEntriesController } from './api/link-map-entries.controller';
import { ApiKeysController } from './api/api-keys.controller';
import { CaddyController } from './api/caddy.controller';
import { AuthService } from './auth/auth.service';
import { ApiRedirectionMiddleware } from './middleware/api-redirection.middleware';
import { ClsModule } from 'nestjs-cls';
import { AppEntity, createCustomCuid } from './utils';
import { OrganizationService } from './organization/organization.service';
import { CacheManagerService } from './cache/cache-manager.service';
import { CacheManagerIdsService } from './cache/cache-manager-ids.service';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { BillingService } from './billing/billing.service';
import { LemonSqueezyService } from './billing/lemon-squeezy.service';
import { LoginRateLimitService } from './auth/login-rate-limit.service';
import { NgrokDomainAssignerService } from './dev/ngrok-domain-assigner.service';
import { RedirectTestsService } from './redirect-tests/redirect-tests.service';
import { EmailService } from './email/email.service';
import { AuthTokenService } from './auth/auth-token.service';
import { ApiOrUserAuthGuard } from './auth/api-or-user-auth.guard';
import { OrganizationMembersService } from './organization/organization-members.service';
import { LegalService } from './legal/legal.service';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { DestinationExtractorService } from './security/destination-extractor.service';
import { SafetyScannerService } from './security/safety-scanner.service';
import { DomainBlacklistService } from './security/domain-blacklist.service';
import { RedirectAnalyticsService } from './security/redirect-analytics.service';
import { SafetyRescanScheduler } from './security/safety-rescan.scheduler';
import { SafetyRescanProcessor } from './security/safety-rescan.processor';
import {
  SAFETY_RESCAN_QUEUE,
} from './security/security.constants';
import { LoggerModule } from 'nestjs-pino';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryExceptionFilter } from './filters/sentry-exception.filter';
import { LinkMapService } from './link-map/link-map.service';
import { RedirectAnalyticsRetentionService } from './security/redirect-analytics-retention.service';
import { ApiKeyService } from './api-key/api-key.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
        const isProduction = nodeEnv === 'production';

        return {
          pinoHttp: {
            level: 'debug',
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                },
            redact: {
              paths: [
                'password',
                '*.password',
                'token',
                '*.token',
                'authorization',
                '*.authorization',
                'secret',
                '*.secret',
                'creditCard',
                '*.creditCard',
                'req.headers.authorization',
              ],
              remove: true,
            },
            genReqId: (req, res) => {
              const header = req.headers['x-request-id'];
              const requestId = Array.isArray(header)
                ? header[0]
                : (header ?? createCustomCuid(AppEntity.Request, 10));
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
    SentryModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: Number(configService.get<string>('REDIS_PORT')),
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    BullModule.registerQueue({ name: SAFETY_RESCAN_QUEUE }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request): string =>
          req.headers['x-request-id'] ??
          createCustomCuid(AppEntity.Request, 10),
      },
    }),
    RedisModule,
  ],
  controllers: [
    AppController,
    DomainGroupsController,
    DomainsController,
    RedirectRulesController,
    LinkMapsController,
    LinkMapEntriesController,
    ApiKeysController,
    AuthController,
    BillingController,
    OrganizationController,
    RedirectTestsController,
    CaddyController,
  ],
  providers: [
    RedirectService,
    RuleValidatorService,
    OrganizationService,
    PrismaService,
    JwtService,
    AuthService,
    BillingService,
    LemonSqueezyService,
    LoginRateLimitService,
    NgrokDomainAssignerService,
    RedirectTestsService,
    AuthGuard,
    ApiOrUserAuthGuard,
    ApiKeyService,
    AuthTokenService,
    EmailService,
    OrganizationMembersService,
    LegalService,
    RedisService,
    CacheManagerIdsService,
    CacheManagerService,
    DestinationExtractorService,
    SafetyScannerService,
    DomainBlacklistService,
    RedirectAnalyticsService,
    RedirectAnalyticsRetentionService,
    LinkMapService,
    SafetyRescanScheduler,
    SafetyRescanProcessor,
    {
      provide: APP_FILTER,
      useClass: SentryExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiRedirectionMiddleware).forRoutes('*');
  }
}
