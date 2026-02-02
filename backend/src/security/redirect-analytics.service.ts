import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import {
  REDIRECT_HIT_PREFIX_GLOBAL,
  REDIRECT_HIT_PREFIX_ORG,
  REDIRECT_HIT_TTL_SECONDS,
  REDIRECT_TOP_TEMP_KEY_PREFIX,
} from './security.constants';

type RuleHit = { ruleId: string; hits: number };

@Injectable()
export class RedirectAnalyticsService {
  constructor(private readonly redisService: RedisService) {}

  async trackRuleHit(ruleId: string, organizationId: string): Promise<void> {
    if (!ruleId || !organizationId) return;

    const now = new Date();
    const hourKeyGlobal = this.buildHourlyKey(REDIRECT_HIT_PREFIX_GLOBAL, now);
    const hourKeyOrg = this.buildHourlyKey(
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
      keys.push(this.buildHourlyKey(prefix, date));
    }
    return keys;
  }

  private buildHourlyKey(prefix: string, date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    return `${prefix}:${year}${month}${day}${hour}`;
  }
}
