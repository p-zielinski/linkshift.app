import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { TooManyRequestsError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';

type BlockStep = {
  threshold: number;
  durationSeconds: number;
};

const FAILURE_TTL_SECONDS = 2 * 60 * 60;
const BLOCK_STEPS: BlockStep[] = [
  { threshold: 5, durationSeconds: 60 },
  { threshold: 8, durationSeconds: 5 * 60 },
  { threshold: 12, durationSeconds: 15 * 60 },
  { threshold: 20, durationSeconds: 60 * 60 },
];

@Injectable()
export class LoginRateLimitService {
  constructor(
    private readonly redis: RedisService,
    private readonly clsService: ClsService,
  ) {}

  async assertNotBlocked(ip: string | null): Promise<void> {
    if (!ip) {
      return;
    }

    const blockKey = this.getBlockKey(ip);
    const blockedUntil = await this.redis.get<number>(blockKey);
    if (!blockedUntil) {
      return;
    }

    const now = Date.now();
    if (blockedUntil <= now) {
      return;
    }

    const retrySeconds = Math.ceil((blockedUntil - now) / 1000);
    return throwHttpException(
      new TooManyRequestsError({
        requestId: this.clsService.getId(),
        details: `Too many failed login attempts. Try again in ${retrySeconds}s.`,
      }),
    );
  }

  async registerFailure(ip: string | null): Promise<void> {
    if (!ip) {
      return;
    }

    const failureKey = this.getFailureKey(ip);
    const count = await this.redis.incr(failureKey);
    if (count === 1) {
      await this.redis.expire(failureKey, FAILURE_TTL_SECONDS);
    }

    const blockDuration = this.getBlockDuration(count);
    if (!blockDuration) {
      return;
    }

    const blockedUntil = Date.now() + blockDuration * 1000;
    await this.redis.set(this.getBlockKey(ip), blockedUntil, blockDuration);
  }

  async reset(ip: string | null): Promise<void> {
    if (!ip) {
      return;
    }

    await this.redis.del(this.getFailureKey(ip));
    await this.redis.del(this.getBlockKey(ip));
  }

  private getBlockDuration(failureCount: number): number | null {
    let selected: BlockStep | null = null;
    for (const step of BLOCK_STEPS) {
      if (failureCount >= step.threshold) {
        selected = step;
      }
    }
    return selected ? selected.durationSeconds : null;
  }

  private getFailureKey(ip: string): string {
    return `LOGIN_FAIL:${ip}`;
  }

  private getBlockKey(ip: string): string {
    return `LOGIN_BLOCK:${ip}`;
  }
}
