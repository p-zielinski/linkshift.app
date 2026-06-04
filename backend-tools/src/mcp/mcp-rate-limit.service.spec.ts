import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { TooManyRequestsError } from '@shared/models/error.model';
import { RedisService } from '../redis/redis.service';
import { McpRateLimitService } from './mcp-rate-limit.service';

describe('McpRateLimitService', () => {
  const redis = {
    incr: jest.fn(),
    expire: jest.fn(),
  };
  const clsService = { getId: jest.fn(() => 'req_test') };
  const configService = { get: jest.fn() };
  const logger = { error: jest.fn(), warn: jest.fn() };

  const createService = () =>
    new McpRateLimitService(
      redis as unknown as RedisService,
      clsService as unknown as ClsService,
      configService as unknown as ConfigService,
      logger as unknown as Logger,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockReturnValue('2');
    redis.incr.mockResolvedValue(1);
    redis.expire.mockResolvedValue(1);
  });

  it('skips rate limiting when client IP is missing', async () => {
    await expect(createService().check(null)).resolves.toBeUndefined();
    expect(redis.incr).not.toHaveBeenCalled();
  });

  it('allows requests within the configured limit', async () => {
    redis.incr.mockResolvedValue(1);
    await expect(createService().check('203.0.113.1')).resolves.toBeUndefined();
    expect(redis.incr).toHaveBeenCalledWith(expect.stringContaining('TOOLS_MCP_RATE_LIMIT:'));
    expect(redis.expire).toHaveBeenCalledWith(expect.stringContaining('TOOLS_MCP_RATE_LIMIT:'), 65);
  });

  it('throws when the limit is exceeded', async () => {
    redis.incr.mockResolvedValue(3);

    await expect(createService().check('203.0.113.1')).rejects.toMatchObject({
      response: expect.any(TooManyRequestsError),
    });
  });

  it('skips enforcement when Redis fails', async () => {
    redis.incr.mockRejectedValue(new Error('redis_down'));

    await expect(createService().check('203.0.113.1')).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });
});
