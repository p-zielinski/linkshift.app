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
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.hostname === this.configService.get('API_HOSTNAME')) {
      return next();
    }

    await this.redirectService.applyRedirect(req, res);
  }
}
