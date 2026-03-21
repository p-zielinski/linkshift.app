import { RedirectAnalyticsService } from './redirect-analytics.service';

describe('RedirectAnalyticsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should normalize request breakdown payload before persisting', async () => {
    const redisService = {
      zIncrBy: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(undefined),
      zUnionStore: jest.fn(),
      zRevRangeWithScores: jest.fn(),
    };

    const prisma = {
      $executeRaw: jest.fn().mockResolvedValue(1),
    };

    const logger = {
      error: jest.fn(),
    };

    const service = new RedirectAnalyticsService(
      redisService as any,
      prisma as any,
      logger as any,
    );

    await service.trackRuleHit('rule-1', 'org-1', {
      requestMethod: 'get',
      requestPath: 'promo/abc',
      requestUrl: '/promo/abc?b=2&a=1',
      requestQuery: 'b=2&a=1',
      destination: 'https://target.example/summer',
      linkMapKey: 'abc',
    });

    expect(redisService.zIncrBy).toHaveBeenCalledTimes(2);
    expect(redisService.expire).toHaveBeenCalledTimes(2);
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);

    const sql = (prisma.$executeRaw as jest.Mock).mock.calls[0][0] as {
      values: unknown[];
    };

    expect(sql.values[0]).toBe('rule-1');
    expect(sql.values[1]).toBe('org-1');
    expect(sql.values[4]).toBe('GET');
    expect(sql.values[5]).toBe('/promo/abc');
    expect(sql.values[6]).toBe('a=1&b=2');
    expect(sql.values[7]).toBe('/promo/abc?a=1&b=2');
    expect(sql.values[8]).toBe('https://target.example/summer');
    expect(sql.values[9]).toBe('abc');
  });

  it('should not fail redirect flow when breakdown persistence fails', async () => {
    const redisService = {
      zIncrBy: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(undefined),
      zUnionStore: jest.fn(),
      zRevRangeWithScores: jest.fn(),
    };

    const prisma = {
      $executeRaw: jest.fn().mockRejectedValue(new Error('db failed')),
    };

    const logger = {
      error: jest.fn(),
    };

    const service = new RedirectAnalyticsService(
      redisService as any,
      prisma as any,
      logger as any,
    );

    await expect(
      service.trackRuleHit('rule-1', 'org-1', {
        requestMethod: 'GET',
        requestPath: '/x',
        requestUrl: '/x',
      }),
    ).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalledWith(
      'Redirect hit breakdown tracking failed',
      expect.objectContaining({
        ruleId: 'rule-1',
        organizationId: 'org-1',
      }),
    );
  });
});
