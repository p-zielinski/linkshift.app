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
import { WebRiskQuotaService } from './web-risk-quota.service';

type WebRiskSearchResponse = {
  threat?: {
    threatTypes?: string[];
    expireTime?: string;
  };
};

type FetchUnsafeDomainsResult = {
  unsafe: Set<string>;
  skipped: Set<string>;
  requestedCalls: number;
  allowedCalls: number;
  skippedCalls: number;
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
    private readonly webRiskQuotaService: WebRiskQuotaService,
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
        const scanResult = await this.fetchUnsafeDomains(toScan);

        const cacheHits = normalized.length - toScan.length;
        const cacheHitRate = Number(
          ((cacheHits / normalized.length) * 100).toFixed(2),
        );
        this.logger.debug('Safety scanner cache and quota summary', {
          normalizedCount: normalized.length,
          l2CandidatesCount: l2Candidates.length,
          toScanCount: toScan.length,
          cacheHits,
          cacheHitRate,
          requestedWebRiskCalls: scanResult.requestedCalls,
          allowedWebRiskCalls: scanResult.allowedCalls,
          skippedWebRiskCalls: scanResult.skippedCalls,
        });

        const writes = toScan.map(async (url) => {
          const safe = !scanResult.unsafe.has(url);
          const unverifiedSafe = scanResult.skipped.has(url) && safe;

          results.set(url, safe);
          if (unverifiedSafe) {
            return;
          }

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

  private async fetchUnsafeDomains(
    urls: string[],
  ): Promise<FetchUnsafeDomainsResult> {
    const threatUrls = new Map<string, string[]>();
    const threatEntries: Array<{ url: string }> = [];
    const uniqueCandidates = new Set<string>();
    const skipped = new Set<string>();

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
        threatUrls.set(candidate, [...(threatUrls.get(candidate) ?? []), cur]);
        if (!uniqueCandidates.has(candidate)) {
          uniqueCandidates.add(candidate);
          threatEntries.push({ url: candidate });
        }
      });
    }

    const apiKey = this.configService.get<string>('WEB_RISK_API_KEY');
    if (!apiKey) {
      throw new Error('WEB_RISK_API_KEY is not configured');
    }

    const configuredThreatTypes = this.configService.get<string>(
      'WEB_RISK_THREAT_TYPES',
    );
    const defaultThreatTypes = [
      'MALWARE',
      'SOCIAL_ENGINEERING',
      'UNWANTED_SOFTWARE',
    ];
    const threatTypes = configuredThreatTypes
      ? configuredThreatTypes
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : defaultThreatTypes;
    if (threatTypes.length === 0) {
      threatTypes.push(...defaultThreatTypes);
    }

    const endpoint = 'https://webrisk.googleapis.com/v1/uris:search';
    const quotaReservation = await this.webRiskQuotaService.reserveCalls(
      threatEntries.length,
    );
    const entriesToScan = threatEntries.slice(0, quotaReservation.allowedCalls);
    if (quotaReservation.skippedCalls > 0) {
      threatEntries.slice(quotaReservation.allowedCalls).forEach(({ url }) => {
        threatUrls.get(url)?.forEach((original) => skipped.add(original));
      });
      this.logger.warn(
        'Web Risk scan partially skipped due to monthly budget',
        {
          urlsCount: urls.length,
          candidatesCount: threatEntries.length,
          requestedCalls: quotaReservation.requestedCalls,
          allowedCalls: quotaReservation.allowedCalls,
          skippedCalls: quotaReservation.skippedCalls,
          skippedUrlsCount: skipped.size,
          monthKey: quotaReservation.monthKey,
          usageCount: quotaReservation.usageCount,
          usagePercent: quotaReservation.usagePercent,
          limit: quotaReservation.limit,
        },
      );
    }

    if (entriesToScan.length === 0) {
      return {
        unsafe: new Set<string>(),
        skipped,
        requestedCalls: quotaReservation.requestedCalls,
        allowedCalls: quotaReservation.allowedCalls,
        skippedCalls: quotaReservation.skippedCalls,
      };
    }

    this.logger.debug('Sending Web Risk scan requests', {
      urlsCount: urls.length,
      candidatesCount: threatEntries.length,
      requestedCalls: quotaReservation.requestedCalls,
      allowedCalls: quotaReservation.allowedCalls,
      skippedCalls: quotaReservation.skippedCalls,
    });

    const unsafe = new Set<string>();

    const chunkSize = 200;
    for (let i = 0; i < entriesToScan.length; i += chunkSize) {
      const chunk = entriesToScan.slice(i, i + chunkSize);
      const requests = chunk.map(async ({ url }) => {
        const requestUrl = new URL(endpoint);
        requestUrl.searchParams.set('uri', url);
        threatTypes.forEach((type) =>
          requestUrl.searchParams.append('threatTypes', type),
        );
        requestUrl.searchParams.set('key', apiKey);

        let response: Response;
        try {
          response = await fetch(requestUrl.toString(), { method: 'GET' });
        } catch (error) {
          this.logger.error('Web Risk request failed', {
            error: error instanceof Error ? error.message : 'unknown_error',
            url,
          });
          throw error;
        }

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          this.logger.error('Web Risk response error', {
            status: response.status,
            body,
            url,
          });
          throw new Error(`Web Risk request failed with ${response.status}`);
        }

        const data = (await response.json()) as WebRiskSearchResponse;
        if (!data.threat?.threatTypes?.length) return;

        threatUrls.get(url)?.forEach((original) => unsafe.add(original));
        try {
          const hostname = new URL(url).hostname.toLowerCase();
          unsafe.add(hostname);
          this.logger.warn('Security threat detected', {
            url,
            hostname,
            threatTypes: data.threat.threatTypes,
          });
        } catch {
          return;
        }
      });

      await Promise.all(requests);
    }

    return {
      unsafe,
      skipped,
      requestedCalls: quotaReservation.requestedCalls,
      allowedCalls: quotaReservation.allowedCalls,
      skippedCalls: quotaReservation.skippedCalls,
    };
  }
}
