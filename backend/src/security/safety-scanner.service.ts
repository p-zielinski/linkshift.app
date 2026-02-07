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
    threatType: string;
    platformType: string;
    threatEntryType: string;
    threat: {
      url: string;
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
  ) {}

  async checkUrls(urls: string[]): Promise<Map<string, boolean>> {
    const normalized = [
      ...new Set(
        urls
          .map((domain) => this.normalizeUrls(domain))
          .filter((domain): domain is string => Boolean(domain)),
      ),
    ];

    const results = new Map<string, boolean>();
    if (normalized.length === 0) {
      return results;
    }

    const l2Candidates: string[] = [];
    for (const url of normalized) {
      const cached = this.l1Cache.get(url);
      if (cached !== undefined) {
        results.set(url, cached);
        continue;
      }
      l2Candidates.push(url);
    }

    if (l2Candidates.length > 0) {
      const l2Results = await Promise.all(
        l2Candidates.map((url) =>
          this.redisService.get<boolean>(this.cacheKey(url)),
        ),
      );

      const toScan: string[] = [];
      l2Results.forEach((value, index) => {
        const url = l2Candidates[index];
        if (value === undefined) {
          toScan.push(url);
          return;
        }
        results.set(url, value);
        this.l1Cache.set(url, value);
      });

      if (toScan.length > 0) {
        const unsafe = await this.fetchUnsafeDomains(toScan);
        const writes = toScan.map(async (url) => {
          const safe = !unsafe.has(url);
          results.set(url, safe);
          this.l1Cache.set(url, safe);
          await this.redisService.set(
            this.cacheKey(url),
            safe,
            SAFETY_L2_TTL_SECONDS,
          );
        });
        await Promise.all(writes);
      }
    }

    return results;
  }

  private normalizeUrls(value: string): string | null {
    if (!value) return null;
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return null;

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed);
        return `${url.hostname}${url.pathname}`.toLowerCase();
      } catch {
        return null;
      }
    }

    return trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
  }

  private cacheKey(domain: string): string {
    return `${SAFETY_CACHE_PREFIX}${domain}`;
  }

  private toUrl(value: string): URL | null {
    try {
      return new URL(value);
    } catch {
      try {
        return new URL(`https://${value}`);
      } catch {
        return null;
      }
    }
  }

  private async fetchUnsafeDomains(urls: string[]): Promise<Set<string>> {
    const threatUrls = new Map<string, string[]>();
    const threatEntries: Array<{ url: string }> = [];
    const uniqueCandidates = new Set<string>();

    for (const cur of urls) {
      const parsed = this.toUrl(cur);
      if (!parsed) continue;

      const path =
        parsed.pathname && parsed.pathname !== '' ? parsed.pathname : '/';
      const fullPath = parsed.search ? `${path}${parsed.search}` : path;
      const candidates = [
        `https://${parsed.host}${fullPath}`,
        `http://${parsed.host}${fullPath}`,
        `https://${parsed.host}/`,
        `http://${parsed.host}/`,
      ];

      candidates.forEach((candidate) => {
        threatUrls.set(candidate, [
          ...(threatUrls.get(candidate) ?? []),
          cur,
        ]);
        if (!uniqueCandidates.has(candidate)) {
          uniqueCandidates.add(candidate);
          threatEntries.push({ url: candidate });
        }
      });
    }

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
        threatEntries,
      },
    };

    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

    this.logger.debug('Sending batch safety scan request', {
      urlsCount: urls.length,
    });

    const unsafe = new Set<string>();

    const chunkSize = 500;
    for (let i = 0; i < threatEntries.length; i += chunkSize) {
      const chunk = threatEntries.slice(i, i + chunkSize);
      const chunkBody = {
        ...requestBody,
        threatInfo: {
          ...requestBody.threatInfo,
          threatEntries: chunk,
        },
      };

      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chunkBody),
        });
      } catch (error) {
        this.logger.error('Safety scan request failed', {
          error: error instanceof Error ? error.message : 'unknown_error',
          urlsCount: urls.length,
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

      for (const match of data.matches ?? []) {
        const url = match.threat?.url;
        if (!url) continue;
        threatUrls.get(url)?.forEach((url) => unsafe.add(url));
        try {
          const hostname = new URL(url).hostname.toLowerCase();
          unsafe.add(hostname);
          this.logger.warn('Security threat detected', {
            url,
            hostname,
            threatType: 'unknown',
          });
        } catch {
          continue;
        }
      }
    }

    return unsafe;
  }
}
