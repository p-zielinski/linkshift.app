import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
} from '@nestjs/common';
import { RedirectService } from '../redirect/redirect.service';
import { Logger } from 'nestjs-pino';
import { ClsService } from 'nestjs-cls';

@Controller()
export class CaddyController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly logger: Logger,
    private readonly clsService: ClsService,
  ) {}

  @Get('check-domain')
  async checkDomain(@Query('domain') domain?: string) {
    const requestId = this.clsService.getId();
    this.logger.log('Caddy domain check request', {
      requestId,
      domain,
    });
    if (!domain) {
      this.logger.log('Caddy domain check missing domain', {
        requestId,
      });
      throw new BadRequestException('Missing domain');
    }

    const allowed = await this.redirectService.isDomainAllowed(domain);

    this.logger.log('Caddy domain check', {
      requestId,
      domain,
      allowed,
    });

    if (!allowed) {
      this.logger.warn('Caddy domain check not allowed', {
        requestId,
        domain,
      });
      throw new ForbiddenException('Domain not allowed');
    }

    return { allowed: true };
  }
}
