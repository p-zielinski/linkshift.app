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

  it('resolves destinations when query match is ignore', async () => {
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValue({
      id: 'map-1',
      domainGroupId: 'dg-1',
      caseSensitive: false,
      queryMatch: 'ignore',
      fallbackDestination: 'https://fallback.example',
      entries: [
        {
          id: 'entry-1',
          key: 'promo',
          keyNormalized: 'promo',
          destination: 'https://promo.example',
        },
      ],
    });

    const result = await service.resolveLinkMapDestination(
      'map-1',
      'Promo',
      new URLSearchParams('utm=1'),
    );

    expect(result).toBe('https://promo.example');
    expect(cacheManager.setCustomCache).toHaveBeenCalled();
  });

  it('resolves destinations when query match is exact', async () => {
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValue({
      id: 'map-2',
      domainGroupId: 'dg-1',
      caseSensitive: false,
      queryMatch: 'exact',
      fallbackDestination: 'https://fallback.example',
      entries: [
        {
          id: 'entry-2',
          key: 'promo?x=1',
          keyNormalized: 'promo?x=1',
          destination: 'https://promo.example',
        },
      ],
    });

    const matched = await service.resolveLinkMapDestination(
      'map-2',
      'promo',
      new URLSearchParams('x=1'),
    );
    const fallback = await service.resolveLinkMapDestination(
      'map-2',
      'promo',
      new URLSearchParams('x=1&y=2'),
    );

    expect(matched).toBe('https://promo.example');
    expect(fallback).toBe('https://fallback.example');
  });

  it('resolves destinations when query match is subset', async () => {
    (prisma.linkMap.findFirst as jest.Mock).mockResolvedValue({
      id: 'map-3',
      domainGroupId: 'dg-1',
      caseSensitive: true,
      queryMatch: 'subset',
      fallbackDestination: 'https://fallback.example',
      entries: [
        {
          id: 'entry-3',
          key: 'sale?utm=1',
          keyNormalized: 'sale?utm=1',
          destination: 'https://sale.example',
        },
      ],
    });

    const matched = await service.resolveLinkMapDestination(
      'map-3',
      'sale',
      new URLSearchParams('utm=1&x=2'),
    );
    const fallback = await service.resolveLinkMapDestination(
      'map-3',
      'sale',
      new URLSearchParams('utm=2'),
    );

    expect(matched).toBe('https://sale.example');
    expect(fallback).toBe('https://fallback.example');
  });
});
