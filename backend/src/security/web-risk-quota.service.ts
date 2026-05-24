import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { RedisService } from '../redis/redis.service';
import {
  WEB_RISK_MONTHLY_BUDGET_DEFAULT,
  WEB_RISK_MONTHLY_COUNTER_TTL_SECONDS,
  WEB_RISK_MONTHLY_USAGE_KEY_PREFIX,
  WEB_RISK_RESCAN_USAGE_THRESHOLD_PERCENT_DEFAULT,
  WEB_RISK_USAGE_WARNING_THRESHOLDS_DEFAULT,
  WEB_RISK_WARNED_THRESHOLDS_KEY_PREFIX,
} from './security.constants';

type WebRiskMonthlyStatus = {
  monthKey: string;
  usageCount: number;
  rawUsageCount: number;
  limit: number;
  usagePercent: number;
  isBudgetExhausted: boolean;
};

type WebRiskQuotaReservation = WebRiskMonthlyStatus & {
  requestedCalls: number;
  allowedCalls: number;
  skippedCalls: number;
};

type SafetyRescanQuotaDecision = {
  allowed: boolean;
  thresholdPercent: number;
  status: WebRiskMonthlyStatus;
};

@Injectable()
export class WebRiskQuotaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {}

  async reserveCalls(requestedCalls: number): Promise<WebRiskQuotaReservation> {
    const normalizedRequested = Math.max(0, Math.floor(requestedCalls));
    const status = await this.getMonthlyStatus();

    if (normalizedRequested === 0) {
      return {
        ...status,
        requestedCalls: 0,
        allowedCalls: 0,
        skippedCalls: 0,
      };
    }

    const usageKey = this.getUsageKey(status.monthKey);
    const nextRawUsage = await this.redisService.incrBy(
      usageKey,
      normalizedRequested,
    );

    if (nextRawUsage === normalizedRequested) {
      await this.redisService.expire(
        usageKey,
        WEB_RISK_MONTHLY_COUNTER_TTL_SECONDS,
      );
    }

    const usageBeforeReservation = nextRawUsage - normalizedRequested;
    const remainingBeforeReservation = Math.max(
      0,
      status.limit - usageBeforeReservation,
    );
    const allowedCalls = Math.min(
      normalizedRequested,
      remainingBeforeReservation,
    );
    const skippedCalls = normalizedRequested - allowedCalls;

    const nextStatus = this.toMonthlyStatus(
      status.monthKey,
      nextRawUsage,
      status.limit,
    );
    await this.reportThresholdCrossings(nextStatus);

    if (skippedCalls > 0) {
      this.logger.warn(
        'Web Risk monthly budget reached, skipping lookup calls',
        {
          monthKey: nextStatus.monthKey,
          limit: nextStatus.limit,
          rawUsageCount: nextStatus.rawUsageCount,
          usageCount: nextStatus.usageCount,
          usagePercent: nextStatus.usagePercent,
          requestedCalls: normalizedRequested,
          allowedCalls,
          skippedCalls,
        },
      );
    }

    return {
      ...nextStatus,
      requestedCalls: normalizedRequested,
      allowedCalls,
      skippedCalls,
    };
  }

  async getMonthlyStatus(): Promise<WebRiskMonthlyStatus> {
    const monthKey = this.getMonthKey();
    const usageKey = this.getUsageKey(monthKey);
    const rawUsageCount = (await this.redisService.get<number>(usageKey)) ?? 0;

    return this.toMonthlyStatus(
      monthKey,
      rawUsageCount,
      this.getMonthlyBudget(),
    );
  }

  async shouldRunRescan(): Promise<SafetyRescanQuotaDecision> {
    const thresholdPercent = this.getRescanThresholdPercent();
    const status = await this.getMonthlyStatus();

    return {
      allowed:
        !status.isBudgetExhausted && status.usagePercent < thresholdPercent,
      thresholdPercent,
      status,
    };
  }

  private toMonthlyStatus(
    monthKey: string,
    rawUsageCount: number,
    limit: number,
  ): WebRiskMonthlyStatus {
    const usageCount = Math.min(Math.max(rawUsageCount, 0), limit);
    const usagePercent =
      limit > 0 ? Number(((usageCount / limit) * 100).toFixed(2)) : 100;

    return {
      monthKey,
      limit,
      rawUsageCount: Math.max(rawUsageCount, 0),
      usageCount,
      usagePercent,
      isBudgetExhausted: usageCount >= limit,
    };
  }

  private async reportThresholdCrossings(
    status: WebRiskMonthlyStatus,
  ): Promise<void> {
    const usageThresholdKey = this.getWarnedThresholdsKey(status.monthKey);
    for (const threshold of this.getWarningThresholds()) {
      if (status.usagePercent < threshold) {
        continue;
      }

      const inserted = await this.redisService.sadd(
        usageThresholdKey,
        threshold.toString(),
      );
      if (inserted === 0) {
        continue;
      }

      await this.redisService.expire(
        usageThresholdKey,
        WEB_RISK_MONTHLY_COUNTER_TTL_SECONDS,
      );
      this.logger.warn('Web Risk monthly budget threshold reached', {
        monthKey: status.monthKey,
        thresholdPercent: threshold,
        usageCount: status.usageCount,
        rawUsageCount: status.rawUsageCount,
        usagePercent: status.usagePercent,
        limit: status.limit,
      });
    }
  }

  private getMonthKey(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = `${now.getUTCMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  }

  private getUsageKey(monthKey: string): string {
    return `${WEB_RISK_MONTHLY_USAGE_KEY_PREFIX}:${monthKey}`;
  }

  private getWarnedThresholdsKey(monthKey: string): string {
    return `${WEB_RISK_WARNED_THRESHOLDS_KEY_PREFIX}:${monthKey}`;
  }

  private getMonthlyBudget(): number {
    const configured = Number(
      this.configService.get<string>('WEB_RISK_MONTHLY_BUDGET'),
    );
    if (Number.isInteger(configured) && configured > 0) {
      return configured;
    }

    if (this.configService.get<string>('WEB_RISK_MONTHLY_BUDGET')) {
      this.logger.warn('Invalid WEB_RISK_MONTHLY_BUDGET, using default value', {
        defaultBudget: WEB_RISK_MONTHLY_BUDGET_DEFAULT,
      });
    }

    return WEB_RISK_MONTHLY_BUDGET_DEFAULT;
  }

  private getRescanThresholdPercent(): number {
    const configured = Number(
      this.configService.get<string>('WEB_RISK_RESCAN_USAGE_THRESHOLD_PERCENT'),
    );
    if (Number.isInteger(configured) && configured >= 1 && configured <= 100) {
      return configured;
    }

    return WEB_RISK_RESCAN_USAGE_THRESHOLD_PERCENT_DEFAULT;
  }

  private getWarningThresholds(): number[] {
    const configured = this.configService.get<string>(
      'WEB_RISK_USAGE_WARNING_THRESHOLDS',
    );
    if (!configured) {
      return WEB_RISK_USAGE_WARNING_THRESHOLDS_DEFAULT;
    }

    const parsed = configured
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 100);

    if (parsed.length === 0) {
      return WEB_RISK_USAGE_WARNING_THRESHOLDS_DEFAULT;
    }

    return [...new Set(parsed)].sort((left, right) => left - right);
  }
}
