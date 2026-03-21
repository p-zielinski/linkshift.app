import { HttpException } from '@nestjs/common';
import { LinkMapService } from './link-map.service';
import { PrismaService } from '../prisma.service';
import { OrganizationService } from '../organization/organization.service';
import { CacheManagerService } from '../cache/cache-manager.service';
import { DestinationExtractorService } from '../security/destination-extractor.service';
import { SafetyScannerService } from '../security/safety-scanner.service';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';

const expectHttpError = async (
  promise: Promise<unknown>,
  status: number,
  detailsPart: string,
) => {
  try {
    await promise;
    throw new Error('Expected HttpException but promise resolved.');
  } catch (error) {
    expect(error).toBeInstanceOf(HttpException);
    const httpError = error as HttpException;
    expect(httpError.getStatus()).toBe(status);
    const response = httpError.getResponse() as { details?: string };
    expect(response.details).toContain(detailsPart);
  }
};

describe('LinkMapService', () => {
  let service: LinkMapService;
  let prisma: {
    linkMap: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    linkMapEntry: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      upsert: jest.Mock;
    };
    domainGroup: {
      findFirst: jest.Mock;
    };
    redirectRule: {
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let organizationService: {
    checkLinkMapLimit: jest.Mock;
    checkLinkMapEntryLimit: jest.Mock;
  };
  let cacheManager: {
    getCustomCache: jest.Mock;
    setCustomCache: jest.Mock;
    invalidateCustomCache: jest.Mock;
  };
  let destinationExtractor: {
    extractUrls: jest.Mock;
  };
  let safetyScannerService: {
    checkUrls: jest.Mock;
  };
  let logger: {
    log: jest.Mock;
    error: jest.Mock;
    warn: jest.Mock;
    debug: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      linkMap: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      linkMapEntry: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
      },
      domainGroup: {
        findFirst: jest.fn(),
      },
      redirectRule: {
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    organizationService = {
      checkLinkMapLimit: jest.fn().mockResolvedValue(undefined),
      checkLinkMapEntryLimit: jest.fn().mockResolvedValue(undefined),
    };

    cacheManager = {
      getCustomCache: jest.fn().mockResolvedValue(undefined),
      setCustomCache: jest.fn().mockResolvedValue(undefined),
      invalidateCustomCache: jest.fn().mockResolvedValue(undefined),
    };

    destinationExtractor = {
      extractUrls: jest.fn().mockReturnValue([]),
    };

    safetyScannerService = {
      checkUrls: jest.fn().mockResolvedValue(new Map<string, boolean>()),
    };

    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    service = new LinkMapService(
      prisma as unknown as PrismaService,
      organizationService as unknown as OrganizationService,
      cacheManager as unknown as CacheManagerService,
      destinationExtractor as unknown as DestinationExtractorService,
      safetyScannerService as unknown as SafetyScannerService,
      { getId: jest.fn().mockReturnValue('req-1') } as unknown as ClsService,
      logger as unknown as Logger,
    );
  });

  describe('createMap', () => {
    it('creates a link map with defaults and invalidates cache', async () => {
      prisma.domainGroup.findFirst.mockResolvedValue({ id: 'dmg_1' });
      prisma.linkMap.create.mockResolvedValue({
        id: 'lmap_1',
        name: 'Main map',
        domainGroupId: 'dmg_1',
        caseSensitive: false,
        queryMatch: 'ignore',
        fallbackDestination: null,
        _count: { entries: 0 },
      });

      const result = await service.createMap('org_1', {
        name: 'Main map',
        domainGroupId: 'dmg_1',
      } as any);

      expect(organizationService.checkLinkMapLimit).toHaveBeenCalledWith(
        'org_1',
        'dmg_1',
      );
      expect(prisma.linkMap.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Main map',
            domainGroupId: 'dmg_1',
            caseSensitive: false,
            queryMatch: 'ignore',
            fallbackDestination: null,
          }),
        }),
      );
      expect(cacheManager.invalidateCustomCache).toHaveBeenCalledWith(
        'LINK_MAP_CONTEXT:lmap_1',
      );
      expect(result).toMatchObject({
        id: 'lmap_1',
        name: 'Main map',
        entriesCount: 0,
      });
    });

    it('returns not found error when domain group does not exist', async () => {
      prisma.domainGroup.findFirst.mockResolvedValue(null);

      await expectHttpError(
        service.createMap('org_1', {
          name: 'Main map',
          domainGroupId: 'dmg_missing',
        } as any),
        404,
        'Domain group with id dmg_missing not found',
      );
    });

    it('returns internal server error when safety scanner fails', async () => {
      prisma.domainGroup.findFirst.mockResolvedValue({ id: 'dmg_1' });
      destinationExtractor.extractUrls.mockReturnValue(['https://safe.example']);
      safetyScannerService.checkUrls.mockRejectedValue(new Error('scanner failed'));

      await expectHttpError(
        service.createMap('org_1', {
          name: 'Main map',
          domainGroupId: 'dmg_1',
          fallbackDestination: 'https://safe.example',
        } as any),
        500,
        'Safety scan failed. Please try again later.',
      );

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateMap', () => {
    it('rejects changing case sensitivity from sensitive to insensitive', async () => {
      prisma.linkMap.findFirst.mockResolvedValue({
        id: 'lmap_1',
        name: 'Main map',
        domainGroupId: 'dmg_1',
        caseSensitive: true,
        queryMatch: 'exact',
        fallbackDestination: null,
        entries: [],
      });

      await expectHttpError(
        service.updateMap('lmap_1', 'org_1', { caseSensitive: false } as any),
        400,
        'Changing case sensitivity from sensitive to insensitive is not allowed.',
      );
    });

    it('renormalizes existing entries when query matching mode changes', async () => {
      const txLinkMapUpdate = jest.fn().mockResolvedValue(undefined);
      const txLinkMapEntryUpdate = jest.fn().mockResolvedValue(undefined);

      prisma.$transaction.mockImplementation(async (cb: any) =>
        cb({
          linkMap: { update: txLinkMapUpdate },
          linkMapEntry: { update: txLinkMapEntryUpdate },
        }),
      );

      prisma.linkMap.findFirst
        .mockResolvedValueOnce({
          id: 'lmap_1',
          name: 'Main map',
          domainGroupId: 'dmg_1',
          caseSensitive: false,
          queryMatch: 'ignore',
          fallbackDestination: null,
          entries: [
            {
              id: 'lme_1',
              key: 'Promo?B=2&a=1',
              destination: 'https://promo.example',
            },
          ],
        })
        .mockResolvedValueOnce({
          id: 'lmap_1',
          name: 'Main map',
          domainGroupId: 'dmg_1',
          caseSensitive: false,
          queryMatch: 'exact',
          fallbackDestination: null,
          _count: { entries: 1 },
        });

      const result = await service.updateMap('lmap_1', 'org_1', {
        queryMatch: 'exact',
      });

      expect(txLinkMapUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lmap_1' },
          data: expect.objectContaining({
            queryMatch: 'exact',
          }),
        }),
      );
      expect(txLinkMapEntryUpdate).toHaveBeenCalledWith({
        where: { id: 'lme_1' },
        data: expect.objectContaining({
          key: 'promo?a=1&b=2',
          keyNormalized: 'promo?a=1&b=2',
        }),
      });
      expect(cacheManager.invalidateCustomCache).toHaveBeenCalledWith(
        'LINK_MAP_CONTEXT:lmap_1',
      );
      expect(result).toMatchObject({
        id: 'lmap_1',
        queryMatch: 'exact',
        entriesCount: 1,
      });
    });
  });

  describe('deleteMap', () => {
    it('rejects deletion when entries exist', async () => {
      prisma.linkMap.findFirst.mockResolvedValue({
        id: 'lmap_1',
        domainGroupId: 'dmg_1',
      });
      prisma.linkMapEntry.count.mockResolvedValue(1);

      await expectHttpError(
        service.deleteMap('lmap_1', 'org_1'),
        400,
        'Link map cannot be deleted while it contains entries. Remove all entries first.',
      );
      expect(prisma.redirectRule.count).not.toHaveBeenCalled();
      expect(prisma.linkMap.update).not.toHaveBeenCalled();
    });

    it('rejects deletion when redirect rules are linked', async () => {
      prisma.linkMap.findFirst.mockResolvedValue({
        id: 'lmap_1',
        domainGroupId: 'dmg_1',
      });
      prisma.linkMapEntry.count.mockResolvedValue(0);
      prisma.redirectRule.count.mockResolvedValue(2);

      await expectHttpError(
        service.deleteMap('lmap_1', 'org_1'),
        400,
        'Link map is assigned to redirect rules and cannot be deleted.',
      );
      expect(prisma.linkMap.update).not.toHaveBeenCalled();
    });
  });

  describe('createEntry', () => {
    it('rejects duplicate normalized key in the same map', async () => {
      prisma.linkMap.findFirst.mockResolvedValue({
        id: 'lmap_1',
        caseSensitive: false,
        queryMatch: 'exact',
        domainGroupId: 'dmg_1',
      });
      prisma.linkMapEntry.findFirst.mockResolvedValue({ id: 'lme_existing' });

      await expectHttpError(
        service.createEntry('org_1', {
          linkMapId: 'lmap_1',
          key: '/Promo?B=2&a=1',
          destination: 'https://promo.example',
        } as any),
        400,
        'Duplicate link map key detected',
      );

      expect(organizationService.checkLinkMapEntryLimit).not.toHaveBeenCalled();
      expect(cacheManager.invalidateCustomCache).not.toHaveBeenCalled();
    });

    it('normalizes key/query before create and invalidates cache on success', async () => {
      prisma.linkMap.findFirst.mockResolvedValue({
        id: 'lmap_1',
        caseSensitive: false,
        queryMatch: 'exact',
        domainGroupId: 'dmg_1',
      });
      prisma.linkMapEntry.findFirst.mockResolvedValue(null);
      prisma.linkMapEntry.create.mockResolvedValue({
        id: 'lme_1',
      });

      await service.createEntry('org_1', {
        linkMapId: 'lmap_1',
        key: '/Promo?B=2&a=1',
        destination: 'https://promo.example',
      } as any);

      expect(prisma.linkMapEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            linkMapId: 'lmap_1',
            key: 'promo?a=1&b=2',
            keyNormalized: 'promo?a=1&b=2',
            destination: 'https://promo.example',
          }),
        }),
      );
      expect(organizationService.checkLinkMapEntryLimit).toHaveBeenCalledWith(
        'org_1',
        'dmg_1',
        1,
        'lmap_1',
      );
      expect(cacheManager.invalidateCustomCache).toHaveBeenCalledWith(
        'LINK_MAP_CONTEXT:lmap_1',
      );
    });
  });

  describe('importEntries', () => {
    it('imports only valid entries and returns deterministic errors list', async () => {
      prisma.linkMap.findFirst.mockResolvedValue({
        id: 'lmap_1',
        caseSensitive: false,
        queryMatch: 'exact',
        domainGroupId: 'dmg_1',
      });
      destinationExtractor.extractUrls.mockImplementation((value: string) => [value]);
      safetyScannerService.checkUrls.mockResolvedValue(
        new Map<string, boolean>([
          ['https://safe-1.example', true],
          ['https://safe-2.example', true],
          ['https://unsafe.example', false],
          ['https://safe-3.example', true],
          ['https://safe-4.example', true],
        ]),
      );
      prisma.linkMapEntry.findMany.mockResolvedValue([{ keyNormalized: 'existing' }]);
      prisma.linkMapEntry.create
        .mockResolvedValueOnce({ id: 'lme_imported_1' })
        .mockRejectedValueOnce(new Error('DB unavailable'));

      const result = await service.importEntries('org_1', {
        linkMapId: 'lmap_1',
        entries: [
          { key: 'Promo?utm=1', destination: 'https://safe-1.example' },
          { key: 'promo?utm=1', destination: 'https://safe-2.example' },
          { key: 'blocked', destination: 'https://unsafe.example' },
          { key: 'existing', destination: 'https://safe-3.example' },
          { key: 'new', destination: 'https://safe-4.example' },
        ],
      } as any);

      expect(result.total).toBe(5);
      expect(result.importedCount).toBe(1);
      expect(result.failedCount).toBe(4);
      expect(result.importedEntryIds).toEqual(['lme_imported_1']);
      expect(result.errors.map((entry) => entry.index)).toEqual([1, 2, 3, 4]);
      expect(result.errors[0]?.error).toContain('Duplicate key in import payload');
      expect(result.errors[1]?.error).toContain('Unsafe destination domain detected');
      expect(result.errors[2]?.error).toContain('Key already exists in this link map');
      expect(result.errors[3]?.error).toContain('DB unavailable');
      expect(organizationService.checkLinkMapEntryLimit).toHaveBeenCalledTimes(2);
      expect(cacheManager.invalidateCustomCache).toHaveBeenCalledWith(
        'LINK_MAP_CONTEXT:lmap_1',
      );
    });
  });

  describe('deleteEntriesById', () => {
    it('invalidates cache only when something was deleted', async () => {
      prisma.linkMap.findFirst.mockResolvedValue({
        id: 'lmap_1',
      });

      prisma.linkMapEntry.updateMany.mockResolvedValueOnce({ count: 0 });
      const noneDeleted = await service.deleteEntriesById('org_1', {
        linkMapId: 'lmap_1',
        entryIds: ['lme_1'],
      } as any);

      expect(noneDeleted).toEqual({ deletedCount: 0 });
      expect(cacheManager.invalidateCustomCache).not.toHaveBeenCalled();

      prisma.linkMapEntry.updateMany.mockResolvedValueOnce({ count: 2 });
      const deleted = await service.deleteEntriesById('org_1', {
        linkMapId: 'lmap_1',
        entryIds: ['lme_1', 'lme_2'],
      } as any);

      expect(deleted).toEqual({ deletedCount: 2 });
      expect(cacheManager.invalidateCustomCache).toHaveBeenCalledWith(
        'LINK_MAP_CONTEXT:lmap_1',
      );
    });
  });

  describe('upsertEntries', () => {
    it('replaces entries in replace mode and upserts normalized keys', async () => {
      const txUpdateMany = jest.fn().mockResolvedValue(undefined);
      const txUpsert = jest.fn().mockResolvedValue(undefined);

      prisma.linkMap.findFirst.mockResolvedValue({
        id: 'lmap_1',
        domainGroupId: 'dmg_1',
        caseSensitive: false,
        queryMatch: 'exact',
        entries: [{ id: 'lme_old' }],
      });
      prisma.$transaction.mockImplementation(async (cb: any) =>
        cb({
          linkMapEntry: {
            updateMany: txUpdateMany,
            upsert: txUpsert,
          },
        }),
      );

      jest.spyOn(service, 'getMapById').mockResolvedValue({
        id: 'lmap_1',
        entriesCount: 1,
      } as any);

      const result = await service.upsertEntries('lmap_1', 'org_1', {
        mode: 'replace',
        entries: [
          {
            key: '/Promo?B=2&a=1',
            destination: 'https://promo.example',
          },
        ],
      } as any);

      expect(txUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { linkMapId: 'lmap_1', deletedAt: null },
        }),
      );
      expect(txUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            linkMapId_keyNormalized: {
              linkMapId: 'lmap_1',
              keyNormalized: 'promo?a=1&b=2',
            },
          },
          update: expect.objectContaining({
            key: 'promo?a=1&b=2',
            destination: 'https://promo.example',
            deletedAt: null,
          }),
        }),
      );
      expect(cacheManager.invalidateCustomCache).toHaveBeenCalledWith(
        'LINK_MAP_CONTEXT:lmap_1',
      );
      expect(result).toEqual({ id: 'lmap_1', entriesCount: 1 });
    });
  });

  describe('resolveLinkMapDestination', () => {
    it('hydrates cached raw data and reuses it on next call', async () => {
      cacheManager.getCustomCache.mockResolvedValueOnce(undefined);
      prisma.linkMap.findFirst.mockResolvedValueOnce({
        id: 'map-exact',
        domainGroupId: 'dg-1',
        caseSensitive: false,
        queryMatch: 'exact',
        fallbackDestination: 'https://fallback.example',
        entries: [
          {
            id: 'entry-1',
            key: 'promo?x=1',
            keyNormalized: 'promo?x=1',
            destination: 'https://promo.example',
          },
        ],
      });

      const firstResult = await service.resolveLinkMapDestination(
        'map-exact',
        'promo',
        new URLSearchParams('x=1'),
      );

      const rawData = cacheManager.setCustomCache.mock.calls[0][1];
      expect(rawData.entries[0].queryString).toBe('x=1');
      expect(rawData.entriesByKey).toBeUndefined();

      cacheManager.getCustomCache.mockResolvedValueOnce(rawData);
      const secondResult = await service.resolveLinkMapDestination(
        'map-exact',
        'promo',
        new URLSearchParams('x=1'),
      );

      expect(firstResult).toBe('https://promo.example');
      expect(secondResult).toBe('https://promo.example');
      expect(prisma.linkMap.findFirst).toHaveBeenCalledTimes(1);
    });

    it('supports ignore, exact, and subset modes with specificity', async () => {
      cacheManager.getCustomCache.mockResolvedValue(undefined);
      prisma.linkMap.findFirst
        .mockResolvedValueOnce({
          id: 'map-ignore',
          domainGroupId: 'dg-1',
          caseSensitive: false,
          queryMatch: 'ignore',
          fallbackDestination: 'https://fallback.example',
          entries: [
            {
              id: 'entry-3',
              key: 'promo',
              keyNormalized: 'promo',
              destination: 'https://promo.example',
            },
          ],
        })
        .mockResolvedValueOnce({
          id: 'map-exact',
          domainGroupId: 'dg-1',
          caseSensitive: false,
          queryMatch: 'exact',
          fallbackDestination: 'https://fallback.example',
          entries: [
            {
              id: 'entry-4',
              key: 'promo?x=1',
              keyNormalized: 'promo?x=1',
              destination: 'https://promo.example',
            },
          ],
        })
        .mockResolvedValueOnce({
          id: 'map-exact',
          domainGroupId: 'dg-1',
          caseSensitive: false,
          queryMatch: 'exact',
          fallbackDestination: 'https://fallback.example',
          entries: [
            {
              id: 'entry-4',
              key: 'promo?x=1',
              keyNormalized: 'promo?x=1',
              destination: 'https://promo.example',
            },
          ],
        })
        .mockResolvedValueOnce({
          id: 'map-subset',
          domainGroupId: 'dg-1',
          caseSensitive: false,
          queryMatch: 'subset',
          fallbackDestination: 'https://fallback.example',
          entries: [
            {
              id: 'entry-5',
              key: 'sale?utm=1',
              keyNormalized: 'sale?utm=1',
              destination: 'https://sale-basic.example',
            },
            {
              id: 'entry-6',
              key: 'sale?utm=1&src=2',
              keyNormalized: 'sale?src=2&utm=1',
              destination: 'https://sale-specific.example',
            },
          ],
        })
        .mockResolvedValueOnce({
          id: 'map-subset',
          domainGroupId: 'dg-1',
          caseSensitive: false,
          queryMatch: 'subset',
          fallbackDestination: 'https://fallback.example',
          entries: [
            {
              id: 'entry-5',
              key: 'sale?utm=1',
              keyNormalized: 'sale?utm=1',
              destination: 'https://sale-basic.example',
            },
            {
              id: 'entry-6',
              key: 'sale?utm=1&src=2',
              keyNormalized: 'sale?src=2&utm=1',
              destination: 'https://sale-specific.example',
            },
          ],
        });

      const ignoreResult = await service.resolveLinkMapDestination(
        'map-ignore',
        'Promo',
        new URLSearchParams('utm=1'),
      );
      const exactResult = await service.resolveLinkMapDestination(
        'map-exact',
        'promo',
        new URLSearchParams('x=1'),
      );
      const exactFallback = await service.resolveLinkMapDestination(
        'map-exact',
        'promo',
        new URLSearchParams('x=1&y=2'),
      );
      const subsetResult = await service.resolveLinkMapDestination(
        'map-subset',
        'sale',
        new URLSearchParams('utm=1&src=2&x=3'),
      );
      const subsetFallback = await service.resolveLinkMapDestination(
        'map-subset',
        'sale',
        new URLSearchParams('utm=999'),
      );

      expect(ignoreResult).toBe('https://promo.example');
      expect(exactResult).toBe('https://promo.example');
      expect(exactFallback).toBe('https://fallback.example');
      expect(subsetResult).toBe('https://sale-specific.example');
      expect(subsetFallback).toBe('https://fallback.example');
    });

    it('reuses the same entry reference across entriesByKey and entriesByPath', async () => {
      cacheManager.getCustomCache.mockResolvedValueOnce(undefined);
      prisma.linkMap.findFirst.mockResolvedValueOnce({
        id: 'map-ref',
        domainGroupId: 'dg-1',
        caseSensitive: false,
        queryMatch: 'ignore',
        fallbackDestination: null,
        entries: [
          {
            id: 'entry-7',
            key: 'promo?x=1',
            keyNormalized: 'promo',
            destination: 'https://promo.example',
          },
        ],
      });

      const context = await (service as unknown as {
        getLinkMapContext: (id: string) => Promise<any>;
      }).getLinkMapContext('map-ref');

      const fromKey = context.entriesByKey.get('promo');
      const fromPath = context.entriesByPath.get('promo')?.[0];

      expect(fromKey).toBeDefined();
      expect(fromKey).toBe(fromPath);
    });

    it('returns null when entry is missing and fallback destination is not set', async () => {
      cacheManager.getCustomCache.mockResolvedValueOnce(undefined);
      prisma.linkMap.findFirst.mockResolvedValueOnce({
        id: 'map-no-fallback',
        domainGroupId: 'dg-1',
        caseSensitive: false,
        queryMatch: 'exact',
        fallbackDestination: null,
        entries: [
          {
            id: 'entry-8',
            key: 'promo?x=1',
            keyNormalized: 'promo?x=1',
            destination: 'https://promo.example',
          },
        ],
      });

      const result = await service.resolveLinkMapDestination(
        'map-no-fallback',
        'promo',
        new URLSearchParams('x=999'),
      );

      expect(result).toBeNull();
    });
  });
});
