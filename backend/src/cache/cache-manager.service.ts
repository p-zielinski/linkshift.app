import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CacheManagerIdsService } from './cache-manager-ids.service';
import { PrismaService } from '../prisma.service';
import {
  User,
  Organization,
  Domain,
  RedirectRule,
  DomainGroup,
} from '@prisma/client';
import * as _ from 'lodash';
import type { DomainWithRelationsContext } from '../redirect/redirect.service';
import { LRUCache } from 'lru-cache';

// Helpers
const ensureArray = <T>(value: T | T[]): T[] =>
  Array.isArray(value) ? value : [value];
const minutesToTtl = (minutes: number) => minutes * 60;

export enum DataType {
  USERS = 'user',
  ORGANIZATIONS = 'organization',
  DOMAINS = 'domain',
  REDIRECT_RULES = 'redirectRule',
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
  [DataType.BLACKLIST_TOKEN]: [CachedByProperty.JTI],
};

const ttlPerResource: Partial<Record<DataType, number>> = {
  [DataType.USERS]: minutesToTtl(30),
  [DataType.ORGANIZATIONS]: minutesToTtl(60),
  [DataType.DOMAINS]: minutesToTtl(10),
  [DataType.REDIRECT_RULES]: minutesToTtl(10),
  [DataType.DOMAIN_GROUPS]: minutesToTtl(30),
};

const forbiddenPropertiesByDataType: Partial<Record<DataType, string[]>> = {
  [DataType.USERS]: ['passwordHash'],
};

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
  } catch (e) {
    return 1024;
  }
}

@Injectable()
export class CacheManagerService {
  private readonly logger = new Logger(CacheManagerService.name);

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
  ) {}

  /**
   * Checks if a token JTI is in the blacklist
   */
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const key = this.cacheManagerIdsService.getSimpleCacheManageId({
      dataType: DataType.BLACKLIST_TOKEN,
      properties: { [CachedByProperty.JTI]: jti },
    });

    const result = await this.redisService.get<boolean>(key);
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
      this.logger.debug(`L1 Cache HIT for ${hostname}`);
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
    // Cache "false" for a shorter time (e.g. 5 mins) to allow for quick recovery if data is created
    await this.redisService.set(key, false, minutesToTtl(5));
    return false;
  }

  /**
   * Caches the existence of data.
   */
  async setDataExist<
    T extends User | Organization | Domain | DomainGroup | RedirectRule,
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
    T extends User | Organization | Domain | DomainGroup | RedirectRule,
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

    // 2. Try Redis
    const cacheId = this.cacheManagerIdsService.getSimpleCacheManageId({
      dataType,
      properties,
    });
    const cachedData = await this.redisService.get<T | undefined | false>(
      cacheId,
    );

    if (cachedData !== undefined && cachedData !== null) {
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

    // 3. Fallback to DB (Prisma)
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
      await this.setDataFalse({ dataType, properties });
      return undefined;
    }

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
}
