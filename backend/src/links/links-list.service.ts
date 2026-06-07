import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { AggregatedLinkRow } from '@shared/models/links-list.model';
import { QueryResult } from '@shared/models/query-result.model';
import { DataType } from '../cache/cache-manager.service';
import { PrismaService } from '../prisma.service';
import { ListLinksQueryDto } from '../zod-schames/links.schemas';
import {
  buildShortPath,
  buildShortUrl,
  normalizeRuleSourcePath,
  resolveBestRuleByMapId,
  resolveFirstHostForDomainGroup,
  resolveSubdomainBaseHost,
  RoutingRuleCandidate,
} from './links-aggregation.util';

type LinkMapEntryRow = {
  id: string;
  key: string;
  destination: string;
  updatedAt: Date;
  linkMap: {
    id: string;
    name: string;
    domainGroupId: string;
  };
};

@Injectable()
export class LinksListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async list(
    organizationId: string,
    query: ListLinksQueryDto,
  ): Promise<QueryResult<AggregatedLinkRow>> {
    const where = this.buildWhere(organizationId, query);
    const startAfter = query.startAfterId
      ? await this.prisma.linkMapEntry.findFirst({
          where: { ...where, id: query.startAfterId },
          select: { id: true, updatedAt: true },
        })
      : null;

    const cursorWhere = startAfter
      ? this.applyCompositeCursor(where, startAfter)
      : where;

    const rows = await this.prisma.linkMapEntry.findMany({
      where: cursorWhere,
      take: query.limit + 1,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        key: true,
        destination: true,
        updatedAt: true,
        linkMap: {
          select: {
            id: true,
            name: true,
            domainGroupId: true,
          },
        },
      },
    });

    const hasMore = rows.length > query.limit;
    const pageRows = hasMore ? rows.slice(0, query.limit) : rows;

    const data = await this.aggregateRows(pageRows, organizationId);

    return new QueryResult<AggregatedLinkRow>({
      data,
      dataType: DataType.LINKS_LIST,
      moreStartingAfterId: hasMore ? pageRows[pageRows.length - 1]?.id : undefined,
    });
  }

  private buildWhere(
    organizationId: string,
    query: ListLinksQueryDto,
  ): Prisma.LinkMapEntryWhereInput {
    const where: Prisma.LinkMapEntryWhereInput = {
      deletedAt: null,
      linkMap: {
        deletedAt: null,
        ...(query.linkMapId ? { id: query.linkMapId } : {}),
        domainGroup: {
          organizationId,
          deletedAt: null,
          ...(query.domainGroupId ? { id: query.domainGroupId } : {}),
        },
      },
    };

    const trimmedSearch = query.search?.trim();
    if (trimmedSearch) {
      where.OR = [
        { key: { contains: trimmedSearch, mode: 'insensitive' } },
        { destination: { contains: trimmedSearch, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private applyCompositeCursor(
    where: Prisma.LinkMapEntryWhereInput,
    cursor: { id: string; updatedAt: Date },
  ): Prisma.LinkMapEntryWhereInput {
    return {
      AND: [
        where,
        {
          OR: [
            { updatedAt: { lt: cursor.updatedAt } },
            {
              updatedAt: cursor.updatedAt,
              id: { lt: cursor.id },
            },
          ],
        },
      ],
    };
  }

  private async aggregateRows(
    rows: LinkMapEntryRow[],
    organizationId: string,
  ): Promise<AggregatedLinkRow[]> {
    if (rows.length === 0) {
      return [];
    }

    const linkMapIds = [...new Set(rows.map((row) => row.linkMap.id))];
    const domainGroupIds = [...new Set(rows.map((row) => row.linkMap.domainGroupId))];

    const [redirectRules, subdomains, domains] = await Promise.all([
      this.prisma.redirectRule.findMany({
        where: {
          deletedAt: null,
          linkMapId: { in: linkMapIds },
          pathMatch: 'prefix',
          queryMatch: 'ignore',
          isBlocked: false,
          domainGroup: {
            organizationId,
            deletedAt: null,
          },
        },
        select: {
          id: true,
          linkMapId: true,
          source: true,
          pathMatch: true,
          queryMatch: true,
          isBlocked: true,
          priority: true,
          createdAt: true,
        },
      }),
      this.prisma.linkShiftSubdomain.findMany({
        where: {
          deletedAt: null,
          domainGroupId: { in: domainGroupIds },
          domainGroup: {
            organizationId,
            deletedAt: null,
          },
        },
        select: {
          name: true,
          domainGroupId: true,
        },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.domain.findMany({
        where: {
          deletedAt: null,
          domainGroupId: { in: domainGroupIds },
          domainGroup: {
            organizationId,
            deletedAt: null,
          },
        },
        select: {
          name: true,
          domainGroupId: true,
        },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
    ]);

    const bestRuleByMapId = resolveBestRuleByMapId(
      redirectRules as RoutingRuleCandidate[],
    );
    const subdomainBaseHost = this.resolveSubdomainBaseHostConfig();

    return rows.map((row) => {
      const routingRule = bestRuleByMapId[row.linkMap.id] ?? null;
      const sourcePath = routingRule
        ? normalizeRuleSourcePath(routingRule.source) ?? '/go'
        : '/go';
      const shortPath = buildShortPath(sourcePath, row.key);
      const host = resolveFirstHostForDomainGroup(
        row.linkMap.domainGroupId,
        subdomains,
        domains,
        subdomainBaseHost,
      );
      const shortUrl = host ? buildShortUrl(host, shortPath) : shortPath;

      return {
        id: row.id,
        domainGroupId: row.linkMap.domainGroupId,
        linkMapId: row.linkMap.id,
        linkMapName: row.linkMap.name,
        redirectRuleId: routingRule?.id ?? null,
        host,
        shortPath,
        shortUrls: [],
        shortUrl,
        key: row.key,
        destination: row.destination,
        updatedAt: row.updatedAt.toISOString(),
      };
    });
  }

  private resolveSubdomainBaseHostConfig(): string {
    const configuredBaseUrl =
      this.configService.get<string>('APP_SUBDOMAIN_BASE_URL') ??
      this.configService.get<string>('APP_BASE_URL') ??
      '';
    return resolveSubdomainBaseHost(configuredBaseUrl);
  }
}
