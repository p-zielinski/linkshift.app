import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { ForbiddenError } from '@shared/models/error.model';
import { throwHttpException } from '../utils';

interface TurnstileVerifyResponse {
  success: boolean;
}

@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const secretKey = this.configService.get<string>('CLOUDFLARE_TURNSTILE_SECRET_KEY')?.trim();
    if (!secretKey) {
      const skipInDev =
        (this.configService.get<string>('NODE_ENV') ?? 'development') !== 'production' &&
        (this.configService.get<string>('TURNSTILE_SKIP_VERIFY') ?? 'false') === 'true';

      if (skipInDev) {
        this.logger.warn('Turnstile verification skipped (development)', {
          requestId: this.clsService.getId(),
        });
        return true;
      }

      if ((this.configService.get<string>('NODE_ENV') ?? 'development') !== 'production') {
        this.logger.warn('Turnstile secret missing; allowing request in non-production', {
          requestId: this.clsService.getId(),
        });
        return true;
      }

      return this.reject('Bot verification is not configured.');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const tokenHeader = request.headers['x-turnstile-token'];
    const token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;

    if (!token?.trim()) {
      return this.reject("Couldn't verify the request. Complete the bot check and try again.");
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<TurnstileVerifyResponse>(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            secret: secretKey,
            response: token,
            remoteip: this.extractClientIp(request),
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5_000,
          },
        ),
      );

      if (response.data?.success) {
        return true;
      }

      return this.reject("Couldn't verify the request. Complete the bot check and try again.");
    } catch (error) {
      this.logger.error('Turnstile verification request failed', {
        requestId: this.clsService.getId(),
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      return this.reject("Couldn't verify the request. Try again in a moment.");
    }
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
