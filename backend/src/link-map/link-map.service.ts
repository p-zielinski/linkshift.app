import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrganizationService } from '../organization/organization.service';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} from '@shared/models/error.model';
import { throwHttpException, createCustomCuid, AppEntity } from '../utils';
import {
  CreateLinkMapDto,
  UpdateLinkMapDto,
  UpsertLinkMapEntriesDto,
  DeleteLinkMapEntriesDto,
} from '../zod-schames/link-map.schemas';
import { CacheManagerService } from '../cache/cache-manager.service';
import { DestinationExtractorService } from '../security/destination-extractor.service';
import { SafetyScannerService } from '../security/safety-scanner.service';

export type LinkMapQueryMatch = 'exact' | 'ignore' | 'subset';

type LinkMapEntryContext = {
  id: string;
  key: string;
  keyNormalized: string;
  destination: string;
  pathNormalized: string;
  query: URLSearchParams;
};

type LinkMapContext = {
  id: string;
  domainGroupId: string;
  caseSensitive: boolean;
  queryMatch: LinkMapQueryMatch;
  fallbackDestination: string | null;
  entries: LinkMapEntryContext[];
  entriesByKey: Map<string, LinkMapEntryContext>;
  entriesByPath: Map<string, LinkMapEntryContext[]>;
};

const LINK_MAP_CACHE_TTL_SECONDS = 5 * 60;

@Injectable()
export class LinkMapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationService: OrganizationService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly destinationExtractor: DestinationExtractorService,
    private readonly safetyScannerService: SafetyScannerService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  async listMaps(organizationId: string, domainGroupId: string) {
    return this.prisma.linkMap.findMany({
      where: {
        domainGroupId,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMapById(organizationId: string, id: string) {
    const map = await this.prisma.linkMap.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      include: {
        entries: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!map) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Link map with id ${id} not found`,
        }),
      );
    }

    return map;
  }

  async createMap(organizationId: string, data: CreateLinkMapDto) {
    await this.organizationService.checkLinkMapLimit(
      organizationId,
      data.domainGroupId,
    );

    const domainGroup = await this.prisma.domainGroup.findFirst({
      where: {
        id: data.domainGroupId,
        organizationId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!domainGroup) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain group with id ${data.domainGroupId} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    const entries = data.entries ?? [];
    await this.organizationService.checkLinkMapEntryLimit(
      organizationId,
      data.domainGroupId,
      entries.length,
    );

    const normalizedEntries = this.normalizeEntries(
      entries,
      data.caseSensitive ?? false,
      data.queryMatch ?? 'ignore',
    );

    await this.validateDestinations(
      [
        data.fallbackDestination,
        ...entries.map((entry) => entry.destination),
      ].filter((value): value is string => Boolean(value)),
      {
        organizationId,
        domainGroupId: data.domainGroupId,
      },
    );

    const now = new Date();
    const mapId = createCustomCuid(AppEntity.LinkMap, 32);

    const map = await this.prisma.linkMap.create({
      data: {
        id: mapId,
        name: data.name,
        domainGroupId: data.domainGroupId,
        caseSensitive: data.caseSensitive ?? false,
        queryMatch: data.queryMatch ?? 'ignore',
        fallbackDestination: data.fallbackDestination ?? null,
        entries: normalizedEntries.length
          ? {
              createMany: {
                data: normalizedEntries.map((entry) => ({
                  id: createCustomCuid(AppEntity.LinkMapEntry, 32),
                  key: entry.key,
                  keyNormalized: entry.keyNormalized,
                  destination: entry.destination,
                  createdAt: now,
                  updatedAt: now,
                })),
              },
            }
          : undefined,
      },
      include: {
        entries: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } },
      },
    });

    await this.invalidateLinkMapCache(map.id);

    return map;
  }

  async updateMap(id: string, organizationId: string, data: UpdateLinkMapDto) {
    const existing = await this.prisma.linkMap.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      include: { entries: { where: { deletedAt: null } } },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Link map with id ${id} not found`,
        }),
      );
    }

    const nextCaseSensitive =
      data.caseSensitive ?? existing.caseSensitive ?? false;
    const nextQueryMatch =
      data.queryMatch ?? (existing.queryMatch as LinkMapQueryMatch) ?? 'ignore';

    if (data.fallbackDestination !== undefined) {
      await this.validateDestinations(
        data.fallbackDestination ? [data.fallbackDestination] : [],
        { organizationId, domainGroupId: existing.domainGroupId },
      );
    }

    if (
      data.caseSensitive !== undefined ||
      data.queryMatch !== undefined
    ) {
      const normalized = this.normalizeEntries(
        existing.entries.map((entry) => ({
          key: entry.key,
          destination: entry.destination,
        })),
        nextCaseSensitive,
        nextQueryMatch,
      );

      await this.prisma.$transaction([
        this.prisma.linkMap.update({
          where: { id },
          data: {
            name: data.name ?? existing.name,
            caseSensitive: nextCaseSensitive,
            queryMatch: nextQueryMatch,
            fallbackDestination:
              data.fallbackDestination !== undefined
                ? data.fallbackDestination
                : existing.fallbackDestination,
          },
        }),
        ...normalized.map((entry) =>
          this.prisma.linkMapEntry.updateMany({
            where: {
              linkMapId: id,
              key: entry.key,
              deletedAt: null,
            },
            data: { keyNormalized: entry.keyNormalized, updatedAt: new Date() },
          }),
        ),
      ]);
    } else {
      await this.prisma.linkMap.update({
        where: { id },
        data: {
          name: data.name ?? existing.name,
          fallbackDestination:
            data.fallbackDestination !== undefined
              ? data.fallbackDestination
              : existing.fallbackDestination,
        },
      });
    }

    await this.invalidateLinkMapCache(id);

    return this.getMapById(organizationId, id);
  }

  async deleteMap(id: string, organizationId: string) {
    const existing = await this.prisma.linkMap.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Link map with id ${id} not found`,
        }),
      );
    }

    await this.prisma.linkMap.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.invalidateLinkMapCache(id);
    return;
  }

  async upsertEntries(
    id: string,
    organizationId: string,
    data: UpsertLinkMapEntriesDto,
  ) {
    const existing = await this.prisma.linkMap.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      include: { entries: { where: { deletedAt: null } } },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Link map with id ${id} not found`,
        }),
      );
    }

    const normalizedEntries = this.normalizeEntries(
      data.entries,
      existing.caseSensitive,
      existing.queryMatch as LinkMapQueryMatch,
    );

    const isReplace = data.mode === 'replace';
    const existingCount = existing.entries.length;
    const nextCount = isReplace
      ? normalizedEntries.length
      : existingCount + normalizedEntries.length;

    await this.organizationService.checkLinkMapEntryLimit(
      organizationId,
      existing.domainGroupId,
      nextCount - existingCount,
      id,
    );

    await this.validateDestinations(
      normalizedEntries.map((entry) => entry.destination),
      { organizationId, domainGroupId: existing.domainGroupId },
    );

    const now = new Date();

    const entryCreates = normalizedEntries.map((entry) => ({
      id: createCustomCuid(AppEntity.LinkMapEntry, 32),
      linkMapId: id,
      key: entry.key,
      keyNormalized: entry.keyNormalized,
      destination: entry.destination,
      createdAt: now,
      updatedAt: now,
    }));

    await this.prisma.$transaction(async (tx) => {
      if (isReplace) {
        await tx.linkMapEntry.updateMany({
          where: { linkMapId: id, deletedAt: null },
          data: { deletedAt: now },
        });
      }

      for (const entry of entryCreates) {
        await tx.linkMapEntry.upsert({
          where: {
            linkMapId_keyNormalized: {
              linkMapId: id,
              keyNormalized: entry.keyNormalized,
            },
          },
          update: {
            destination: entry.destination,
            key: entry.key,
            deletedAt: null,
            updatedAt: now,
          },
          create: entry,
        });
      }
    });

    await this.invalidateLinkMapCache(id);
    return this.getMapById(organizationId, id);
  }

  async deleteEntries(
    id: string,
    organizationId: string,
    data: DeleteLinkMapEntriesDto,
  ) {
    const existing = await this.prisma.linkMap.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      select: { id: true },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Link map with id ${id} not found`,
        }),
      );
    }

    const now = new Date();
    const keys = data.keys.map((key) => key.trim()).filter(Boolean);

    await this.prisma.linkMapEntry.updateMany({
      where: {
        linkMapId: id,
        key: { in: keys },
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    await this.invalidateLinkMapCache(id);
    return;
  }

  async resolveLinkMapDestination(
    linkMapId: string,
    keyPath: string,
    query: URLSearchParams,
  ): Promise<string | null> {
    const context = await this.getLinkMapContext(linkMapId);
    if (!context) {
      return null;
    }

    const normalizedPath = this.normalizePath(
      keyPath,
      context.caseSensitive,
    );

    if (context.queryMatch === 'ignore') {
      const entry = context.entriesByKey.get(normalizedPath);
      return entry?.destination ?? context.fallbackDestination ?? null;
    }

    const normalizedKey = this.buildNormalizedKeyFromParts(
      normalizedPath,
      query,
      context.caseSensitive,
    );

    if (context.queryMatch === 'exact') {
      const entry = context.entriesByKey.get(normalizedKey);
      return entry?.destination ?? context.fallbackDestination ?? null;
    }

    const entries = context.entriesByPath.get(normalizedPath) ?? [];
    if (entries.length === 0) {
      return context.fallbackDestination ?? null;
    }

    const requestQuery = this.normalizeQuery(query, context.caseSensitive);
    for (const entry of entries) {
      if (this.isQuerySubset(entry.query, requestQuery, context.caseSensitive)) {
        return entry.destination;
      }
    }

    return context.fallbackDestination ?? null;
  }

  private async getLinkMapContext(
    linkMapId: string,
  ): Promise<LinkMapContext | null> {
    const cacheKey = this.getLinkMapCacheKey(linkMapId);
    const cached = await this.cacheManagerService.getCustomCache<LinkMapContext | null>(
      cacheKey,
    );
    if (cached !== undefined) {
      return cached;
    }

    const map = await this.prisma.linkMap.findFirst({
      where: { id: linkMapId, deletedAt: null },
      include: { entries: { where: { deletedAt: null } } },
    });

    if (!map) {
      await this.cacheManagerService.setCustomCache(cacheKey, null, 60);
      return null;
    }

    const context = this.buildContext(map);
    await this.cacheManagerService.setCustomCache(
      cacheKey,
      context,
      LINK_MAP_CACHE_TTL_SECONDS,
    );
    return context;
  }

  private getLinkMapCacheKey(linkMapId: string): string {
    return `LINK_MAP_CONTEXT:${linkMapId}`;
  }

  private async invalidateLinkMapCache(linkMapId: string): Promise<void> {
    await this.cacheManagerService.invalidateCustomCache(
      this.getLinkMapCacheKey(linkMapId),
    );
  }

  private buildContext(map: {
    id: string;
    domainGroupId: string;
    caseSensitive: boolean;
    queryMatch: LinkMapQueryMatch;
    fallbackDestination: string | null;
    entries: Array<{
      id: string;
      key: string;
      keyNormalized: string;
      destination: string;
    }>;
  }): LinkMapContext {
    const entriesByKey = new Map<string, LinkMapEntryContext>();
    const entriesByPath = new Map<string, LinkMapEntryContext[]>();

    const entries = map.entries.map((entry) => {
      const { path, query } = this.parseKey(entry.key);
      const pathNormalized = this.normalizePath(path, map.caseSensitive);
      const entryContext: LinkMapEntryContext = {
        id: entry.id,
        key: entry.key,
        keyNormalized: entry.keyNormalized,
        destination: entry.destination,
        pathNormalized,
        query: this.normalizeQuery(query, map.caseSensitive),
      };

      entriesByKey.set(entry.keyNormalized, entryContext);

      const list = entriesByPath.get(pathNormalized) ?? [];
      list.push(entryContext);
      entriesByPath.set(pathNormalized, list);

      return entryContext;
    });

    for (const list of entriesByPath.values()) {
      list.sort(
        (a, b) => this.countQueryParams(b.query) - this.countQueryParams(a.query),
      );
    }

    return {
      id: map.id,
      domainGroupId: map.domainGroupId,
      caseSensitive: map.caseSensitive,
      queryMatch: map.queryMatch ?? 'ignore',
      fallbackDestination: map.fallbackDestination ?? null,
      entries,
      entriesByKey,
      entriesByPath,
    };
  }

  private countQueryParams(query: URLSearchParams): number {
    let count = 0;
    query.forEach(() => {
      count += 1;
    });
    return count;
  }

  private normalizeEntries(
    entries: Array<{ key: string; destination: string }>,
    caseSensitive: boolean,
    queryMatch: LinkMapQueryMatch,
  ): Array<{ key: string; keyNormalized: string; destination: string }> {
    const normalized: Array<{
      key: string;
      keyNormalized: string;
      destination: string;
    }> = [];
    const seen = new Set<string>();

    for (const entry of entries) {
      const key = entry.key.trim();
      if (!key) {
        return throwHttpException(
          new BadRequestError({
            requestId: this.clsService.getId(),
            details: 'Link map entry key cannot be empty.',
          }),
        );
      }
      const destination = entry.destination.trim();
      const { path, query } = this.parseKey(key);
      const pathNormalized = this.normalizePath(path, caseSensitive);
      const keyNormalized =
        queryMatch === 'ignore'
          ? pathNormalized
          : this.buildNormalizedKeyFromParts(
              pathNormalized,
              query,
              caseSensitive,
            );

      if (seen.has(keyNormalized)) {
        return throwHttpException(
          new BadRequestError({
            requestId: this.clsService.getId(),
            details: `Duplicate link map key detected: ${key}`,
          }),
        );
      }
      seen.add(keyNormalized);
      normalized.push({ key, keyNormalized, destination });
    }

    return normalized;
  }

  private parseKey(key: string): { path: string; query: URLSearchParams } {
    const normalized = key.startsWith('/') ? key : `/${key}`;
    const url = new URL(normalized, 'http://localhost');
    const path = url.pathname.startsWith('/')
      ? url.pathname.slice(1)
      : url.pathname;
    return { path, query: url.searchParams };
  }

  private normalizePath(path: string, caseSensitive: boolean): string {
    const trimmed = path.trim();
    if (!trimmed) return '';
    return caseSensitive ? trimmed : trimmed.toLowerCase();
  }

  private normalizeQuery(
    query: URLSearchParams,
    caseSensitive: boolean,
  ): URLSearchParams {
    const normalized = new URLSearchParams();
    for (const [key, value] of query.entries()) {
      const nextKey = caseSensitive ? key : key.toLowerCase();
      const nextValue = caseSensitive ? value : value.toLowerCase();
      normalized.append(nextKey, nextValue);
    }
    return normalized;
  }

  private buildNormalizedKeyFromParts(
    pathNormalized: string,
    query: URLSearchParams,
    caseSensitive: boolean,
  ): string {
    const normalizedQuery = this.normalizeQuery(query, caseSensitive);
    const queryMap = this.toQueryMap(normalizedQuery);
    const queryString = this.queryMapToString(queryMap);
    if (!queryString) {
      return pathNormalized;
    }
    return `${pathNormalized}?${queryString}`;
  }

  private toQueryMap(params: URLSearchParams): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for (const [key, value] of params.entries()) {
      const current = map.get(key);
      if (current) {
        current.push(value);
      } else {
        map.set(key, [value]);
      }
    }
    for (const values of map.values()) {
      values.sort();
    }
    return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }

  private queryMapToString(map: Map<string, string[]>): string {
    const parts: string[] = [];
    for (const [key, values] of map.entries()) {
      for (const value of values) {
        parts.push(`${key}=${value}`);
      }
    }
    return parts.join('&');
  }

  private isQuerySubset(
    expected: URLSearchParams,
    actual: URLSearchParams,
    caseSensitive: boolean,
  ): boolean {
    const expectedMap = this.toQueryMap(
      this.normalizeQuery(expected, caseSensitive),
    );
    const actualMap = this.toQueryMap(this.normalizeQuery(actual, caseSensitive));

    if (expectedMap.size === 0) {
      return true;
    }

    for (const [key, values] of expectedMap.entries()) {
      const actualValues = actualMap.get(key);
      if (!actualValues) {
        return false;
      }
      const remaining = [...actualValues];
      for (const value of values) {
        const index = remaining.indexOf(value);
        if (index === -1) {
          return false;
        }
        remaining.splice(index, 1);
      }
    }

    return true;
  }

  private async validateDestinations(
    destinations: string[],
    context: { organizationId: string; domainGroupId: string },
  ): Promise<void> {
    const extractedUrls = destinations
      .flatMap((destination) =>
        this.destinationExtractor.extractUrls(destination),
      )
      .filter(Boolean);

    if (extractedUrls.length === 0) {
      return;
    }

    let scanResults: Map<string, boolean>;
    try {
      scanResults = await this.safetyScannerService.checkUrls(extractedUrls);
    } catch (error) {
      this.logger.error('Link map safety scan failed', {
        organizationId: context.organizationId,
        domainGroupId: context.domainGroupId,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      return throwHttpException(
        new InternalServerError({
          requestId: this.clsService.getId(),
          details: 'Safety scan failed. Please try again later.',
        }),
      );
    }

    const unsafeUrls = extractedUrls.filter(
      (url) => scanResults.get(url) === false,
    );

    if (unsafeUrls.length > 0) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: `Unsafe destination domain detected: ${unsafeUrls.join(', ')}`,
        }),
      );
    }
  }
}
