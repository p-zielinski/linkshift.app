import { ConfigService } from '@nestjs/config';
import { DataType } from '../cache/cache-manager.service';
import { PrismaService } from '../prisma.service';
import {
  buildShortPath,
  buildShortUrl,
  normalizeRuleSourcePath,
  resolveBestRuleByMapId,
  resolveFirstHostForDomainGroup,
} from './links-aggregation.util';
import { LinksListService } from './links-list.service';

describe('links-aggregation.util (backend)', () => {
  it('builds short path from source and key', () => {
    expect(buildShortPath('/go', 'summer-sale')).toBe('/go/summer-sale');
    expect(buildShortPath('go', 'summer-sale')).toBe('/go/summer-sale');
    expect(buildShortPath('/go/', '/summer-sale/')).toBe('/go/summer-sale');
  });

  it('builds root short path when source is slash', () => {
    expect(buildShortPath('/', 'summer-sale')).toBe('/summer-sale');
    expect(buildShortPath('/', '')).toBe('/');
  });

  it('builds short URL with https protocol', () => {
    expect(buildShortUrl('promo.example.com', '/go/summer')).toBe(
      'https://promo.example.com/go/summer',
    );
    expect(buildShortUrl('https://promo.example.com', '/go/summer')).toBe(
      'https://promo.example.com/go/summer',
    );
    expect(buildShortUrl('', '/go/summer')).toBe('/go/summer');
  });

  it('normalizes source path from stored rule source', () => {
    expect(normalizeRuleSourcePath('/go')).toBe('/go');
    expect(normalizeRuleSourcePath('https://example.com/go/')).toBe('/go');
    expect(normalizeRuleSourcePath('')).toBe('/');
  });

  it('resolves best prefix rule per link map by priority then createdAt', () => {
    const best = resolveBestRuleByMapId([
      {
        id: 'rule-newer',
        linkMapId: 'map-1',
        source: '/new',
        pathMatch: 'prefix',
        queryMatch: 'ignore',
        isBlocked: false,
        priority: 0,
        createdAt: '2026-06-05T10:00:00.000Z',
      },
      {
        id: 'rule-older',
        linkMapId: 'map-1',
        source: '/go',
        pathMatch: 'prefix',
        queryMatch: 'ignore',
        isBlocked: false,
        priority: 0,
        createdAt: '2026-06-05T09:00:00.000Z',
      },
      {
        id: 'rule-higher-priority',
        linkMapId: 'map-2',
        source: '/high',
        pathMatch: 'prefix',
        queryMatch: 'ignore',
        isBlocked: false,
        priority: 5,
        createdAt: '2026-06-05T11:00:00.000Z',
      },
      {
        id: 'rule-lower-priority',
        linkMapId: 'map-2',
        source: '/low',
        pathMatch: 'prefix',
        queryMatch: 'ignore',
        isBlocked: false,
        priority: 1,
        createdAt: '2026-06-05T12:00:00.000Z',
      },
      {
        id: 'rule-blocked',
        linkMapId: 'map-3',
        source: '/blocked',
        pathMatch: 'prefix',
        queryMatch: 'ignore',
        isBlocked: true,
        priority: 0,
        createdAt: '2026-06-05T08:00:00.000Z',
      },
    ]);

    expect(best['map-1']?.id).toBe('rule-older');
    expect(best['map-2']?.id).toBe('rule-lower-priority');
    expect(best['map-3']).toBeUndefined();
  });

  it('resolves first host with subdomains before custom domains', () => {
    const host = resolveFirstHostForDomainGroup(
      'group-1',
      [{ name: 'promo', domainGroupId: 'group-1' }],
      [{ name: 'campaign.example.com', domainGroupId: 'group-1' }],
      'https://ls.linkshift.app',
    );

    expect(host).toBe('promo.ls.linkshift.app');
  });
});

describe('LinksListService', () => {
  let service: LinksListService;
  let prisma: {
    linkMapEntry: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
    };
    redirectRule: {
      findMany: jest.Mock;
    };
    linkShiftSubdomain: {
      findMany: jest.Mock;
    };
    domain: {
      findMany: jest.Mock;
    };
  };
  let configService: {
    get: jest.Mock;
  };

  const organizationId = 'org_test123456789012345678901';
  const updatedAt = new Date('2026-06-05T10:00:00.000Z');

  const makeEntry = (overrides?: Partial<{
    id: string;
    key: string;
    destination: string;
    updatedAt: Date;
    linkMapId: string;
    linkMapName: string;
    domainGroupId: string;
  }>) => ({
    id: overrides?.id ?? 'lme_entry123456789012345678901',
    key: overrides?.key ?? 'summer-sale',
    destination: overrides?.destination ?? 'https://target.example.com/summer',
    updatedAt: overrides?.updatedAt ?? updatedAt,
    linkMap: {
      id: overrides?.linkMapId ?? 'lmp_map1234567890123456789012',
      name: overrides?.linkMapName ?? 'Default links',
      domainGroupId: overrides?.domainGroupId ?? 'dgp_group123456789012345678901',
    },
  });

  beforeEach(() => {
    prisma = {
      linkMapEntry: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      redirectRule: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'rdr_rule1234567890123456789012',
            linkMapId: 'lmp_map1234567890123456789012',
            source: '/go',
            pathMatch: 'prefix',
            queryMatch: 'ignore',
            isBlocked: false,
            priority: 0,
            createdAt: new Date('2026-06-05T09:00:00.000Z'),
          },
        ]),
      },
      linkShiftSubdomain: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      domain: {
        findMany: jest.fn().mockResolvedValue([
          {
            name: 'promo.example.com',
            domainGroupId: 'dgp_group123456789012345678901',
          },
        ]),
      },
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'APP_SUBDOMAIN_BASE_URL') {
          return 'https://ls.linkshift.app';
        }
        return undefined;
      }),
    };

    service = new LinksListService(
      prisma as unknown as PrismaService,
      configService as unknown as ConfigService,
    );
  });

  it('returns aggregated rows with shortUrl from first host', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([makeEntry()]);

    const result = await service.list(organizationId, { limit: 20 });

    expect(result.dataType).toBe(DataType.LINKS_LIST);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      shortPath: '/go/summer-sale',
      shortUrl: 'https://promo.example.com/go/summer-sale',
      host: 'promo.example.com',
      shortUrls: [],
      redirectRuleId: 'rdr_rule1234567890123456789012',
      updatedAt: '2026-06-05T10:00:00.000Z',
    });
  });

  it('returns path-only shortUrl when site has no hosts', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([makeEntry({ key: 'launch' })]);
    prisma.domain.findMany.mockResolvedValue([]);
    prisma.redirectRule.findMany.mockResolvedValue([]);

    const result = await service.list(organizationId, { limit: 20 });

    expect(result.data[0]).toMatchObject({
      shortPath: '/go/launch',
      shortUrl: '/go/launch',
      host: '',
      shortUrls: [],
      redirectRuleId: null,
    });
  });

  it('paginates with hasMore and moreStartingAfterId', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([
      makeEntry({ id: 'lme_first123456789012345678901', updatedAt: new Date('2026-06-05T11:00:00.000Z') }),
      makeEntry({ id: 'lme_second123456789012345678902', updatedAt: new Date('2026-06-05T10:00:00.000Z') }),
    ]);

    const result = await service.list(organizationId, { limit: 1 });

    expect(result.hasMore).toBe(true);
    expect(result.moreStartingAfterId).toBe('lme_first123456789012345678901');
    expect(result.data).toHaveLength(1);
    expect(prisma.linkMapEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('applies composite cursor from startAfterId', async () => {
    const cursorUpdatedAt = new Date('2026-06-05T10:00:00.000Z');
    prisma.linkMapEntry.findFirst.mockResolvedValue({
      id: 'lme_cursor123456789012345678901',
      updatedAt: cursorUpdatedAt,
    });
    prisma.linkMapEntry.findMany.mockResolvedValue([]);

    await service.list(organizationId, {
      limit: 20,
      startAfterId: 'lme_cursor123456789012345678901',
    });

    expect(prisma.linkMapEntry.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'lme_cursor123456789012345678901',
          deletedAt: null,
        }),
      }),
    );
    expect(prisma.linkMapEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            expect.objectContaining({ deletedAt: null }),
            {
              OR: [
                { updatedAt: { lt: cursorUpdatedAt } },
                {
                  updatedAt: cursorUpdatedAt,
                  id: { lt: 'lme_cursor123456789012345678901' },
                },
              ],
            },
          ],
        },
      }),
    );
  });

  it('scopes queries to organization and non-deleted records', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([]);

    await service.list(organizationId, { limit: 20 });

    expect(prisma.linkMapEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          linkMap: {
            deletedAt: null,
            domainGroup: {
              organizationId,
              deletedAt: null,
            },
          },
        },
      }),
    );
  });

  it('filters by domainGroupId', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([]);
    const domainGroupId = 'dgp_group123456789012345678901';

    await service.list(organizationId, { limit: 20, domainGroupId });

    expect(prisma.linkMapEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          linkMap: expect.objectContaining({
            domainGroup: expect.objectContaining({ id: domainGroupId }),
          }),
        }),
      }),
    );
  });

  it('filters by linkMapId', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([]);
    const linkMapId = 'lmp_map1234567890123456789012';

    await service.list(organizationId, { limit: 20, linkMapId });

    expect(prisma.linkMapEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          linkMap: expect.objectContaining({ id: linkMapId }),
        }),
      }),
    );
  });

  it('applies case-insensitive search on key and destination', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([]);

    await service.list(organizationId, { limit: 20, search: 'summer' });

    expect(prisma.linkMapEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { key: { contains: 'summer', mode: 'insensitive' } },
            { destination: { contains: 'summer', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });

  it('batch-loads redirect rules and hosts for page rows scoped to organization', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([
      makeEntry({ linkMapId: 'lmp_map1234567890123456789012', domainGroupId: 'dgp_group123456789012345678901' }),
    ]);

    await service.list(organizationId, { limit: 20 });

    expect(prisma.redirectRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          linkMapId: { in: ['lmp_map1234567890123456789012'] },
          pathMatch: 'prefix',
          queryMatch: 'ignore',
          isBlocked: false,
          domainGroup: {
            organizationId,
            deletedAt: null,
          },
        }),
      }),
    );
    expect(prisma.linkShiftSubdomain.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          domainGroupId: { in: ['dgp_group123456789012345678901'] },
          domainGroup: {
            organizationId,
            deletedAt: null,
          },
        }),
      }),
    );
    expect(prisma.domain.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          domainGroupId: { in: ['dgp_group123456789012345678901'] },
          domainGroup: {
            organizationId,
            deletedAt: null,
          },
        }),
      }),
    );
  });

  it('skips batch lookups when the page has no rows', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([]);

    await service.list(organizationId, { limit: 20 });

    expect(prisma.redirectRule.findMany).not.toHaveBeenCalled();
    expect(prisma.linkShiftSubdomain.findMany).not.toHaveBeenCalled();
    expect(prisma.domain.findMany).not.toHaveBeenCalled();
  });

  it('deduplicates link map and domain group ids for batch lookups', async () => {
    prisma.linkMapEntry.findMany.mockResolvedValue([
      makeEntry({
        id: 'lme_entry123456789012345678901',
        linkMapId: 'lmp_map1234567890123456789012',
        domainGroupId: 'dgp_group123456789012345678901',
      }),
      makeEntry({
        id: 'lme_entry223456789012345678901',
        linkMapId: 'lmp_map1234567890123456789012',
        domainGroupId: 'dgp_group123456789012345678901',
      }),
    ]);

    await service.list(organizationId, { limit: 20 });

    expect(prisma.redirectRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          linkMapId: { in: ['lmp_map1234567890123456789012'] },
        }),
      }),
    );
    expect(prisma.linkShiftSubdomain.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          domainGroupId: { in: ['dgp_group123456789012345678901'] },
        }),
      }),
    );
  });

  it('ignores cross-org startAfterId when cursor row is not in organization', async () => {
    prisma.linkMapEntry.findFirst.mockResolvedValue(null);
    prisma.linkMapEntry.findMany.mockResolvedValue([makeEntry()]);

    const startAfterId = 'lme_crossorg123456789012345678901';
    const result = await service.list(organizationId, {
      limit: 20,
      startAfterId,
    });

    expect(prisma.linkMapEntry.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: startAfterId,
          linkMap: expect.objectContaining({
            domainGroup: expect.objectContaining({ organizationId }),
          }),
        }),
      }),
    );
    expect(prisma.linkMapEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          linkMap: {
            deletedAt: null,
            domainGroup: {
              organizationId,
              deletedAt: null,
            },
          },
        },
      }),
    );
    expect(result.data).toHaveLength(1);
  });
});
