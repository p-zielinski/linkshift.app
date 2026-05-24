import { SafetyRescanScheduler } from './safety-rescan.scheduler';

describe('SafetyRescanScheduler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('skips enqueue when monthly usage is above rescan threshold', async () => {
    const redirectAnalyticsService = {
      getTopRulesGlobal: jest.fn(),
    };
    const webRiskQuotaService = {
      shouldRunRescan: jest.fn().mockResolvedValue({
        allowed: false,
        thresholdPercent: 90,
        status: {
          monthKey: '2026-05',
          usageCount: 95_000,
          rawUsageCount: 95_012,
          usagePercent: 100,
          limit: 95_000,
          isBudgetExhausted: true,
        },
      }),
    };
    const queue = {
      addBulk: jest.fn(),
    };
    const logger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    const service = new SafetyRescanScheduler(
      redirectAnalyticsService as any,
      webRiskQuotaService as any,
      queue as any,
      logger as any,
    );

    await service.enqueueTopRules();

    expect(redirectAnalyticsService.getTopRulesGlobal).not.toHaveBeenCalled();
    expect(queue.addBulk).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      'Safety rescan skipped due to Web Risk budget usage',
      expect.objectContaining({
        monthKey: '2026-05',
        usagePercent: 100,
      }),
    );
  });

  it('enqueues top rules when quota allows rescan', async () => {
    const redirectAnalyticsService = {
      getTopRulesGlobal: jest
        .fn()
        .mockResolvedValue([{ ruleId: 'rule-1', hits: 120 }]),
    };
    const webRiskQuotaService = {
      shouldRunRescan: jest.fn().mockResolvedValue({
        allowed: true,
        thresholdPercent: 90,
        status: {
          monthKey: '2026-05',
          usageCount: 25_000,
          rawUsageCount: 25_000,
          usagePercent: 26.31,
          limit: 95_000,
          isBudgetExhausted: false,
        },
      }),
    };
    const queue = {
      addBulk: jest.fn().mockResolvedValue(undefined),
    };
    const logger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    const service = new SafetyRescanScheduler(
      redirectAnalyticsService as any,
      webRiskQuotaService as any,
      queue as any,
      logger as any,
    );

    await service.enqueueTopRules();

    expect(redirectAnalyticsService.getTopRulesGlobal).toHaveBeenCalledWith(50);
    expect(queue.addBulk).toHaveBeenCalledWith([
      {
        name: 'rescan',
        data: { ruleId: 'rule-1', hits: 120 },
        opts: { removeOnComplete: true, removeOnFail: 50 },
      },
    ]);
  });
});
