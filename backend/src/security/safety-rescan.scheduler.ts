import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { RedirectAnalyticsService } from './redirect-analytics.service';
import { SAFETY_RESCAN_QUEUE } from './security.constants';
import { Logger } from 'nestjs-pino';

@Injectable()
export class SafetyRescanScheduler {
  constructor(
    private readonly redirectAnalyticsService: RedirectAnalyticsService,
    @InjectQueue(SAFETY_RESCAN_QUEUE)
    private readonly queue: Queue,
    private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async enqueueTopRules(): Promise<void> {
    try {
      const topRules =
        await this.redirectAnalyticsService.getTopRulesGlobal(50);
      if (topRules.length === 0) {
        return;
      }

      await this.queue.addBulk(
        topRules.map((entry) => ({
          name: 'rescan',
          data: { ruleId: entry.ruleId, hits: entry.hits },
          opts: { removeOnComplete: true, removeOnFail: 50 },
        })),
      );

      this.logger.log('Safety rescan enqueued', {
        ruleCount: topRules.length,
      });
    } catch (error) {
      this.logger.error('Safety rescan enqueue failed', {
        error: error instanceof Error ? error.message : 'unknown_error',
      });
    }
  }
}
