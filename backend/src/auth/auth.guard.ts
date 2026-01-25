import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from './jwt.service';
import { UnauthorizedError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly clsService: ClsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 2. Standard Token Validation for API calls
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return this.throwUnauthorizedError();
    }

    try {
      const payload = this.jwtService.verifyToken(token);
      if (!payload) {
        return this.throwUnauthorizedError();
      }
      // Attach user to request object so controllers can access it via @User()
      request['user'] = payload;
    } catch {
      return this.throwUnauthorizedError();
    }
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
}
