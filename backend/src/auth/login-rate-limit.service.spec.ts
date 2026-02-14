import { LoginRateLimitService } from './login-rate-limit.service';
import { RedisService } from '../redis/redis.service';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';

describe('LoginRateLimitService', () => {
  let service: LoginRateLimitService;
  let redis: RedisService;

  beforeEach(() => {
    redis = {
      get: jest.fn(),
      set: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
    } as unknown as RedisService;

    service = new LoginRateLimitService(
      redis,
      {
        getId: jest.fn().mockReturnValue('req-id'),
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

  it('does not block when no IP is provided', async () => {
    await expect(service.assertNotBlocked(null)).resolves.toBeUndefined();
  });

  it('throws when an IP is currently blocked', async () => {
    const blockedUntil = Date.now() + 30_000;
    (redis.get as jest.Mock).mockResolvedValue(blockedUntil);

    await expect(service.assertNotBlocked('127.0.0.1')).rejects.toThrow();
  });

  it('increments failures and sets expiry on first failure', async () => {
    (redis.incr as jest.Mock).mockResolvedValue(1);

    await service.registerFailure('127.0.0.1');

    expect(redis.incr).toHaveBeenCalledWith('LOGIN_FAIL:127.0.0.1');
    expect(redis.expire).toHaveBeenCalled();
  });

  it('sets a block when thresholds are reached', async () => {
    (redis.incr as jest.Mock).mockResolvedValue(5);

    await service.registerFailure('127.0.0.1');

    expect(redis.set).toHaveBeenCalledWith(
      'LOGIN_BLOCK:127.0.0.1',
      expect.any(Number),
      60,
    );
  });

  it('clears counters on reset', async () => {
    await service.reset('127.0.0.1');

    expect(redis.del).toHaveBeenCalledWith('LOGIN_FAIL:127.0.0.1');
    expect(redis.del).toHaveBeenCalledWith('LOGIN_BLOCK:127.0.0.1');
  });
});
