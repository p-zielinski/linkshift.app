import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { ForbiddenError, UnauthorizedError } from '@shared/models/error.model';
import { throwHttpException } from '../utils';
import { JwtService } from './jwt.service';
import {
  CachedByProperty,
  CacheManagerService,
  DataType,
} from '../cache/cache-manager.service';
import { LegalService } from '../legal/legal.service';
import { AuthenticatedPrincipal } from './auth-context.model';
import { shouldBypassLegalConsentCheck } from './legal-consent-bypass.util';
import { ApiKeyService } from '../api-key/api-key.service';
import { User } from '@prisma/client';

@Injectable()
export class ApiOrUserAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly clsService: ClsService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly legalService: LegalService,
    private readonly apiKeyService: ApiKeyService,
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const bearerToken = this.extractBearerToken(request);
    const apiKeyToken = this.extractApiKey(request);

    if (bearerToken) {
      const payload = this.jwtService.verifyToken(bearerToken);
      if (!payload) {
        if (!apiKeyToken) {
          return this.throwUnauthorizedError();
        }
      } else {
        const user = await this.cacheManagerService.getData<User>({
          dataType: DataType.USERS,
          properties: {
            [CachedByProperty.ID]: payload.userId,
          },
        });

        if (!user) {
          if (!apiKeyToken) {
            return this.throwUnauthorizedError();
          }
        } else {
          if ((user as any).isBlocked) {
            return this.throwForbiddenError();
          }

          if (!shouldBypassLegalConsentCheck(request)) {
            const upToDate = this.legalService.isConsentUpToDate(user as any);
            if (!upToDate) {
              return this.throwLegalConsentError();
            }
          }

          const principal: AuthenticatedPrincipal = {
            authType: 'user',
            userId: payload.userId,
            organizationId: payload.organizationId,
          };
          request.user = principal;

          return true;
        }
      }
    }

    if (apiKeyToken) {
      const authContext = await this.apiKeyService.authenticate(apiKeyToken);
      const principal: AuthenticatedPrincipal = {
        authType: 'api_key',
        organizationId: authContext.organizationId,
        apiKeyId: authContext.apiKeyId,
      };

      request.user = principal;

      this.logger.debug('API key authentication succeeded', {
        requestId: this.clsService.getId(),
        organizationId: authContext.organizationId,
        apiKeyId: authContext.apiKeyId,
      });

      return true;
    }

    return this.throwUnauthorizedError();
  }

  private extractBearerToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractApiKey(request: Request): string | undefined {
    const fromHeader = request.header('x-api-key') ?? undefined;
    if (fromHeader) {
      return fromHeader;
    }

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type?.toLowerCase() === 'apikey' ? token : undefined;
  }

  private throwUnauthorizedError(): never {
    return throwHttpException(
      new UnauthorizedError({
        requestId: this.clsService.getId(),
      }),
    );
  }

  private throwForbiddenError(): never {
    return throwHttpException(
      new ForbiddenError({
        requestId: this.clsService.getId(),
        details: 'Account is blocked by the organization owner.',
      }),
    );
  }

  private throwLegalConsentError(): never {
    return throwHttpException(
      new ForbiddenError({
        requestId: this.clsService.getId(),
        details: 'Legal consent update required.',
      }),
    );
  }

}
