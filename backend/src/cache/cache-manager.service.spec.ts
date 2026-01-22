import { Test, TestingModule } from '@nestjs/testing';
import {
  CacheManagerService,
  DataType,
  CachedByProperty,
} from './cache-manager.service';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CacheManagerIdsService } from './cache-manager-ids.service';

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
          provide: PrismaService,
          useValue: {
            user: { findFirst: jest.fn() },
            organization: { findFirst: jest.fn() },
            // Dodaj inne delegaty jeśli potrzebujesz
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: CacheManagerIdsService,
          useValue: {
            getSimpleCacheManageId: jest.fn().mockReturnValue('mock-cache-key'),
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
      // Próba pobrania organizacji po emailu (a dozwolone jest tylko ID wg storeByProperties)
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
});
