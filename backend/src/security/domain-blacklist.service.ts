import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { DOMAIN_BLACKLIST_SET_KEY } from './security.constants';

@Injectable()
export class DomainBlacklistService {
  private readonly logger = new Logger(DomainBlacklistService.name);

  constructor(private readonly redisService: RedisService) {}

  async isBlacklisted(domain: string): Promise<boolean> {
    const normalized = this.normalize(domain);
    if (!normalized) return false;
    return this.redisService.sismember(DOMAIN_BLACKLIST_SET_KEY, normalized);
  }

  async addDomains(domains: string[]): Promise<void> {
    const normalized = [
      ...new Set(
        domains
          .map((domain) => this.normalize(domain))
          .filter((domain): domain is string => Boolean(domain)),
      ),
    ];

    if (normalized.length === 0) return;

    await this.redisService.sadd(DOMAIN_BLACKLIST_SET_KEY, normalized);
    this.logger.warn(
      JSON.stringify({
        event: 'domain_blacklist_add',
        domains: normalized,
      }),
    );
  }

  private normalize(value: string): string | null {
    if (!value) return null;
    const trimmed = value.trim().toLowerCase();
    return trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
  }
}
