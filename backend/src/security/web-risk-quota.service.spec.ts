import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { RedisService } from '../redis/redis.service';
import { WebRiskQuotaService } from './web-risk-quota.service';

describe('WebRiskQuotaService', () => {
  const createConfigService = (values: Record<string, string | undefined>) =>
    ({
      get: jest.fn((key: string) => values[key]),
    }) as unknown as ConfigService;

  const createLogger = () =>
    ({
      warn: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    }) as unknown as Logger;

  const createRedisService = () =>
    ({
      get: jest.fn().mockResolvedValue(undefined),
      incrBy: jest.fn(),
      expire: jest.fn().mockResolvedValue(undefined),
      sadd: jest.fn().mockResolvedValue(0),
    }) as unknown as RedisService;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reserves requested calls when budget is available', async () => {
    const config = createConfigService({});
    const redis = createRedisService();
    const logger = createLogger();

    (redis.incrBy as jest.Mock).mockResolvedValue(20);

    const service = new WebRiskQuotaService(config, redis, logger);
    const reservation = await service.reserveCalls(20);

    expect(reservation.requestedCalls).toBe(20);
    expect(reservation.allowedCalls).toBe(20);
    expect(reservation.skippedCalls).toBe(0);
    expect(reservation.isBudgetExhausted).toBe(false);
    expect(redis.incrBy).toHaveBeenCalledTimes(1);
    expect(redis.expire).toHaveBeenCalledTimes(1);
  });

  it('partially allows calls when reservation exceeds budget', async () => {
    const config = createConfigService({ WEB_RISK_MONTHLY_BUDGET: '100' });
    const redis = createRedisService();
    const logger = createLogger();

    (redis.incrBy as jest.Mock).mockResolvedValue(105);

    const service = new WebRiskQuotaService(config, redis, logger);
    const reservation = await service.reserveCalls(10);

    expect(reservation.requestedCalls).toBe(10);
    expect(reservation.allowedCalls).toBe(5);
    expect(reservation.skippedCalls).toBe(5);
    expect(reservation.limit).toBe(100);
    expect((logger.warn as jest.Mock).mock.calls).toEqual(
      expect.arrayContaining([
        [
          'Web Risk monthly budget reached, skipping lookup calls',
          expect.objectContaining({
            requestedCalls: 10,
            allowedCalls: 5,
            skippedCalls: 5,
          }),
        ],
      ]),
    );
  });

  it('logs threshold warning only when threshold is crossed', async () => {
    const config = createConfigService({ WEB_RISK_MONTHLY_BUDGET: '100' });
    const redis = createRedisService();
    const logger = createLogger();

    (redis.incrBy as jest.Mock).mockResolvedValue(80);
    (redis.sadd as jest.Mock).mockResolvedValue(1);

    const service = new WebRiskQuotaService(config, redis, logger);
    await service.reserveCalls(1);

    expect(redis.sadd).toHaveBeenCalledWith(
      expect.stringContaining('safety:web-risk:warned-thresholds:'),
      '80',
    );
    expect((logger.warn as jest.Mock).mock.calls).toEqual(
      expect.arrayContaining([
        [
          'Web Risk monthly budget threshold reached',
          expect.objectContaining({
            thresholdPercent: 80,
            usagePercent: 80,
          }),
        ],
      ]),
    );
  });

  it('blocks rescan when usage reaches configured threshold', async () => {
    const config = createConfigService({
      WEB_RISK_MONTHLY_BUDGET: '100',
      WEB_RISK_RESCAN_USAGE_THRESHOLD_PERCENT: '90',
    });
    const redis = createRedisService();
    const logger = createLogger();

    (redis.get as jest.Mock).mockResolvedValue(90);

    const service = new WebRiskQuotaService(config, redis, logger);
    const decision = await service.shouldRunRescan();

    expect(decision.allowed).toBe(false);
    expect(decision.thresholdPercent).toBe(90);
    expect(decision.status.usagePercent).toBe(90);
  });
});
