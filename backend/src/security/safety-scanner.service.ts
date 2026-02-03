import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LRUCache } from 'lru-cache';
import { Logger } from 'nestjs-pino';
import { RedisService } from '../redis/redis.service';
import {
  SAFETY_CACHE_PREFIX,
  SAFETY_L1_TTL_MS,
  SAFETY_L2_TTL_SECONDS,
} from './security.constants';

type SafetyMatchResponse = {
  matches?: Array<{
    threat?: {
      url?: string;
      threatType?: string;
    };
  }>;
};

@Injectable()
export class SafetyScannerService {
  private readonly l1Cache = new LRUCache<string, boolean>({
    max: 5000,
    ttl: SAFETY_L1_TTL_MS,
  });

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {
  }

  async checkDomains(domains: string[]): Promise<Map<string, boolean>> {
    const normalized = [
      ...new Set(
        domains
          .map((domain) => this.normalizeDomain(domain))
          .filter((domain): domain is string => Boolean(domain)),
      ),
    ];

    const results = new Map<string, boolean>();
    if (normalized.length === 0) {
      return results;
    }

    const l2Candidates: string[] = [];
    for (const domain of normalized) {
      const cached = this.l1Cache.get(domain);
      if (cached !== undefined) {
        results.set(domain, cached);
        continue;
      }
      l2Candidates.push(domain);
    }

    if (l2Candidates.length > 0) {
      const l2Results = await Promise.all(
        l2Candidates.map((domain) =>
          this.redisService.get<boolean>(this.cacheKey(domain)),
        ),
      );

      const toScan: string[] = [];
      l2Results.forEach((value, index) => {
        const domain = l2Candidates[index];
        if (value === undefined) {
          toScan.push(domain);
          return;
        }
        results.set(domain, value);
        this.l1Cache.set(domain, value);
      });

      if (toScan.length > 0) {
        const unsafe = await this.fetchUnsafeDomains(toScan);
        const writes = toScan.map(async (domain) => {
          const safe = !unsafe.has(domain);
          results.set(domain, safe);
          this.l1Cache.set(domain, safe);
          await this.redisService.set(
            this.cacheKey(domain),
            safe,
            SAFETY_L2_TTL_SECONDS,
          );
        });
        await Promise.all(writes);
      }
    }

    return results;
  }

  private normalizeDomain(value: string): string | null {
    if (!value) return null;
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return null;

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        return new URL(trimmed).hostname.toLowerCase();
      } catch {
        return null;
      }
    }

    return trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
  }

  private cacheKey(domain: string): string {
    return `${SAFETY_CACHE_PREFIX}${domain}`;
  }

  private async fetchUnsafeDomains(domains: string[]): Promise<Set<string>> {
    const apiKey = this.configService.get<string>('SAFE_BROWSING_API_KEY');
    if (!apiKey) {
      throw new Error('SAFE_BROWSING_API_KEY is not configured');
    }

    const requestBody = {
      client: {
        clientId:
          this.configService.get<string>('SAFE_BROWSING_CLIENT_ID') ??
          'redirect-saas',
        clientVersion:
          this.configService.get<string>('SAFE_BROWSING_CLIENT_VERSION') ??
          '1.0.0',
      },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'UNWANTED_SOFTWARE',
          'POTENTIALLY_HARMFUL_APPLICATION',
        ],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: domains.map((domain) => ({
          url: `https://${domain}`,
        })),
      },
    };

    const endpoint = `https://safebrowsing.googleapis.com/v5/threatMatches:find?key=${apiKey}`;

    this.logger.debug('Sending batch safety scan request', {
      domainCount: domains.length,
    });

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      this.logger.error('Safety scan request failed', {
        error: error instanceof Error ? error.message : 'unknown_error',
        domainCount: domains.length,
      });
      throw error;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error('Safety scan response error', {
        status: response.status,
        body,
      });
      throw new Error(`Safe Browsing request failed with ${response.status}`);
    }

    const data = (await response.json()) as SafetyMatchResponse;
    const unsafe = new Set<string>();

    for (const match of data.matches ?? []) {
      const url = match.threat?.url;
      if (!url) continue;
      try {
        const hostname = new URL(url).hostname.toLowerCase();
        unsafe.add(hostname);
        this.logger.warn('Security threat detected', {
          url,
          hostname,
          threatType: match.threat?.threatType ?? 'unknown',
        });
      } catch {
        continue;
      }
    }

    return unsafe;
  }
}
