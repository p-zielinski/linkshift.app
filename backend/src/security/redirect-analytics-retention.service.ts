import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PrismaService } from '../prisma.service';
import {
  OrganizationConfiguration,
  OrganizationPlan,
} from '@shared/models/organization-config.model';
import { getPlanLimits } from '../billing/billing.config';
import { Logger } from 'nestjs-pino';

dayjs.extend(utc);

const ANALYTICS_RETENTION_CLEANUP_CRON = '0 2 * * *';
const ANALYTICS_RETENTION_DELETE_BATCH_SIZE = 500;

@Injectable()
export class RedirectAnalyticsRetentionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  @Cron(ANALYTICS_RETENTION_CLEANUP_CRON)
  async cleanupExpiredRowsDaily(): Promise<void> {
    await this.cleanupExpiredRows();
  }

  async cleanupExpiredRows(referenceDate = new Date()): Promise<void> {
    const organizations = await this.prisma.organization.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        configuration: true,
      },
    });

    if (organizations.length === 0) {
      return;
    }

    const organizationIdsByRetention = new Map<number, string[]>();
    for (const organization of organizations) {
      const retentionDays = this.resolveRetentionDays(
        organization.configuration,
      );
      const current = organizationIdsByRetention.get(retentionDays) ?? [];
      current.push(organization.id);
      organizationIdsByRetention.set(retentionDays, current);
    }

    let deletedTotal = 0;

    for (const [
      retentionDays,
      organizationIds,
    ] of organizationIdsByRetention.entries()) {
      const cutoff = dayjs
        .utc(referenceDate)
        .subtract(retentionDays, 'day')
        .startOf('hour')
        .toDate();

      for (
        let i = 0;
        i < organizationIds.length;
        i += ANALYTICS_RETENTION_DELETE_BATCH_SIZE
      ) {
        const idsBatch = organizationIds.slice(
          i,
          i + ANALYTICS_RETENTION_DELETE_BATCH_SIZE,
        );
        const result =
          await this.prisma.redirectRuleHitBreakdownHourly.deleteMany({
            where: {
              organizationId: { in: idsBatch },
              bucketStart: { lt: cutoff },
            },
          });
        deletedTotal += result.count;
      }
    }

    this.logger.log('Redirect analytics retention cleanup completed', {
      organizations: organizations.length,
      deletedRows: deletedTotal,
    });
  }

  private resolveRetentionDays(configuration: unknown): number {
    const parsed = OrganizationConfiguration.fromJson(configuration ?? {});
    const plan = parsed.activeSubscription?.plan ?? OrganizationPlan.FREE;
    const limits = getPlanLimits(plan);

    const value = Number(limits.analyticsRetentionDays);
    if (!Number.isFinite(value)) {
      return 30;
    }
    return Math.max(1, Math.floor(value));
  }
}
