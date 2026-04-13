import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { RedisService } from '../redis/redis.service';
import { throwHttpException } from '../utils';
import { TooManyRequestsError } from '@shared/models/error.model';

const QR_RATE_LIMIT_PER_MINUTE = 60;
const WINDOW_TTL_SECONDS = 65;

@Injectable()
export class QrCodeRateLimitService {
  constructor(
    private readonly redis: RedisService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  async check(clientIp: string | null): Promise<void> {
    if (!clientIp) {
      return;
    }

    const now = new Date();
    const minuteKey =
      `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}` +
      `:${now.getUTCHours()}:${now.getUTCMinutes()}`;
    const redisKey = `QR_CODE_RATE_LIMIT:${clientIp}:${minuteKey}`;

    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.expire(redisKey, WINDOW_TTL_SECONDS);
    }

    if (count <= QR_RATE_LIMIT_PER_MINUTE) {
      return;
    }

    this.logger.warn('QR code rate limit exceeded', {
      requestId: this.clsService.getId(),
      clientIp,
      count,
      limit: QR_RATE_LIMIT_PER_MINUTE,
    });

    return throwHttpException(
      new TooManyRequestsError({
        requestId: this.clsService.getId(),
        details:
          'QR code generation limit exceeded. Please try again in a minute or contact support if you need higher throughput.',
      }),
    );
  }
}
