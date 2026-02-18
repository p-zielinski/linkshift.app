import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { Logger } from 'nestjs-pino';
import {
  buildOrgHourlyKeyPattern,
  parseOrganizationIdFromHourlyKey,
} from './redirect-analytics-keys';

dayjs.extend(utc);

type HourlyHitRow = {
  ruleId: string;
  organizationId: string;
  bucketStart: Date;
  hits: number;
};

@Injectable()
export class RedirectHitsSnapshotService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async snapshotHourlyHits(options: {
    lookbackHours: number;
    scanCount: number;
    zScanCount: number;
    batchSize: number;
  }): Promise<void> {
    const lookbackHours = this.boundLookback(options.lookbackHours);
    const now = dayjs.utc().startOf('hour');

    for (let i = 0; i < lookbackHours; i++) {
      const bucketStart = now.subtract(i, 'hour');
      const pattern = buildOrgHourlyKeyPattern(bucketStart.toDate());
      const keys = await this.collectKeys(pattern, options.scanCount);
      if (keys.length === 0) continue;

      for (const key of keys) {
        const parsed = parseOrganizationIdFromHourlyKey(key);
        if (!parsed) continue;
        await this.snapshotKey({
          key,
          organizationId: parsed.organizationId,
          bucketStart: bucketStart.toDate(),
          batchSize: options.batchSize,
          zScanCount: options.zScanCount,
        });
      }
    }
  }

  private boundLookback(value: number): number {
    if (!Number.isFinite(value)) return 1;
    return Math.min(Math.max(Math.floor(value), 1), 24 * 31);
  }

  private async collectKeys(
    pattern: string,
    scanCount: number,
  ): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const response = await this.redisService.scan(
        cursor,
        pattern,
        scanCount,
      );
      cursor = response.cursor;
      if (response.keys.length > 0) {
        keys.push(...response.keys);
      }
    } while (cursor !== '0');
    return keys;
  }

  private async snapshotKey(options: {
    key: string;
    organizationId: string;
    bucketStart: Date;
    batchSize: number;
    zScanCount: number;
  }): Promise<void> {
    let cursor = '0';
    const buffer: HourlyHitRow[] = [];

    do {
      const response = await this.redisService.zScan(
        options.key,
        cursor,
        options.zScanCount,
      );
      cursor = response.cursor;

      for (const entry of response.entries) {
        if (!entry.member) continue;
        buffer.push({
          ruleId: entry.member,
          organizationId: options.organizationId,
          bucketStart: options.bucketStart,
          hits: Math.max(0, Math.floor(entry.score)),
        });
      }

      if (buffer.length >= options.batchSize) {
        await this.flush(buffer);
        buffer.length = 0;
      }
    } while (cursor !== '0');

    if (buffer.length > 0) {
      await this.flush(buffer);
    }
  }

  private async flush(rows: HourlyHitRow[]): Promise<void> {
    if (rows.length === 0) return;
    const now = new Date();
    const values = rows.map(
      (row) =>
        Prisma.sql`(${row.ruleId}, ${row.organizationId}, ${row.bucketStart}, ${row.hits}, ${now}, ${now})`,
    );

    try {
      await this.prisma.$executeRaw`
        INSERT INTO "RedirectRuleHitsHourly" (
          "ruleId",
          "organizationId",
          "bucketStart",
          "hits",
          "createdAt",
          "updatedAt"
        )
        VALUES ${Prisma.join(values)}
        ON CONFLICT ("ruleId", "organizationId", "bucketStart")
        DO UPDATE SET
          "hits" = EXCLUDED."hits",
          "updatedAt" = EXCLUDED."updatedAt";
      `;
    } catch (error) {
      this.logger.error('Failed to snapshot redirect rule hits', {
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      throw error;
    }
  }
}
