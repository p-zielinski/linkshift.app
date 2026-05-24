import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly logger: Logger,
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

  async sadd(key: string, values: string | string[]): Promise<number> {
    const list = Array.isArray(values) ? values : [values];
    if (list.length === 0) return 0;
    return this.redis.sadd(key, ...list);
  }

  async sismember(key: string, value: string): Promise<boolean> {
    const result = await this.redis.sismember(key, value);
    return result === 1;
  }

  async zIncrBy(
    key: string,
    increment: number,
    member: string,
  ): Promise<number> {
    const result = await this.redis.zincrby(key, increment, member);
    return Number(result);
  }

  async zRevRangeWithScores(
    key: string,
    start: number,
    stop: number,
  ): Promise<{ member: string; score: number }[]> {
    const response = await this.redis.zrevrange(key, start, stop, 'WITHSCORES');
    const parsed: { member: string; score: number }[] = [];
    for (let i = 0; i < response.length; i += 2) {
      parsed.push({
        member: response[i],
        score: Number(response[i + 1] ?? 0),
      });
    }
    return parsed;
  }

  async zUnionStore(destination: string, keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.redis.zunionstore(destination, keys.length, ...keys);
  }

  /**
   * Atomic increment operation.
   * Increments the number stored at key by one.
   * If the key does not exist, it is set to 0 before performing the operation.
   * Returns the value of key after the increment.
   */
  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  /**
   * Atomic increment-by operation.
   * Increments the number stored at key by a specific value.
   */
  async incrBy(key: string, increment: number): Promise<number> {
    return this.redis.incrby(key, increment);
  }

  /**
   * Sets a timeout on key. After the timeout has expired, the key will automatically be deleted.
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async scan(
    cursor: string,
    pattern: string,
    count = 1000,
  ): Promise<{ cursor: string; keys: string[] }> {
    const response = await this.redis.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      count,
    );
    const [nextCursor, keys] = response as [string, string[]];
    return { cursor: nextCursor, keys };
  }

  async zScan(
    key: string,
    cursor: string,
    count = 1000,
  ): Promise<{ cursor: string; entries: { member: string; score: number }[] }> {
    const response = await this.redis.zscan(key, cursor, 'COUNT', count);
    const [nextCursor, flatEntries] = response as [string, string[]];
    const entries: { member: string; score: number }[] = [];
    for (let i = 0; i < flatEntries.length; i += 2) {
      entries.push({
        member: flatEntries[i],
        score: Number(flatEntries[i + 1] ?? 0),
      });
    }
    return { cursor: nextCursor, entries };
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async checkHealth(): Promise<void> {
    await this.redis.ping();
  }
}
