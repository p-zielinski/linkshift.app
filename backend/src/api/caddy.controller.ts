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
    if (!domain) {
      this.logger.log('Caddy domain check missing domain', {
        requestId: this.clsService.getId(),
      });
      throw new BadRequestException('Missing domain');
    }

    if (domain === 'api.linkshift.app') {
      return { allowed: true };
    }

    const allowed = await this.redirectService.isDomainAllowed(domain);

    this.logger.log('Caddy domain check', {
      requestId: this.clsService.getId(),
      domain,
      allowed,
    });

    if (!allowed) {
      throw new ForbiddenException('Domain not allowed');
    }

    return { allowed: true };
  }
}
