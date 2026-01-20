import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.redis.set(key, serializedValue, 'EX', ttl);
    } else {
      await this.redis.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.redis.get(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    await this.redis.flushdb();
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
