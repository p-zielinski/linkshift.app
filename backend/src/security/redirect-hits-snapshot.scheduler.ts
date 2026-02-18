import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import {
  REDIRECT_HITS_SNAPSHOT_JOB,
  REDIRECT_HITS_SNAPSHOT_QUEUE,
} from './security.constants';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RedirectHitsSnapshotScheduler implements OnModuleInit {
  constructor(
    @InjectQueue(REDIRECT_HITS_SNAPSHOT_QUEUE)
    private readonly queue: Queue,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  async onModuleInit(): Promise<void> {
    const intervalMinutes = this.getIntervalMinutes();
    const lookbackHours = this.getLookbackHours();
    const scanCount = this.getScanCount();
    const zScanCount = this.getZScanCount();
    const batchSize = this.getBatchSize();
    const intervalMs = intervalMinutes * 60 * 1000;

    const repeatableJobs = await this.queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      const matches = job.name === REDIRECT_HITS_SNAPSHOT_JOB;
      const sameId = job.id === 'redirect-hits-snapshot';
      const sameInterval = job.every === intervalMs;
      if (matches && (!sameId || !sameInterval)) {
        await this.queue.removeRepeatableByKey(job.key);
      }
    }

    await this.queue.add(
      REDIRECT_HITS_SNAPSHOT_JOB,
      {
        lookbackHours,
        scanCount,
        zScanCount,
        batchSize,
      },
      {
        jobId: 'redirect-hits-snapshot',
        repeat: { every: intervalMs },
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );

    this.logger.log('Redirect hits snapshot schedule ensured', {
      intervalMinutes,
      lookbackHours,
    });
  }

  private getIntervalMinutes(): number {
    const raw = Number(
      this.configService.get<string>('REDIRECT_HITS_SNAPSHOT_INTERVAL_MINUTES'),
    );
    if (!Number.isFinite(raw)) return 5;
    return Math.min(Math.max(Math.floor(raw), 1), 60);
  }

  private getLookbackHours(): number {
    const raw = Number(
      this.configService.get<string>('REDIRECT_HITS_SNAPSHOT_LOOKBACK_HOURS'),
    );
    if (!Number.isFinite(raw)) return 2;
    return Math.min(Math.max(Math.floor(raw), 1), 24 * 31);
  }

  private getScanCount(): number {
    const raw = Number(
      this.configService.get<string>('REDIRECT_HITS_SNAPSHOT_SCAN_COUNT'),
    );
    if (!Number.isFinite(raw)) return 1000;
    return Math.min(Math.max(Math.floor(raw), 100), 5000);
  }

  private getZScanCount(): number {
    const raw = Number(
      this.configService.get<string>('REDIRECT_HITS_SNAPSHOT_ZSCAN_COUNT'),
    );
    if (!Number.isFinite(raw)) return 1000;
    return Math.min(Math.max(Math.floor(raw), 100), 5000);
  }

  private getBatchSize(): number {
    const raw = Number(
      this.configService.get<string>('REDIRECT_HITS_SNAPSHOT_BATCH_SIZE'),
    );
    if (!Number.isFinite(raw)) return 500;
    return Math.min(Math.max(Math.floor(raw), 100), 2000);
  }
}
