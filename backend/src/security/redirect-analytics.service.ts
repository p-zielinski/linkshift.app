import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma.service';
import {
  REDIRECT_HIT_PREFIX_GLOBAL,
  REDIRECT_HIT_PREFIX_ORG,
  REDIRECT_HIT_TTL_SECONDS,
  REDIRECT_TOP_TEMP_KEY_PREFIX,
} from './security.constants';
import { Logger } from 'nestjs-pino';
import { buildHourlyKey } from './redirect-analytics-keys';
import { Prisma } from '@prisma/client';

type RuleHit = { ruleId: string; hits: number };
type TrackRuleHitDetails = {
  requestMethod?: string;
  requestPath?: string;
  requestUrl?: string;
  requestQuery?: string;
  destination?: string;
  linkMapKey?: string | null;
};

const ANALYTICS_MAX_REQUEST_METHOD = 16;
const ANALYTICS_MAX_REQUEST_PATH = 1024;
const ANALYTICS_MAX_REQUEST_QUERY = 2048;
const ANALYTICS_MAX_REQUEST_URL = 3072;
const ANALYTICS_MAX_DESTINATION = 4096;
const ANALYTICS_MAX_LINK_MAP_KEY = 512;

@Injectable()
export class RedirectAnalyticsService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {
  }

  async trackRuleHit(
    ruleId: string,
    organizationId: string,
    details?: TrackRuleHitDetails,
  ): Promise<void> {
    if (!ruleId || !organizationId) return;

    const now = new Date();
    const hourKeyGlobal = buildHourlyKey(REDIRECT_HIT_PREFIX_GLOBAL, now);
    const hourKeyOrg = buildHourlyKey(
      `${REDIRECT_HIT_PREFIX_ORG}:${organizationId}`,
      now,
    );

    await Promise.all([
      this.redisService.zIncrBy(hourKeyGlobal, 1, ruleId),
      this.redisService.zIncrBy(hourKeyOrg, 1, ruleId),
    ]);

    await Promise.all([
      this.redisService.expire(hourKeyGlobal, REDIRECT_HIT_TTL_SECONDS),
      this.redisService.expire(hourKeyOrg, REDIRECT_HIT_TTL_SECONDS),
    ]);

    try {
      const breakdown = this.normalizeBreakdown(details);
      const fingerprint = this.buildBreakdownFingerprint(breakdown);
      const bucketStart = this.toBucketStart(now);

      await this.prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO "RedirectRuleHitBreakdownHourly" (
            "ruleId",
            "organizationId",
            "bucketStart",
            "fingerprint",
            "requestMethod",
            "requestPath",
            "requestQuery",
            "requestUrl",
            "destination",
            "linkMapKey",
            "hits",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${ruleId},
            ${organizationId},
            ${bucketStart},
            ${fingerprint},
            ${breakdown.requestMethod},
            ${breakdown.requestPath},
            ${breakdown.requestQuery},
            ${breakdown.requestUrl},
            ${breakdown.destination},
            ${breakdown.linkMapKey},
            1,
            ${now},
            ${now}
          )
          ON CONFLICT ("ruleId", "organizationId", "bucketStart", "fingerprint")
          DO UPDATE SET
            "hits" = "RedirectRuleHitBreakdownHourly"."hits" + 1,
            "updatedAt" = EXCLUDED."updatedAt";
        `,
      );
    } catch (error) {
      this.logger.error('Redirect hit breakdown tracking failed', {
        ruleId,
        organizationId,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
    }
  }

  async getTopRulesForOrganization(
    organizationId: string,
    limit: number,
    windowHours = 24,
  ): Promise<RuleHit[]> {
    const keyPrefix = `${REDIRECT_HIT_PREFIX_ORG}:${organizationId}`;
    return this.getTopRules(
      keyPrefix,
      `org:${organizationId}`,
      limit,
      windowHours,
    );
  }

  async getTopRulesGlobal(
    limit: number,
    windowHours = 24,
  ): Promise<RuleHit[]> {
    return this.getTopRules(
      REDIRECT_HIT_PREFIX_GLOBAL,
      'global',
      limit,
      windowHours,
    );
  }

  private async getTopRules(
    prefix: string,
    scope: string,
    limit: number,
    windowHours: number,
  ): Promise<RuleHit[]> {
    const boundedWindow = Math.min(Math.max(windowHours, 1), 24 * 31);
    const keys = this.buildHourlyKeys(prefix, boundedWindow);
    const tempKey = `${REDIRECT_TOP_TEMP_KEY_PREFIX}:${scope}:${Date.now()}`;

    await this.redisService.zUnionStore(tempKey, keys);
    await this.redisService.expire(tempKey, 60);

    const results = await this.redisService.zRevRangeWithScores(
      tempKey,
      0,
      Math.max(0, limit - 1),
    );

    return results.map((entry) => ({
      ruleId: entry.member,
      hits: entry.score,
    }));
  }

  private buildHourlyKeys(prefix: string, hours: number): string[] {
    const keys: string[] = [];
    const now = new Date();
    for (let i = 0; i < hours; i++) {
      const date = new Date(now.getTime() - i * 60 * 60 * 1000);
      keys.push(buildHourlyKey(prefix, date));
    }
    return keys;
  }

  private toBucketStart(value: Date): Date {
    return new Date(
      Date.UTC(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate(),
        value.getUTCHours(),
      ),
    );
  }

  private normalizeBreakdown(details?: TrackRuleHitDetails): {
    requestMethod: string;
    requestPath: string;
    requestQuery: string;
    requestUrl: string;
    destination: string;
    linkMapKey: string | null;
  } {
    const requestMethod = this.truncate(
      (details?.requestMethod ?? 'GET').toUpperCase(),
      ANALYTICS_MAX_REQUEST_METHOD,
    );

    const normalizedPath = this.normalizePath(details?.requestPath);
    const queryFromUrl = this.extractQueryFromUrl(details?.requestUrl);
    const requestQuery = this.normalizeQueryString(
      details?.requestQuery ?? queryFromUrl,
    );
    const requestUrl = this.truncate(
      requestQuery ? `${normalizedPath}?${requestQuery}` : normalizedPath,
      ANALYTICS_MAX_REQUEST_URL,
    );

    return {
      requestMethod,
      requestPath: this.truncate(normalizedPath, ANALYTICS_MAX_REQUEST_PATH),
      requestQuery: this.truncate(requestQuery, ANALYTICS_MAX_REQUEST_QUERY),
      requestUrl,
      destination: this.truncate(
        details?.destination ?? '',
        ANALYTICS_MAX_DESTINATION,
      ),
      linkMapKey: this.normalizeOptionalString(
        details?.linkMapKey,
        ANALYTICS_MAX_LINK_MAP_KEY,
      ),
    };
  }

  private normalizePath(path?: string): string {
    const raw = (path ?? '').trim();
    if (!raw) {
      return '/';
    }
    const withoutQuery = raw.split('?')[0] ?? '';
    const normalized = withoutQuery.startsWith('/')
      ? withoutQuery
      : `/${withoutQuery}`;
    return normalized || '/';
  }

  private extractQueryFromUrl(url?: string): string {
    const raw = (url ?? '').trim();
    if (!raw) {
      return '';
    }
    const queryIndex = raw.indexOf('?');
    if (queryIndex === -1) {
      return '';
    }
    return raw.slice(queryIndex + 1);
  }

  private normalizeQueryString(value?: string): string {
    const raw = (value ?? '').trim().replace(/^\?+/, '');
    if (!raw) {
      return '';
    }

    const params = new URLSearchParams(raw);
    const pairs = Array.from(params.entries()).sort(([keyA, valueA], [keyB, valueB]) => {
      if (keyA === keyB) {
        return valueA.localeCompare(valueB);
      }
      return keyA.localeCompare(keyB);
    });

    const normalized = new URLSearchParams();
    for (const [key, entryValue] of pairs) {
      normalized.append(key, entryValue);
    }

    return normalized.toString();
  }

  private normalizeOptionalString(
    value: string | null | undefined,
    maxLength: number,
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    const normalized = this.truncate(value, maxLength).trim();
    return normalized.length > 0 ? normalized : null;
  }

  private truncate(value: string, maxLength: number): string {
    if (!value) {
      return '';
    }
    return value.length > maxLength ? value.slice(0, maxLength) : value;
  }

  private buildBreakdownFingerprint(value: {
    requestMethod: string;
    requestPath: string;
    requestQuery: string;
    requestUrl: string;
    destination: string;
    linkMapKey: string | null;
  }): string {
    return createHash('sha256')
      .update(
        [
          value.requestMethod,
          value.requestPath,
          value.requestQuery,
          value.requestUrl,
          value.destination,
          value.linkMapKey ?? '',
        ].join('\u001f'),
      )
      .digest('hex');
  }
}
