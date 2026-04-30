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
  CreateLinkMapEntryDto,
  DeleteLinkMapEntriesByIdDto,
  ImportLinkMapEntriesDto,
  ListLinkMapEntriesQueryDto,
  UpdateLinkMapDto,
  UpdateLinkMapEntryDto,
  UpsertLinkMapEntriesDto,
  DeleteLinkMapEntriesDto,
} from '../zod-schames/link-map.schemas';
import { CacheManagerService } from '../cache/cache-manager.service';
import { DestinationExtractorService } from '../security/destination-extractor.service';
import { SafetyScannerService } from '../security/safety-scanner.service';
import { Prisma } from '@prisma/client';

export type LinkMapQueryMatch = 'exact' | 'ignore' | 'subset';

type LinkMapEntryContext = {
  id: string;
  key: string;
  keyNormalized: string;
  destination: string;
  pathNormalized: string;
  query: URLSearchParams;
};

type LinkMapRawEntry = {
  id: string;
  key: string;
  keyNormalized: string;
  destination: string;
  pathNormalized: string;
  queryString: string;
};

type LinkMapRawData = {
  id: string;
  domainGroupId: string;
  caseSensitive: boolean;
  queryMatch: LinkMapQueryMatch;
  fallbackDestination: string | null;
  entries: LinkMapRawEntry[];
};

type LinkMapContext = {
  id: string;
  domainGroupId: string;
  caseSensitive: boolean;
  queryMatch: LinkMapQueryMatch;
  fallbackDestination: string | null;
  entriesByKey: Map<string, LinkMapEntryContext>;
  entriesByPath: Map<string, LinkMapEntryContext[]>;
};

type ImportLinkMapEntryError = {
  index: number;
  key: string;
  destination: string;
  error: string;
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
    const maps = await this.prisma.linkMap.findMany({
      where: {
        domainGroupId,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      include: {
        _count: {
          select: {
            entries: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return maps.map((map) => this.toLinkMapResponse(map));
  }

  async getMapById(organizationId: string, id: string) {
    const map = await this.prisma.linkMap.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      include: {
        _count: {
          select: {
            entries: {
              where: { deletedAt: null },
            },
          },
        },
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

    return this.toLinkMapResponse(map);
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

    await this.validateDestinations(
      [data.fallbackDestination].filter((value): value is string => Boolean(value)),
      {
        organizationId,
        domainGroupId: data.domainGroupId,
      },
    );

    const mapId = createCustomCuid(AppEntity.LinkMap, 32);

    const map = await this.prisma.linkMap.create({
      data: {
        id: mapId,
        name: data.name,
        domainGroupId: data.domainGroupId,
        caseSensitive: data.caseSensitive ?? false,
        queryMatch: data.queryMatch ?? 'ignore',
        fallbackDestination: data.fallbackDestination ?? null,
      },
      include: {
        _count: {
          select: {
            entries: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    await this.invalidateLinkMapCache(map.id);

    return this.toLinkMapResponse(map);
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

    if (existing.caseSensitive && data.caseSensitive === false) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details:
            'Changing case sensitivity from sensitive to insensitive is not allowed.',
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

    if (data.caseSensitive !== undefined || data.queryMatch !== undefined) {
      const existingEntries = existing.entries.map((entry) => ({
        id: entry.id,
        key: entry.key,
        destination: entry.destination,
      }));
      const normalized = this.normalizeEntries(
        existingEntries.map((entry) => ({
          key: entry.key,
          destination: entry.destination,
        })),
        nextCaseSensitive,
        nextQueryMatch,
      );

      await this.prisma.$transaction(async (tx) => {
        await tx.linkMap.update({
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
        });

        for (let index = 0; index < normalized.length; index += 1) {
          const normalizedEntry = normalized[index];
          const existingEntry = existingEntries[index];
          await tx.linkMapEntry.update({
            where: { id: existingEntry.id },
            data: {
              key: normalizedEntry.key,
              keyNormalized: normalizedEntry.keyNormalized,
              updatedAt: new Date(),
            },
          });
        }
      });
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

    const entriesCount = await this.prisma.linkMapEntry.count({
      where: {
        linkMapId: id,
        deletedAt: null,
      },
    });

    if (entriesCount > 0) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details:
            'Link map cannot be deleted while it contains entries. Remove all entries first.',
          relatedObjectParameter: 'linkMapId',
        }),
      );
    }

    const linkedRules = await this.prisma.redirectRule.count({
      where: {
        linkMapId: id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (linkedRules > 0) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Link map is assigned to redirect rules and cannot be deleted.',
          relatedObjectParameter: 'linkMapId',
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

  async listEntries(
    organizationId: string,
    query: ListLinkMapEntriesQueryDto,
  ): Promise<{
    data: Array<{
      id: string;
      linkMapId: string;
      key: string;
      destination: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    }>;
    hasMore: boolean;
    moreStartingAfterId?: string;
  }> {
    await this.ensureLinkMapAccess(organizationId, query.linkMapId);

    const where: Prisma.LinkMapEntryWhereInput = {
      linkMapId: query.linkMapId,
      deletedAt: null,
    };

    const trimmedSearch = query.search?.trim();
    if (trimmedSearch) {
      where.OR = [
        { key: { contains: trimmedSearch, mode: 'insensitive' } },
        { destination: { contains: trimmedSearch, mode: 'insensitive' } },
      ];
    }

    const startAfter = query.startAfterId
      ? await this.prisma.linkMapEntry.findFirst({
          where: { ...where, id: query.startAfterId },
          select: { id: true },
        })
      : null;

    const rows = await this.prisma.linkMapEntry.findMany({
      where,
      take: query.limit + 1,
      ...(startAfter
        ? {
            cursor: { id: startAfter.id },
            skip: 1,
          }
        : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const hasMore = rows.length > query.limit;
    const data = hasMore ? rows.slice(0, query.limit) : rows;

    return {
      data,
      hasMore,
      moreStartingAfterId: hasMore ? data[data.length - 1]?.id : undefined,
    };
  }

  async createEntry(organizationId: string, data: CreateLinkMapEntryDto) {
    const map = await this.ensureLinkMapAccess(organizationId, data.linkMapId, {
      id: true,
      caseSensitive: true,
      queryMatch: true,
      domainGroupId: true,
    });

    const normalized = this.normalizeEntries(
      [{ key: data.key, destination: data.destination }],
      map.caseSensitive,
      map.queryMatch as LinkMapQueryMatch,
    )[0];

    await this.validateDestinations([normalized.destination], {
      organizationId,
      domainGroupId: map.domainGroupId,
    });

    const existing = await this.prisma.linkMapEntry.findFirst({
      where: {
        linkMapId: map.id,
        keyNormalized: normalized.keyNormalized,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existing) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: `Duplicate link map key detected: ${normalized.key}`,
        }),
      );
    }

    await this.organizationService.checkLinkMapEntryLimit(
      organizationId,
      map.domainGroupId,
      1,
      map.id,
    );

    const entry = await this.prisma.linkMapEntry.create({
      data: {
        id: createCustomCuid(AppEntity.LinkMapEntry, 32),
        linkMapId: map.id,
        key: normalized.key,
        keyNormalized: normalized.keyNormalized,
        destination: normalized.destination,
      },
    });

    await this.invalidateLinkMapCache(map.id);
    return entry;
  }

  async getEntryById(organizationId: string, entryId: string) {
    const entry = await this.prisma.linkMapEntry.findFirst({
      where: {
        id: entryId,
        deletedAt: null,
        linkMap: {
          deletedAt: null,
          domainGroup: { organizationId, deletedAt: null },
        },
      },
    });

    if (!entry) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Link map entry with id ${entryId} not found`,
        }),
      );
    }

    return entry;
  }

  async updateEntry(
    organizationId: string,
    entryId: string,
    data: UpdateLinkMapEntryDto,
  ) {
    const existing = await this.prisma.linkMapEntry.findFirst({
      where: {
        id: entryId,
        deletedAt: null,
        linkMap: {
          deletedAt: null,
          domainGroup: { organizationId, deletedAt: null },
        },
      },
      include: {
        linkMap: {
          select: {
            id: true,
            caseSensitive: true,
            queryMatch: true,
            domainGroupId: true,
          },
        },
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Link map entry with id ${entryId} not found`,
        }),
      );
    }

    const normalized = this.normalizeEntries(
      [
        {
          key: data.key ?? existing.key,
          destination: data.destination ?? existing.destination,
        },
      ],
      existing.linkMap.caseSensitive,
      existing.linkMap.queryMatch as LinkMapQueryMatch,
    )[0];

    await this.validateDestinations([normalized.destination], {
      organizationId,
      domainGroupId: existing.linkMap.domainGroupId,
    });

    const duplicate = await this.prisma.linkMapEntry.findFirst({
      where: {
        linkMapId: existing.linkMapId,
        keyNormalized: normalized.keyNormalized,
        deletedAt: null,
        NOT: { id: existing.id },
      },
      select: { id: true },
    });
    if (duplicate) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: `Duplicate link map key detected: ${normalized.key}`,
        }),
      );
    }

    const updated = await this.prisma.linkMapEntry.update({
      where: { id: existing.id },
      data: {
        key: normalized.key,
        keyNormalized: normalized.keyNormalized,
        destination: normalized.destination,
      },
    });

    await this.invalidateLinkMapCache(existing.linkMapId);
    return updated;
  }

  async deleteEntry(organizationId: string, entryId: string) {
    const existing = await this.prisma.linkMapEntry.findFirst({
      where: {
        id: entryId,
        deletedAt: null,
        linkMap: {
          deletedAt: null,
          domainGroup: { organizationId, deletedAt: null },
        },
      },
      select: {
        id: true,
        linkMapId: true,
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Link map entry with id ${entryId} not found`,
        }),
      );
    }

    await this.prisma.linkMapEntry.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    await this.invalidateLinkMapCache(existing.linkMapId);
    return;
  }

  async deleteEntriesById(
    organizationId: string,
    data: DeleteLinkMapEntriesByIdDto,
  ) {
    await this.ensureLinkMapAccess(organizationId, data.linkMapId);

    const entryIds = [...new Set(data.entryIds)];
    const result = await this.prisma.linkMapEntry.updateMany({
      where: {
        linkMapId: data.linkMapId,
        id: { in: entryIds },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    if (result.count > 0) {
      await this.invalidateLinkMapCache(data.linkMapId);
    }

    return { deletedCount: result.count };
  }

  async importEntries(
    organizationId: string,
    payload: ImportLinkMapEntriesDto,
  ): Promise<{
    total: number;
    importedCount: number;
    failedCount: number;
    importedEntryIds: string[];
    errors: ImportLinkMapEntryError[];
  }> {
    const map = await this.ensureLinkMapAccess(organizationId, payload.linkMapId, {
      id: true,
      caseSensitive: true,
      queryMatch: true,
      domainGroupId: true,
    });

    const errors: ImportLinkMapEntryError[] = [];
    const seenInPayload = new Set<string>();
    const candidates: Array<{
      index: number;
      key: string;
      destination: string;
      keyNormalized: string;
    }> = [];

    payload.entries.forEach((entry, index) => {
      try {
        const normalized = this.normalizeEntries(
          [{ key: entry.key, destination: entry.destination }],
          map.caseSensitive,
          map.queryMatch as LinkMapQueryMatch,
        )[0];

        if (seenInPayload.has(normalized.keyNormalized)) {
          errors.push({
            index,
            key: entry.key,
            destination: entry.destination,
            error: 'Duplicate key in import payload.',
          });
          return;
        }
        seenInPayload.add(normalized.keyNormalized);
        candidates.push({
          index,
          key: normalized.key,
          destination: normalized.destination,
          keyNormalized: normalized.keyNormalized,
        });
      } catch (error) {
        errors.push({
          index,
          key: entry.key,
          destination: entry.destination,
          error: this.extractErrorMessage(error, 'Invalid entry.'),
        });
      }
    });

    const unsafeDestinations = await this.findUnsafeDestinations(
      candidates.map((entry) => entry.destination),
      {
        organizationId,
        domainGroupId: map.domainGroupId,
      },
    );

    const safeCandidates = candidates.filter((entry) => {
      if (!unsafeDestinations.has(entry.destination)) {
        return true;
      }
      errors.push({
        index: entry.index,
        key: entry.key,
        destination: entry.destination,
        error: 'Unsafe destination domain detected.',
      });
      return false;
    });

    const existingKeys = await this.prisma.linkMapEntry.findMany({
      where: {
        linkMapId: map.id,
        deletedAt: null,
        keyNormalized: {
          in: safeCandidates.map((entry) => entry.keyNormalized),
        },
      },
      select: { keyNormalized: true },
    });
    const existingSet = new Set(existingKeys.map((entry) => entry.keyNormalized));

    const toCreate = safeCandidates.filter((entry) => {
      if (!existingSet.has(entry.keyNormalized)) {
        return true;
      }
      errors.push({
        index: entry.index,
        key: entry.key,
        destination: entry.destination,
        error: 'Key already exists in this link map.',
      });
      return false;
    });

    const importedEntryIds: string[] = [];
    for (const entry of toCreate) {
      try {
        await this.organizationService.checkLinkMapEntryLimit(
          organizationId,
          map.domainGroupId,
          1,
          map.id,
        );
        const created = await this.prisma.linkMapEntry.create({
          data: {
            id: createCustomCuid(AppEntity.LinkMapEntry, 32),
            linkMapId: map.id,
            key: entry.key,
            keyNormalized: entry.keyNormalized,
            destination: entry.destination,
          },
        });
        importedEntryIds.push(created.id);
      } catch (error) {
        errors.push({
          index: entry.index,
          key: entry.key,
          destination: entry.destination,
          error: this.extractErrorMessage(error, 'Unable to import this entry.'),
        });
      }
    }

    if (importedEntryIds.length > 0) {
      await this.invalidateLinkMapCache(map.id);
    }

    return {
      total: payload.entries.length,
      importedCount: importedEntryIds.length,
      failedCount: errors.length,
      importedEntryIds,
      errors: errors.sort((left, right) => left.index - right.index),
    };
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

    const normalizedPath = this.normalizePath(keyPath, context.caseSensitive);

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
      if (
        this.isQuerySubset(entry.query, requestQuery, context.caseSensitive)
      ) {
        return entry.destination;
      }
    }

    return context.fallbackDestination ?? null;
  }

  private async ensureLinkMapAccess(
    organizationId: string,
    linkMapId: string,
    select?: Prisma.LinkMapSelect,
  ): Promise<any> {
    const map = await this.prisma.linkMap.findFirst({
      where: {
        id: linkMapId,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      select: select ?? { id: true },
    });

    if (!map) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Link map with id ${linkMapId} not found`,
        }),
      );
    }

    return map;
  }

  private toLinkMapResponse(map: any): any {
    const { _count, ...rest } = map ?? {};
    return {
      ...rest,
      entriesCount: _count?.entries ?? 0,
    };
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object') {
      const maybeError = error as {
        message?: string;
        response?: unknown;
        getResponse?: () => unknown;
      };

      const response =
        typeof maybeError.getResponse === 'function'
          ? maybeError.getResponse()
          : maybeError.response;

      if (typeof response === 'string' && response.trim()) {
        return response;
      }

      if (response && typeof response === 'object') {
        const details = (response as Record<string, unknown>).details;
        if (typeof details === 'string' && details.trim()) {
          return details;
        }
        const message = (response as Record<string, unknown>).message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }

      if (typeof maybeError.message === 'string' && maybeError.message.trim()) {
        return maybeError.message;
      }
    }

    return fallback;
  }

  private async findUnsafeDestinations(
    destinations: string[],
    context: { organizationId: string; domainGroupId: string },
  ): Promise<Set<string>> {
    const uniqueDestinations = [...new Set(destinations)];
    const destinationToUrls = new Map<string, string[]>();
    const allUrls: string[] = [];

    for (const destination of uniqueDestinations) {
      const urls = this.destinationExtractor
        .extractUrls(destination)
        .filter(Boolean);
      destinationToUrls.set(destination, urls);
      allUrls.push(...urls);
    }

    if (allUrls.length === 0) {
      return new Set<string>();
    }

    let scanResults: Map<string, boolean>;
    try {
      scanResults = await this.safetyScannerService.checkUrls([
        ...new Set(allUrls),
      ]);
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

    const unsafeDestinations = new Set<string>();
    for (const [destination, urls] of destinationToUrls.entries()) {
      if (urls.some((url) => scanResults.get(url) === false)) {
        unsafeDestinations.add(destination);
      }
    }

    return unsafeDestinations;
  }

  private async getLinkMapContext(
    linkMapId: string,
  ): Promise<LinkMapContext | null> {
    const cacheKey = this.getLinkMapCacheKey(linkMapId);
    const cached =
      await this.cacheManagerService.getCustomCache<LinkMapRawData | null>(
        cacheKey,
      );
    if (cached !== undefined) {
      return cached ? this.buildContext(cached) : null;
    }

    const map = await this.prisma.linkMap.findFirst({
      where: { id: linkMapId, deletedAt: null },
      include: { entries: { where: { deletedAt: null } } },
    });

    if (!map) {
      await this.cacheManagerService.setCustomCache(cacheKey, null, 60);
      return null;
    }

    const rawData = this.buildRawData(map);
    await this.cacheManagerService.setCustomCache(
      cacheKey,
      rawData,
      LINK_MAP_CACHE_TTL_SECONDS,
    );
    return this.buildContext(rawData);
  }

  private getLinkMapCacheKey(linkMapId: string): string {
    return `LINK_MAP_CONTEXT:${linkMapId}`;
  }

  private async invalidateLinkMapCache(linkMapId: string): Promise<void> {
    await this.cacheManagerService.invalidateCustomCache(
      this.getLinkMapCacheKey(linkMapId),
    );
  }

  private buildRawData(map: {
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
  }): LinkMapRawData {
    const entries = map.entries.map((entry) => {
      const { path, query } = this.parseKey(entry.key);
      const pathNormalized = this.normalizePath(path, map.caseSensitive);
      const normalizedQuery = this.normalizeQuery(query, map.caseSensitive);
      return {
        id: entry.id,
        key: entry.key,
        keyNormalized: entry.keyNormalized,
        destination: entry.destination,
        pathNormalized,
        queryString: normalizedQuery.toString(),
      };
    });

    return {
      id: map.id,
      domainGroupId: map.domainGroupId,
      caseSensitive: map.caseSensitive,
      queryMatch: map.queryMatch ?? 'ignore',
      fallbackDestination: map.fallbackDestination ?? null,
      entries,
    };
  }

  private buildContext(rawData: LinkMapRawData): LinkMapContext {
    const entriesByKey = new Map<string, LinkMapEntryContext>();
    const entriesByPath = new Map<string, LinkMapEntryContext[]>();

    for (const entry of rawData.entries) {
      const entryContext: LinkMapEntryContext = {
        id: entry.id,
        key: entry.key,
        keyNormalized: entry.keyNormalized,
        destination: entry.destination,
        pathNormalized: entry.pathNormalized,
        query: new URLSearchParams(entry.queryString),
      };

      entriesByKey.set(entry.keyNormalized, entryContext);

      const list = entriesByPath.get(entry.pathNormalized);
      if (list) {
        list.push(entryContext);
      } else {
        entriesByPath.set(entry.pathNormalized, [entryContext]);
      }
    }

    for (const list of entriesByPath.values()) {
      list.sort(
        (a, b) =>
          this.countQueryParams(b.query) - this.countQueryParams(a.query),
      );
    }

    return {
      id: rawData.id,
      domainGroupId: rawData.domainGroupId,
      caseSensitive: rawData.caseSensitive,
      queryMatch: rawData.queryMatch ?? 'ignore',
      fallbackDestination: rawData.fallbackDestination ?? null,
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
      if (/^https?:\/\//i.test(key)) {
        return throwHttpException(
          new BadRequestError({
            requestId: this.clsService.getId(),
            details: 'Link map entry key must be a path/query value, not a full URL.',
          }),
        );
      }
      const destination = entry.destination.trim();
      const { path, query } = this.parseKey(key);
      const pathNormalized = this.normalizePath(path, caseSensitive);
      const keyNormalized = this.buildNormalizedKeyFromParts(
        pathNormalized,
        query,
        caseSensitive,
        queryMatch,
      );
      const keyPersisted = this.buildPersistedKeyFromParts(
        pathNormalized,
        query,
        caseSensitive,
        queryMatch,
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
      normalized.push({ key: keyPersisted, keyNormalized, destination });
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
    queryMatch: LinkMapQueryMatch = 'exact',
  ): string {
    if (queryMatch === 'ignore') {
      return pathNormalized;
    }
    const normalizedQuery = this.normalizeQuery(query, caseSensitive);
    const queryMap = this.toQueryMap(normalizedQuery);
    const queryString = this.queryMapToString(queryMap);
    if (!queryString) {
      return pathNormalized;
    }
    return `${pathNormalized}?${queryString}`;
  }

  private buildPersistedKeyFromParts(
    pathNormalized: string,
    query: URLSearchParams,
    caseSensitive: boolean,
    queryMatch: LinkMapQueryMatch,
  ): string {
    if (queryMatch === 'ignore') {
      return pathNormalized;
    }
    return this.buildNormalizedKeyFromParts(
      pathNormalized,
      query,
      caseSensitive,
      queryMatch,
    );
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
    const actualMap = this.toQueryMap(
      this.normalizeQuery(actual, caseSensitive),
    );

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
    const unsafeDestinations = await this.findUnsafeDestinations(
      destinations,
      context,
    );
    if (unsafeDestinations.size === 0) {
      return;
    }

    return throwHttpException(
      new BadRequestError({
        requestId: this.clsService.getId(),
        details: `Unsafe destination domain detected: ${[
          ...unsafeDestinations,
        ].join(', ')}`,
      }),
    );
  }
}
