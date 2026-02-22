import { Test, TestingModule } from '@nestjs/testing';
import { LinkMapService } from './link-map.service';
import { PrismaService } from '../prisma.service';
import { OrganizationService } from '../organization/organization.service';
import { CacheManagerService } from '../cache/cache-manager.service';
import { DestinationExtractorService } from '../security/destination-extractor.service';
import { SafetyScannerService } from '../security/safety-scanner.service';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';

describe('LinkMapService', () => {
  let service: LinkMapService;
  let prisma: PrismaService;
  let cacheManager: CacheManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkMapService,
        {
          provide: PrismaService,
          useValue: {
            linkMap: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: OrganizationService,
          useValue: {},
        },
        {
          provide: CacheManagerService,
          useValue: {
            getCustomCache: jest.fn().mockResolvedValue(undefined),
            setCustomCache: jest.fn().mockResolvedValue(undefined),
            invalidateCustomCache: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DestinationExtractorService,
          useValue: {
            extractUrls: jest.fn().mockReturnValue([]),
          },
        },
        {
          provide: SafetyScannerService,
          useValue: {
            checkUrls: jest.fn().mockResolvedValue(new Map()),
          },
        },
        {
          provide: ClsService,
          useValue: { getId: jest.fn().mockReturnValue('test-id') },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LinkMapService>(LinkMapService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get<CacheManagerService>(CacheManagerService);
  });

  it('hydrates cached raw data and preserves exact/subset behavior', async () => {
    (cacheManager.getCustomCache as jest.Mock).mockResolvedValueOnce(undefined);
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce({
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

    const exactFirst = await service.resolveLinkMapDestination(
      'map-exact',
      'promo',
      new URLSearchParams('x=1'),
    );

    const exactRaw = (cacheManager.setCustomCache as jest.Mock).mock.calls[0][1];
    expect(exactRaw.entries[0].queryString).toBe('x=1');
    expect(Object.prototype.hasOwnProperty.call(exactRaw, 'entriesByKey')).toBe(
      false,
    );

    (cacheManager.getCustomCache as jest.Mock).mockResolvedValueOnce(exactRaw);
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const exactCached = await service.resolveLinkMapDestination(
      'map-exact',
      'promo',
      new URLSearchParams('x=1'),
    );

    expect(exactCached).toBe(exactFirst);

    (cacheManager.getCustomCache as jest.Mock).mockResolvedValueOnce(undefined);
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'map-subset',
      domainGroupId: 'dg-1',
      caseSensitive: false,
      queryMatch: 'subset',
      fallbackDestination: 'https://fallback.example',
      entries: [
        {
          id: 'entry-2',
          key: 'sale?utm=1',
          keyNormalized: 'sale?utm=1',
          destination: 'https://sale.example',
        },
      ],
    });

    const subsetFirst = await service.resolveLinkMapDestination(
      'map-subset',
      'sale',
      new URLSearchParams('utm=1&x=2'),
    );

    const subsetRaw = (cacheManager.setCustomCache as jest.Mock).mock.calls[1][1];
    (cacheManager.getCustomCache as jest.Mock).mockResolvedValueOnce(subsetRaw);
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const subsetCached = await service.resolveLinkMapDestination(
      'map-subset',
      'sale',
      new URLSearchParams('utm=1&x=2'),
    );

    expect(subsetCached).toBe(subsetFirst);
  });

  it('handles ignore, exact, and subset query matching', async () => {
    (cacheManager.getCustomCache as jest.Mock).mockResolvedValueOnce(undefined);
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce({
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
    });

    const ignoreResult = await service.resolveLinkMapDestination(
      'map-ignore',
      'Promo',
      new URLSearchParams('utm=1'),
    );

    expect(ignoreResult).toBe('https://promo.example');

    (cacheManager.getCustomCache as jest.Mock).mockResolvedValueOnce(undefined);
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'map-exact-2',
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
    });
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'map-exact-2',
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
    });

    const exactMatch = await service.resolveLinkMapDestination(
      'map-exact-2',
      'promo',
      new URLSearchParams('x=1'),
    );
    const exactFallback = await service.resolveLinkMapDestination(
      'map-exact-2',
      'promo',
      new URLSearchParams('x=1&y=2'),
    );

    expect(exactMatch).toBe('https://promo.example');
    expect(exactFallback).toBe('https://fallback.example');

    (cacheManager.getCustomCache as jest.Mock).mockResolvedValueOnce(undefined);
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'map-subset-2',
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
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'map-subset-2',
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

    const subsetMatch = await service.resolveLinkMapDestination(
      'map-subset-2',
      'sale',
      new URLSearchParams('utm=1&src=2&x=3'),
    );
    const subsetFallback = await service.resolveLinkMapDestination(
      'map-subset-2',
      'sale',
      new URLSearchParams('utm=2'),
    );

    expect(subsetMatch).toBe('https://sale-specific.example');
    expect(subsetFallback).toBe('https://fallback.example');
  });

  it('reuses entry references across indexes', async () => {
    (cacheManager.getCustomCache as jest.Mock).mockResolvedValueOnce(undefined);
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValueOnce({
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
});
