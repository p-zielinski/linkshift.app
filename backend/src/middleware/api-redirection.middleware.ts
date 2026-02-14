import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { RedirectService } from '../redirect/redirect.service';
import { Logger } from 'nestjs-pino';

@Injectable()
export class ApiRedirectionMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly redirectService: RedirectService,
    private readonly logger: Logger,
  ) {
    this.isProduction =
      (this.configService.get<string>('NODE_ENV') ?? 'development') ===
      'production';
    this.logger.debug('ApiRedirectionMiddleware initialized', {
      isProduction: this.isProduction,
    });
  }

  private readonly isProduction: boolean;

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.hostname === this.configService.get('API_HOSTNAME')) {
      return next();
    }

    if (
      !this.isProduction &&
      req.originalUrl === '/api/v1/billing/webhooks/lemon-squeezy' &&
      req.method === 'POST'
    ) {
      return next();
    }

    await this.redirectService.applyRedirect(req, res);
  }
}
