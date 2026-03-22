import { RedirectAnalyticsRetentionService } from './redirect-analytics-retention.service';

describe('RedirectAnalyticsRetentionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should apply retention windows per plan', async () => {
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

    await service.cleanupExpiredRows(new Date('2026-03-22T12:33:11.000Z'));

    expect(prisma.redirectRuleHitBreakdownHourly.deleteMany).toHaveBeenCalledTimes(3);

    expect(prisma.redirectRuleHitBreakdownHourly.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: { in: ['org-free'] },
          bucketStart: { lt: new Date('2026-02-20T12:00:00.000Z') },
        }),
      }),
    );

    expect(prisma.redirectRuleHitBreakdownHourly.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: { in: ['org-basic'] },
          bucketStart: { lt: new Date('2026-01-21T12:00:00.000Z') },
        }),
      }),
    );

    expect(prisma.redirectRuleHitBreakdownHourly.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: { in: ['org-pro'] },
          bucketStart: { lt: new Date('2025-12-22T12:00:00.000Z') },
        }),
      }),
    );
  });

  it('should fall back to FREE retention for malformed configuration', async () => {
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

    await service.cleanupExpiredRows(new Date('2026-03-22T00:00:00.000Z'));

    expect(prisma.redirectRuleHitBreakdownHourly.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: { in: ['org-legacy'] },
          bucketStart: { lt: new Date('2026-02-20T00:00:00.000Z') },
        }),
      }),
    );
  });
});
