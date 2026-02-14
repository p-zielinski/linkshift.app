import { Test, TestingModule } from '@nestjs/testing';
import {
  CacheManagerService,
  DataType,
  CachedByProperty,
} from './cache-manager.service';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CacheManagerIdsService } from './cache-manager-ids.service';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';

describe('CacheManagerService', () => {
  let service: CacheManagerService;
  let prisma: PrismaService;
  let redis: RedisService;
  let cacheIds: CacheManagerIdsService;

  const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheManagerService,
        {
          provide: ClsService,
          useValue: {
            getId: jest.fn().mockReturnValue('mock-id'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: { findFirst: jest.fn() },
            organization: { findFirst: jest.fn() },
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            incr: jest.fn(),
            expire: jest.fn(),
          },
        },
        {
          provide: CacheManagerIdsService,
          useValue: {
            getSimpleCacheManageId: jest.fn().mockReturnValue('mock-cache-key'),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            setContext: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CacheManagerService>(CacheManagerService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
    cacheIds = module.get<CacheManagerIdsService>(CacheManagerIdsService);
  });

  describe('getData', () => {
    it('should return undefined if the query properties are invalid for the data type', async () => {
      const result = await service.getData({
        dataType: DataType.ORGANIZATIONS,
        properties: { [CachedByProperty.EMAIL]: 'test@test.pl' } as any,
      });

      expect(result).toBeUndefined();
      expect(redis.get).not.toHaveBeenCalled();
    });

    it('should return data from Redis if it exists', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(mockUser);

      const result = await service.getData({
        dataType: DataType.USERS,
        properties: { id: '1' },
      });

      expect(redis.get).toHaveBeenCalledWith('mock-cache-key');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('should return undefined and not hit DB if Redis contains "false" (negative cache)', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(false);

      const result = await service.getData({
        dataType: DataType.USERS,
        properties: { id: '1' },
      });

      expect(result).toBeUndefined();
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('should fetch from Prisma and cache the result if Redis miss', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(undefined);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const setDataExistSpy = jest.spyOn(service, 'setDataExist');

      const result = await service.getData({
        dataType: DataType.USERS,
        properties: { id: '1' },
      });

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(setDataExistSpy).toHaveBeenCalledWith({
        data: mockUser,
        dataType: DataType.USERS,
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined and set negative cache if data not found in DB', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(undefined);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      const setDataFalseSpy = jest.spyOn(service, 'setDataFalse');

      const result = await service.getData({
        dataType: DataType.USERS,
        properties: { id: 'non-existent' },
      });

      expect(result).toBeUndefined();
      expect(setDataFalseSpy).toHaveBeenCalledWith({
        dataType: DataType.USERS,
        properties: { id: 'non-existent' },
      });
    });

    it('should return undefined if data is marked as deleted and skipDeleted is true', async () => {
      const deletedDomain = {
        id: '1',
        name: 'deleted.com',
        deletedAt: new Date(),
      };
      jest.spyOn(redis, 'get').mockResolvedValue(undefined);
      (prisma.domain as any) = {
        findFirst: jest.fn().mockResolvedValue(deletedDomain),
      };

      const result = await service.getData(
        {
          dataType: DataType.DOMAINS,
          properties: { id: '1' },
        },
        { fetch: true, skipDeleted: true },
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined if fetch option is false and cache miss', async () => {
      jest.spyOn(redis, 'get').mockResolvedValue(undefined);

      const result = await service.getData(
        { dataType: DataType.USERS, properties: { id: '1' } },
        { fetch: false, skipDeleted: true },
      );

      expect(result).toBeUndefined();
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('checkOrganizationRateLimit', () => {
    it('skips checks when limit is non-positive', async () => {
      const incrSpy = jest.spyOn(redis, 'incr');

      await service.checkOrganizationRateLimit('org-1', 0);

      expect(incrSpy).not.toHaveBeenCalled();
    });

    it('throws when the limit is exceeded', async () => {
      jest.spyOn(redis, 'incr').mockResolvedValue(2);

      await expect(
        service.checkOrganizationRateLimit('org-1', 1),
      ).rejects.toThrow();
    });

    it('short-circuits when L1 block is present', async () => {
      const now = new Date();
      const minuteKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}:${now.getUTCHours()}:${now.getUTCMinutes()}`;
      const blockKey = `RATE_LIMIT_BLOCK:org-1:${minuteKey}`;

      (service as any).localCache.set(blockKey, true);

      const incrSpy = jest.spyOn(redis, 'incr');

      await expect(
        service.checkOrganizationRateLimit('org-1', 1),
      ).rejects.toThrow();
      expect(incrSpy).not.toHaveBeenCalled();
    });

    it('sets a Redis expiry on the first request in a window', async () => {
      jest.spyOn(redis, 'incr').mockResolvedValue(1);
      const expireSpy = jest.spyOn(redis, 'expire').mockResolvedValue(undefined);

      await service.checkOrganizationRateLimit('org-1', 5);

      expect(expireSpy).toHaveBeenCalledWith(
        expect.stringContaining('RATE_LIMIT:org-1:'),
        65,
      );
    });
  });
});
