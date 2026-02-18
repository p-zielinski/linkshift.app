import { Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { RedirectHitsSnapshotService } from './redirect-hits-snapshot.service';
import {
  REDIRECT_HITS_SNAPSHOT_JOB,
  REDIRECT_HITS_SNAPSHOT_QUEUE,
} from './security.constants';
import { Logger } from 'nestjs-pino';

type SnapshotJob = {
  lookbackHours: number;
  scanCount: number;
  zScanCount: number;
  batchSize: number;
};

@Injectable()
@Processor(REDIRECT_HITS_SNAPSHOT_QUEUE)
export class RedirectHitsSnapshotProcessor {
  constructor(
    private readonly snapshotService: RedirectHitsSnapshotService,
    private readonly logger: Logger,
  ) {}

  @Process(REDIRECT_HITS_SNAPSHOT_JOB)
  async handleSnapshot(job: Job<SnapshotJob>): Promise<void> {
    const payload = job.data ?? {
      lookbackHours: 2,
      scanCount: 1000,
      zScanCount: 1000,
      batchSize: 500,
    };

    try {
      await this.snapshotService.snapshotHourlyHits(payload);
      this.logger.log('Redirect hits snapshot completed', {
        lookbackHours: payload.lookbackHours,
      });
    } catch (error) {
      this.logger.error('Redirect hits snapshot failed', {
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      throw error;
    }
  }
}
