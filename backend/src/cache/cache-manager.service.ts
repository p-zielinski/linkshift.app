import { Injectable } from '@nestjs/common';
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

const resourcesWithoutIsDeleted = [DataType.USERS]; // Adjust based on which models lack 'deletedAt' or 'isDeleted'

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
  [DataType.DOMAINS]: minutesToTtl(10), // Short TTL for domains to propagate DNS/changes quickly
  [DataType.REDIRECT_RULES]: minutesToTtl(10),
  [DataType.DOMAIN_GROUPS]: minutesToTtl(30),
};

// Forbidden properties to not cache (e.g. sensitive data)
const forbiddenPropertiesByDataType: Partial<Record<DataType, string[]>> = {
  [DataType.USERS]: ['passwordHash'],
};

@Injectable()
export class CacheManagerService {
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

    // We store 'true' to indicate it's blacklisted
    await this.redisService.set(key, true, ttlInSeconds);
  }

  /**
   * Retrieves specialized redirect context (Domain + Rules) from cache.
   */
  async getRedirectContext(
    hostname: string,
  ): Promise<DomainWithRelationsContext | null | undefined> {
    const key = `REDIRECT_CONTEXT:${hostname}`;
    return this.redisService.get<DomainWithRelationsContext>(key);
  }

  /**
   * Saves specialized redirect context to cache.
   */
  async setRedirectContext(
    hostname: string,
    data: DomainWithRelationsContext | null,
  ): Promise<void> {
    const key = `REDIRECT_CONTEXT:${hostname}`;
    // We use a fixed TTL of 5 minutes for redirect contexts
    await this.redisService.set(key, data, minutesToTtl(5));
  }

  /**
   * Removes specific redirect context from cache.
   */
  async invalidateRedirectContext(hostname: string): Promise<void> {
    const key = `REDIRECT_CONTEXT:${hostname}`;
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
