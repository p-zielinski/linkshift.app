import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { RedisService } from '../redis/redis.service';
import { QrCodeRateLimitService } from './qr-code-rate-limit.service';

describe('QrCodeRateLimitService', () => {
  let service: QrCodeRateLimitService;
  let redis: RedisService;

  beforeEach(() => {
    redis = {
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(undefined),
    } as unknown as RedisService;

    service = new QrCodeRateLimitService(
      redis,
      {
        getId: jest.fn().mockReturnValue('req_123'),
      } as unknown as ClsService,
      {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        setContext: jest.fn(),
      } as unknown as Logger,
    );
  });

  it('skips checks when IP is not provided', async () => {
    await expect(service.check(null)).resolves.toBeUndefined();
    expect(redis.incr).not.toHaveBeenCalled();
  });

  it('increments and sets expiry on first call in a window', async () => {
    await expect(service.check('127.0.0.1')).resolves.toBeUndefined();
    expect(redis.incr).toHaveBeenCalledTimes(1);
    expect(redis.expire).toHaveBeenCalledTimes(1);
  });

  it('throws when per-minute threshold is exceeded', async () => {
    (redis.incr as jest.Mock).mockResolvedValue(61);
    await expect(service.check('127.0.0.1')).rejects.toThrow();
  });
});
