import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Bypass authentication if this is NOT an API request
    // (e.g. redirect traffic handling)
    const apiHostname = this.configService.get<string>('API_HOSTNAME');
    if (request.hostname !== apiHostname) {
      return true; // Allow access, controller will handle the redirect
    }

    // 2. Standard Token Validation for API calls
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verifyToken(token);
      if (!payload) {
        throw new UnauthorizedException();
      }
      // Attach user to request object so controllers can access it via @User()
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
