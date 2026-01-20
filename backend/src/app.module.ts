import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { RedirectService } from './redirect/redirect.service';
import { RuleValidatorService } from './rule-validator/rule-validator.service';
import { PrismaService } from './prisma.service';
import { JwtService } from './auth/jwt.service';
import { AuthGuard } from './auth/auth.guard';
import { DomainGroupsController } from './api/domain-groups.controller';
import { DomainsController } from './api/domains.controller';
import { RedirectRulesController } from './api/redirect-rules.controller';
import { AuthController } from './api/auth.controller';
import { AuthService } from './auth/auth.service';
import { ApiRedirectionMiddleware } from './middleware/api-redirection.middleware';
import { ClsModule } from 'nestjs-cls';
import { AppEntity, createCustomCuid } from './utils';
import { OrganizationService } from './organization/organization.service';
import { CacheManagerService } from './cache/cache-manager.service';
import { CacheManagerIdsService } from './cache/cache-manager-ids.service';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
  ],
  providers: [
    RedirectService,
    RuleValidatorService,
    OrganizationService,
    PrismaService,
    JwtService,
    AuthService,
    AuthGuard,
    RedisService,
    CacheManagerIdsService,
    CacheManagerService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiRedirectionMiddleware).forRoutes('*');
  }
}
