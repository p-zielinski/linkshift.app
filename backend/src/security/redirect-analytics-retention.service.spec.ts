import { RedirectAnalyticsRetentionService } from './redirect-analytics-retention.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getPlanLimits } from '../billing/billing.config';
import { OrganizationPlan } from '@shared/models/organization-config.model';

dayjs.extend(utc);

function expectedCutoff(referenceDate: Date, plan: OrganizationPlan): Date {
  return dayjs
    .utc(referenceDate)
    .subtract(getPlanLimits(plan).analyticsRetentionDays, 'day')
    .startOf('hour')
    .toDate();
}

describe('RedirectAnalyticsRetentionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should apply retention windows per plan', async () => {
    const referenceDate = new Date('2026-03-22T12:33:11.000Z');
    const prisma = {
      organization: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'org-free',
            configuration: {
              activeSubscription: {
                plan: 'FREE',
              },
            },
          },
          {
            id: 'org-basic',
            configuration: {
              activeSubscription: {
                plan: 'BASIC',
              },
            },
          },
          {
            id: 'org-pro',
            configuration: {
              activeSubscription: {
                plan: 'PRO',
              },
            },
          },
        ]),
      },
      redirectRuleHitBreakdownHourly: {
        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    const logger = {
      log: jest.fn(),
    };

    const service = new RedirectAnalyticsRetentionService(
      prisma as any,
      logger as any,
    );

    await service.cleanupExpiredRows(referenceDate);

    expect(
      prisma.redirectRuleHitBreakdownHourly.deleteMany,
    ).toHaveBeenCalledTimes(3);

    expect(
      prisma.redirectRuleHitBreakdownHourly.deleteMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: { in: ['org-free'] },
          bucketStart: {
            lt: expectedCutoff(referenceDate, OrganizationPlan.FREE),
          },
        }),
      }),
    );

    expect(
      prisma.redirectRuleHitBreakdownHourly.deleteMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: { in: ['org-basic'] },
          bucketStart: {
            lt: expectedCutoff(referenceDate, OrganizationPlan.BASIC),
          },
        }),
      }),
    );

    expect(
      prisma.redirectRuleHitBreakdownHourly.deleteMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: { in: ['org-pro'] },
          bucketStart: {
            lt: expectedCutoff(referenceDate, OrganizationPlan.PRO),
          },
        }),
      }),
    );
  });

  it('should fall back to FREE retention for malformed configuration', async () => {
    const referenceDate = new Date('2026-03-22T00:00:00.000Z');
    const prisma = {
      organization: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'org-legacy',
            configuration: {
              activeSubscription: {
                plan: 'UNKNOWN_PLAN',
              },
            },
          },
        ]),
      },
      redirectRuleHitBreakdownHourly: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    const logger = {
      log: jest.fn(),
    };

    const service = new RedirectAnalyticsRetentionService(
      prisma as any,
      logger as any,
    );

    await service.cleanupExpiredRows(referenceDate);

    expect(
      prisma.redirectRuleHitBreakdownHourly.deleteMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: { in: ['org-legacy'] },
          bucketStart: {
            lt: expectedCutoff(referenceDate, OrganizationPlan.FREE),
          },
        }),
      }),
    );
  });
});
