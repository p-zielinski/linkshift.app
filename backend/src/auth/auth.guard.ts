import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from './jwt.service';
import { ForbiddenError, UnauthorizedError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import {
  CacheManagerService,
  DataType,
  CachedByProperty,
} from '../cache/cache-manager.service';
import { LegalService } from '../legal/legal.service';
import { Logger } from 'nestjs-pino';
import { AuthenticatedPrincipal } from './auth-context.model';
import { shouldBypassLegalConsentCheck } from './legal-consent-bypass.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly clsService: ClsService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly legalService: LegalService,
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return this.throwUnauthorizedError();
    }

    const payload = this.jwtService.verifyToken(token);
    if (!payload) {
      return this.throwUnauthorizedError();
    }

    const user = await this.cacheManagerService.getData({
      dataType: DataType.USERS,
      properties: {
        [CachedByProperty.ID]: payload.userId,
      },
    });
    if (!user) {
      return this.throwUnauthorizedError();
    }

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

    this.logger.debug('User authentication succeeded', {
      requestId: this.clsService.getId(),
      userId: payload.userId,
      organizationId: payload.organizationId,
    });

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
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
