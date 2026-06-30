import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { RedirectService } from '../redirect/redirect.service';
import { Logger } from 'nestjs-pino';
import { ClsService } from 'nestjs-cls';
import { CheckDomainAccessService } from '../security/check-domain-access.service';

@Controller()
export class CaddyController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly checkDomainAccessService: CheckDomainAccessService,
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
  async checkDomain(
    @Req() req: Request,
    @Query('domain') domain?: string,
  ) {
    const requestId = this.clsService.getId();
    const clientIp = this.checkDomainAccessService.normalizeClientIp(req.ip);

    if (!this.checkDomainAccessService.isAllowedRequest(req)) {
      this.logger.warn('Caddy domain check blocked by IP allowlist', {
        requestId,
        clientIp,
      });
      throw new ForbiddenException('Domain not allowed');
    }

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
    const { allowed, outcome, hostType } =
      await this.redirectService.getDomainAllowCheck(requestedHostname);

    this.logger.log('Caddy domain check', {
      requestId,
      domain: requestedHostname,
      allowed,
      checkDomainOutcome: outcome,
      hostType,
    });

    if (!allowed) {
      this.logger.warn('Caddy domain check denied', {
        requestId,
        domain: requestedHostname,
        allowed,
        checkDomainOutcome: outcome,
        hostType,
      });
      throw new ForbiddenException('Domain not allowed');
    }

    return { allowed: true };
  }
}
