import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { RedirectService } from './redirect.service';
import { RuleValidatorService } from './rule-validator.service';
import { PrismaService } from './prisma.service';
import { JwtService } from './auth/jwt.service';
import { AuthGuard } from './auth/auth.guard';
import { DomainGroupsController } from './api/domain-groups.controller';
import { DomainsController } from './api/domains.controller';
import { RedirectRulesController } from './api/redirect-rules.controller';
import { AuthController } from './api/auth.controller';
import { AuthService } from './auth/auth.service';
import { ApiRedirectionMiddleware } from './middleware/api-redirection.middleware';

@Module({
  imports: [ConfigModule.forRoot()],
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
    PrismaService,
    JwtService,
    AuthService,
    AuthGuard,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiRedirectionMiddleware).forRoutes('*');
  }
}
