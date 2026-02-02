import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { OrganizationMembersService } from './organization/organization-members.service';
import { LegalService } from './legal/legal.service';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { DomainExtractorService } from './security/domain-extractor.service';
import { SafetyScannerService } from './security/safety-scanner.service';
import { DomainBlacklistService } from './security/domain-blacklist.service';
import { RedirectAnalyticsService } from './security/redirect-analytics.service';
import { SafetyRescanScheduler } from './security/safety-rescan.scheduler';
import { SafetyRescanProcessor } from './security/safety-rescan.processor';
import { SAFETY_RESCAN_QUEUE } from './security/security.constants';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
          req.headers['X-Request-Id'] ??
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
    AuthController,
    BillingController,
    OrganizationController,
    RedirectTestsController,
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
    AuthTokenService,
    EmailService,
    OrganizationMembersService,
    LegalService,
    RedisService,
    CacheManagerIdsService,
    CacheManagerService,
    DomainExtractorService,
    SafetyScannerService,
    DomainBlacklistService,
    RedirectAnalyticsService,
    SafetyRescanScheduler,
    SafetyRescanProcessor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiRedirectionMiddleware).forRoutes('*');
  }
}
