import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { TooManyRequestsError } from '@shared/models/error.model';
import { RedisService } from '../redis/redis.service';
import { throwHttpException } from '../utils';

const WINDOW_TTL_SECONDS = 65;

@Injectable()
export class RedirectTraceRateLimitService {
  constructor(
    private readonly redis: RedisService,
    private readonly clsService: ClsService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  async check(clientIp: string | null): Promise<void> {
    if (!clientIp) {
      return;
    }

    const limit = Number(this.configService.get<string>('TRACE_RATE_LIMIT_PER_MINUTE') ?? '240');
    const now = new Date();
    const minuteKey =
      `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}` +
      `:${now.getUTCHours()}:${now.getUTCMinutes()}`;
    const redisKey = `TOOLS_TRACE_RATE_LIMIT:${clientIp}:${minuteKey}`;

    let count = 0;
    try {
      count = await this.redis.incr(redisKey);
      if (count === 1) {
        await this.redis.expire(redisKey, WINDOW_TTL_SECONDS);
      }
    } catch (error) {
      this.logger.error('Redirect trace rate limit skipped due to Redis error', {
        requestId: this.clsService.getId(),
        clientIp,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      return;
    }

    if (count <= limit) {
      return;
    }

    this.logger.warn('Redirect trace rate limit exceeded', {
      requestId: this.clsService.getId(),
      clientIp,
      count,
      limit,
    });

    return throwHttpException(
      new TooManyRequestsError({
        requestId: this.clsService.getId() ?? 'missing_request_id',
        details:
          'Redirect trace rate limit exceeded. Please wait a moment and try again.',
      }),
    );
  }
}
