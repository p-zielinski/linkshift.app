import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { ForbiddenError } from '@shared/models/error.model';
import {
  extractTurnstileTokenFromHeader,
  shouldSkipTurnstileVerification,
  verifyTurnstileToken,
} from '@shared/security/turnstile-verify';
import { throwHttpException } from '../utils';

@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    const secretKey = this.configService.get<string>('CLOUDFLARE_TURNSTILE_SECRET_KEY')?.trim();
    const skipReason = shouldSkipTurnstileVerification({
      nodeEnv,
      skipVerify: this.configService.get<string>('TURNSTILE_SKIP_VERIFY'),
      secretKey,
    });

    if (skipReason) {
      this.logger.warn('Turnstile verification skipped', {
        requestId: this.clsService.getId(),
        reason: skipReason,
      });
      return true;
    }

    if (!secretKey) {
      return this.reject('Bot verification is not configured.');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractTurnstileTokenFromHeader(request.headers['x-turnstile-token']);

    if (!token) {
      return this.reject("Couldn't verify the request. Complete the bot check and try again.");
    }

    const result = await verifyTurnstileToken({
      secretKey,
      token,
      remoteIp: this.extractClientIp(request),
    });

    if (result.ok) {
      return true;
    }

    if (result.reason === 'request_failed') {
      this.logger.error('Turnstile verification request failed', {
        requestId: this.clsService.getId(),
      });
      return this.reject("Couldn't verify the request. Try again in a moment.");
    }

    return this.reject("Couldn't verify the request. Complete the bot check and try again.");
  }

  private extractClientIp(request: Request): string | undefined {
    const value = request.ip?.trim();
    if (value) {
      return value;
    }

    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const [first] = forwarded.split(',');
      return first?.trim() || undefined;
    }

    return undefined;
  }

  private reject(details: string): never {
    return throwHttpException(
      new ForbiddenError({
        requestId: this.clsService.getId() ?? 'missing_request_id',
        details,
      }),
    );
  }
}
