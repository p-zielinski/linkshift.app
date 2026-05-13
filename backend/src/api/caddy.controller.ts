import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedirectService } from '../redirect/redirect.service';
import { Logger } from 'nestjs-pino';
import { ClsService } from 'nestjs-cls';

@Controller()
export class CaddyController {
  constructor(
    private readonly configService: ConfigService,
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

  private isSubdomainOfBaseHost(hostname: string, baseHost: string): boolean {
    if (!hostname || !baseHost || hostname === baseHost) {
      return false;
    }
    return hostname.endsWith(`.${baseHost}`);
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
    const baseHost = this.normalizeHostname(
      this.configService.get<string>('API_HOSTNAME'),
    );

    // Always allow LinkShift-managed subdomains of the base host.
    if (this.isSubdomainOfBaseHost(requestedHostname, baseHost)) {
      this.logger.log('Caddy domain check allowed for base-host subdomain', {
        requestId,
        domain: requestedHostname,
        baseHost,
      });
      return { allowed: true };
    }

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
