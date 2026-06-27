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

  private normalizeHostname(value: string | undefined): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\.$/, '');
  }

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

    const requestedHostname = this.normalizeHostname(domain);
    const allowed =
      await this.redirectService.isDomainAllowed(requestedHostname);

    this.logger.log('Caddy domain check', {
      requestId,
      domain: requestedHostname,
      allowed,
    });

    if (!allowed) {
      this.logger.warn('Caddy domain check not allowed', {
        requestId,
        domain: requestedHostname,
      });
      throw new ForbiddenException('Domain not allowed');
    }

    return { allowed: true };
  }
}
