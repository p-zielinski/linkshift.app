import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { RedisService } from '../redis/redis.service';
import { CacheManagerIdsService } from './cache-manager-ids.service';
import { PrismaService } from '../prisma.service';
import {
  User,
  Organization,
  Domain,
  RedirectRule,
  DomainGroup,
  RedirectTest,
} from '@prisma/client';
import * as _ from 'lodash';
import type { DomainWithRelationsContext } from '../redirect/redirect.service';
import { LRUCache } from 'lru-cache';
import { TooManyRequestsError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';

// Helpers
const ensureArray = <T>(value: T | T[]): T[] =>
  Array.isArray(value) ? value : [value];
const minutesToTtl = (minutes: number) => minutes * 60;

export enum DataType {
  USERS = 'user',
  ORGANIZATIONS = 'organization',
  DOMAINS = 'domain',
  REDIRECT_RULES = 'redirectRule',
  REDIRECT_TESTS = 'redirectTest',
  DOMAIN_GROUPS = 'domainGroup',
  BLACKLIST_TOKEN = 'blacklistToken',
}

export enum CachedByProperty {
  ID = 'id',
  EMAIL = 'email',
  NAME = 'name',
  JTI = 'jti',
}

const resourcesWithoutIsDeleted = [DataType.USERS];

const storeByProperties: Record<
  DataType,
  (CachedByProperty | CachedByProperty[])[]
> = {
  [DataType.USERS]: [CachedByProperty.ID, CachedByProperty.EMAIL],
  [DataType.ORGANIZATIONS]: [CachedByProperty.ID],
  [DataType.DOMAINS]: [CachedByProperty.ID, CachedByProperty.NAME],
  [DataType.DOMAIN_GROUPS]: [CachedByProperty.ID],
  [DataType.REDIRECT_RULES]: [CachedByProperty.ID],
  [DataType.REDIRECT_TESTS]: [CachedByProperty.ID],
  [DataType.BLACKLIST_TOKEN]: [CachedByProperty.JTI],
};

const ttlPerResource: Partial<Record<DataType, number>> = {
  [DataType.USERS]: minutesToTtl(30),
  [DataType.ORGANIZATIONS]: minutesToTtl(60),
  [DataType.DOMAINS]: minutesToTtl(10),
  [DataType.REDIRECT_RULES]: minutesToTtl(10),
  [DataType.REDIRECT_TESTS]: minutesToTtl(10),
  [DataType.DOMAIN_GROUPS]: minutesToTtl(30),
};

const forbiddenPropertiesByDataType: Partial<Record<DataType, string[]>> = {
  [DataType.USERS]: ['passwordHash'],
};

const ENABLED_LOCAL_CACHE_FOR = new Set([
  DataType.USERS,
  DataType.ORGANIZATIONS,
  DataType.BLACKLIST_TOKEN,
]);

function roughSizeOfObject(object: any): number {
  try {
    const objectList: any[] = [];
    const stack = [object];
    let bytes = 0;

    while (stack.length) {
      const value = stack.pop();

      if (typeof value === 'boolean') {
        bytes += 4;
      } else if (typeof value === 'string') {
        bytes += value.length * 2; // JS strings are UTF-16 (2 bytes per char)
      } else if (typeof value === 'number') {
        bytes += 8;
      } else if (
        typeof value === 'object' &&
        objectList.indexOf(value) === -1
      ) {
        objectList.push(value);
        for (const i in value) {
          // eslint-disable-next-line no-prototype-builtins
          if (value.hasOwnProperty(i)) {
            stack.push(value[i]);
            bytes += i.length * 2; // Key size
          }
        }
      }
    }
    return bytes;
  } catch (_) {
    return 1024;
  }
}

@Injectable()
export class CacheManagerService {
  private readonly MAX_CACHE_SIZE_BYTES = 350 * 1024 * 1024;

  // L1 Local Cache (In-Memory) configuration
  private readonly localCache = new LRUCache<string, any>({
    maxSize: this.MAX_CACHE_SIZE_BYTES,
    ttl: 15 * 1000, // 15 seconds
    allowStale: false,
    sizeCalculation: (value) => {
      return roughSizeOfObject(value) + 200;
    },
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly cacheManagerIdsService: CacheManagerIdsService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {
  }

  /**
   * Checks if the organization has exceeded its request limit.
   * Uses L1 (Local) cache to short-circuit blocked organizations to save Redis calls.
   */
  async checkOrganizationRateLimit(
    organizationId: string,
    limit: number,
  ): Promise<void> {
    // 0. Bypass checks if limit is 0 or negative (assuming unlimited or misconfiguration, adjust as needed)
    if (limit <= 0) return;

    const now = new Date();
    const currentMinuteKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}:${now.getUTCHours()}:${now.getUTCMinutes()}`;

    // Key used for L1 blocking optimization
    const blockKey = `RATE_LIMIT_BLOCK:${organizationId}:${currentMinuteKey}`;

    // 1. Check L1 Cache (Optimization)
    // If we already know this org is blocked for this minute, reject immediately without hitting Redis.
    if (this.localCache.has(blockKey)) {
      this.logger.debug('L1 cache hit for organization rate limit', {
        organizationId,
        cacheKey: blockKey,
      });
      return this.throwLimitError();
    }

    // 2. Redis Atomic Increment
    const redisKey = `RATE_LIMIT:${organizationId}:${currentMinuteKey}`;
    const currentCount = await this.redisService.incr(redisKey);

    // If this is the first request in this minute window, set the expiry
    if (currentCount === 1) {
      // Expire after 60 seconds (plus small buffer)
      await this.redisService.expire(redisKey, 65);
    }

    // 3. Check against limit
    if (currentCount > limit) {
      // Optimization: Calculate seconds remaining in this minute
      const secondsRemaining = 60 - now.getUTCSeconds();

      // Cache the "BLOCKED" state locally for the remainder of the minute.
      // Next requests hitting this instance won't even touch Redis.
      this.localCache.set(blockKey, true, { ttl: secondsRemaining * 1000 });

      return this.throwLimitError();
    }
  }

  private throwLimitError(): never {
    return throwHttpException(
      new TooManyRequestsError({
        details: 'Organization rate limit exceeded',
        requestId: this.clsService.getId(),
      }),
    );
  }

  /**
   * Checks if a token JTI is in the blacklist
   */
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const key = this.cacheManagerIdsService.getSimpleCacheManageId({
      dataType: DataType.BLACKLIST_TOKEN,
      properties: { [CachedByProperty.JTI]: jti },
    });

    if (this.localCache.has(key)) {
      return true;
    }

    const result = await this.redisService.get<boolean>(key);

    if (result) {
      this.localCache.set(key, true);
    }

    return !!result;
  }

  /**
   * Adds a token JTI to the blacklist with a specific TTL
   */
  async blacklistToken(jti: string, ttlInSeconds: number): Promise<void> {
    const key = this.cacheManagerIdsService.getSimpleCacheManageId({
      dataType: DataType.BLACKLIST_TOKEN,
      properties: { [CachedByProperty.JTI]: jti },
    });

    this.localCache.set(key, true);
    await this.redisService.set(key, true, ttlInSeconds);
  }

  /**
   * Retrieves specialized redirect context (Domain + Rules) from cache.
   * Strategy: L1 (LRU Local) -> L2 (Redis) -> DB (handled by caller on miss)
   */
  async getRedirectContext(
    hostname: string,
  ): Promise<DomainWithRelationsContext | null | undefined> {
    const key = `REDIRECT_CONTEXT:${hostname}`;

    // 1. Try L1 Local Cache (LRU)
    if (this.localCache.has(key)) {
      this.logger.debug('L1 cache hit for redirect context', {
        hostname,
        cacheKey: key,
      });
      return this.localCache.get(key) as DomainWithRelationsContext | null;
    }

    const cached = await this.redisService.get<DomainWithRelationsContext>(key);

    if (cached !== undefined) {
      this.localCache.set(key, cached);
    }

    return cached;
  }

  /**
   * Saves specialized redirect context to cache.
   */
  async setRedirectContext(
    hostname: string,
    data: DomainWithRelationsContext | null,
  ): Promise<void> {
    const key = `REDIRECT_CONTEXT:${hostname}`;

    // Update L1
    this.localCache.set(key, data);

    // Update L2 (Redis) with longer TTL
    await this.redisService.set(key, data, minutesToTtl(5));
  }

  /**
   * Removes specific redirect context from cache.
   */
  async invalidateRedirectContext(hostname: string): Promise<void> {
    const key = `REDIRECT_CONTEXT:${hostname}`;

    // Remove from L1 immediately
    this.localCache.delete(key);

    // Remove from L2
    await this.redisService.del(key);
  }

  /**
   * Caches that the data does NOT exist (prevents cache penetration).
   */
  async setDataFalse({
    dataType,
    properties,
  }: {
    dataType: DataType;
    properties: Partial<Record<CachedByProperty, string>>;
  }): Promise<false> {
    const key = this.cacheManagerIdsService.getSimpleCacheManageId({
      dataType,
      properties,
    });

    // Update L1
    this.localCache.set(key, false);

    // Cache "false" for a shorter time (e.g. 5 mins) to allow for quick recovery if data is created
    await this.redisService.set(key, false, minutesToTtl(5));
    return false;
  }

  /**
   * Caches the existence of data.
   */
  async setDataExist<
    T extends
      | User
      | Organization
      | Domain
      | DomainGroup
      | RedirectRule
      | RedirectTest,
  >({ data, dataType }: { data: T; dataType: DataType }): Promise<T> {
    const omitProperties = forbiddenPropertiesByDataType[dataType];
    const dataWithoutOmitProperties = omitProperties
      ? _.omit(data, omitProperties)
      : data;

    // Cache by all defined property combinations
    for (const propertyBy of storeByProperties[dataType] || []) {
      const properties = ensureArray(propertyBy).reduce<
        Partial<Record<CachedByProperty, string>>
      >((acc, cur) => {
        if (data[cur]) {
          acc[cur] = String(data[cur]);
        }
        return acc;
      }, {});

      // Only cache if we have all keys for this combination
      if (Object.keys(properties).length === ensureArray(propertyBy).length) {
        const key = this.cacheManagerIdsService.getSimpleCacheManageId({
          dataType,
          properties,
        });

        // Update L1 - ONLY if enabled for this DataType
        if (ENABLED_LOCAL_CACHE_FOR.has(dataType)) {
          this.localCache.set(key, dataWithoutOmitProperties);
        }

        // Update L2 (Redis)
        await this.redisService.set(
          key,
          dataWithoutOmitProperties,
          ttlPerResource[dataType],
        );
      }
    }
    return data;
  }

  /**
   * Main method to get data from Cache (or DB on miss).
   */
  async getData<
    T extends
      | User
      | Organization
      | Domain
      | DomainGroup
      | RedirectRule
      | RedirectTest,
  >(
    {
      properties,
      dataType,
    }: {
      properties: Partial<Record<CachedByProperty, string>>;
      dataType: DataType;
    },
    options: { fetch: boolean; skipDeleted: boolean } = {
      fetch: true,
      skipDeleted: true,
    },
  ): Promise<T | false | undefined> {
    // 1. Validate if we can query by these properties
    const isValidQuery = storeByProperties[dataType]?.some((storeByProperty) =>
      ensureArray(storeByProperty).every((prop) =>
        Object.keys(properties).includes(prop),
      ),
    );

    if (!isValidQuery) {
      return undefined;
    }

    const cacheId = this.cacheManagerIdsService.getSimpleCacheManageId({
      dataType,
      properties,
    });

    // 2. Try L1 (Local Cache) FIRST
    if (ENABLED_LOCAL_CACHE_FOR.has(dataType) && this.localCache.has(cacheId)) {
      const localData = this.localCache.get(cacheId) as T | false;

      if (localData === false) {
        return undefined; // Known non-existence from L1
      }

      if (
        options.skipDeleted &&
        localData &&
        'deletedAt' in localData &&
        (localData as any).deletedAt
      ) {
        return undefined;
      }

      return localData;
    }

    // 3. Try L2 (Redis)
    const cachedData = await this.redisService.get<T | undefined | false>(
      cacheId,
    );

    if (cachedData !== undefined && cachedData !== null) {
      // Populate L1 with what we found in L2
      if (ENABLED_LOCAL_CACHE_FOR.has(dataType)) {
        this.localCache.set(cacheId, cachedData);
      }

      if (cachedData === false) {
        return undefined; // Known non-existence
      }
      if (
        options.skipDeleted &&
        'deletedAt' in cachedData &&
        cachedData.deletedAt
      ) {
        return undefined;
      }
      return cachedData;
    }

    if (!options.fetch) return undefined;

    // 4. Fallback to DB (Prisma)
    // We map DataType enum values to Prisma delegate names directly
    const delegate = this.prisma[dataType as string];

    if (!delegate) {
      throw new Error(`No Prisma delegate found for dataType: ${dataType}`);
    }

    const where: any = { ...properties };

    const result = (await delegate.findFirst({
      where,
    })) as T | null;

    if (!result) {
      // Updates both L1 and L2 with false
      await this.setDataFalse({ dataType, properties });
      return undefined;
    }

    // Updates both L1 and L2 with result
    await this.setDataExist<T>({ data: result, dataType });

    if (
      !resourcesWithoutIsDeleted.includes(dataType) &&
      options.skipDeleted &&
      'deletedAt' in result &&
      result.deletedAt
    ) {
      return undefined;
    }
    return result;
  }

  async getCustomCache<T>(key: string): Promise<T | undefined> {
    if (this.localCache.has(key)) {
      return this.localCache.get(key) as T;
    }

    const cached = await this.redisService.get<T>(key);
    if (cached !== undefined) {
      this.localCache.set(key, cached);
    }
    return cached;
  }

  async setCustomCache<T>(
    key: string,
    value: T,
    ttlSeconds: number,
  ): Promise<void> {
    this.localCache.set(key, value, { ttl: ttlSeconds * 1000 });
    await this.redisService.set(key, value, ttlSeconds);
  }
}
