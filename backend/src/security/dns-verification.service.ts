import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as dnsPromises } from 'dns';
import { Logger } from 'nestjs-pino';
import { CacheManagerService } from '../cache/cache-manager.service';

const DNS_LOOKUP_TIMEOUT_MS = 3_000;
const DNS_VERIFY_CACHE_TTL_SECONDS = 600;
const MAX_CNAME_HOPS = 5;

@Injectable()
export class DnsVerificationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly logger: Logger,
  ) {}

  private getTargetIp(): string {
    return String(this.configService.get<string>('APP_DOMAIN_TARGET_IP') ?? '')
      .trim();
  }

  private getCacheKey(hostname: string): string {
    return `dns-verify:${hostname}`;
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`DNS lookup timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private normalizeHostname(value: string): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\.$/, '');
  }

  private async resolve4(hostname: string): Promise<string[]> {
    return this.withTimeout(dnsPromises.resolve4(hostname), DNS_LOOKUP_TIMEOUT_MS);
  }

  private async resolveCname(hostname: string): Promise<string[]> {
    return this.withTimeout(
      dnsPromises.resolveCname(hostname),
      DNS_LOOKUP_TIMEOUT_MS,
    );
  }

  private async resolveFinalARecords(hostname: string): Promise<string[]> {
    let current = this.normalizeHostname(hostname);

    for (let hop = 0; hop < MAX_CNAME_HOPS; hop += 1) {
      try {
        const cnames = await this.resolveCname(current);
        const next = this.normalizeHostname(cnames[0] ?? '');
        if (!next) {
          break;
        }
        current = next;
        continue;
      } catch {
        break;
      }
    }

    return this.resolve4(current);
  }

  async pointsToTarget(hostname: string): Promise<boolean> {
    const targetIp = this.getTargetIp();
    if (!targetIp) {
      this.logger.warn('APP_DOMAIN_TARGET_IP is not configured; DNS verification failed closed');
      return false;
    }

    const normalized = this.normalizeHostname(hostname);
    if (!normalized) {
      return false;
    }

    try {
      const aRecords = await this.resolveFinalARecords(normalized);
      return aRecords.includes(targetIp);
    } catch (error) {
      this.logger.debug('DNS verification lookup failed', {
        hostname: normalized,
        error,
      });
      return false;
    }
  }

  async getCachedOrVerify(hostname: string): Promise<boolean> {
    const normalized = this.normalizeHostname(hostname);
    if (!normalized) {
      return false;
    }

    const cacheKey = this.getCacheKey(normalized);
    const cached =
      await this.cacheManagerService.getCustomCache<boolean>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const verified = await this.pointsToTarget(normalized);
    await this.cacheManagerService.setCustomCache(
      cacheKey,
      verified,
      DNS_VERIFY_CACHE_TTL_SECONDS,
    );
    return verified;
  }
}
