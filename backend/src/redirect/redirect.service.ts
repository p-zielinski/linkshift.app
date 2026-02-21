import express, { Request } from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PrismaService } from '../prisma.service';
import { HttpException, Injectable } from '@nestjs/common';
import { RuleValidatorService } from '../rule-validator/rule-validator.service';
import {
  CreateRedirectRuleDto,
  TopRedirectRulesQueryDto,
  UpdateRedirectRuleDto,
} from '../zod-schames/redirect-rule.schemas';
import {
  CreateDomainDto,
  UpdateDomainDto,
} from '../zod-schames/domain.schemas';
import {
  CreateDomainGroupDto,
  UpdateDomainGroupDto,
} from '../zod-schames/domain-group.schemas';
import { AppEntity, createCustomCuid, throwHttpException } from '../utils';
import { OrganizationService } from '../organization/organization.service';
import { REDIRECT_ENGINE_LIMITS } from '../constants';
import { HttpMethod, Prisma } from '@prisma/client';
import {
  CachedByProperty,
  CacheManagerService,
  DataType,
} from '../cache/cache-manager.service';
import { OrganizationConfiguration } from '@shared/models/organization-config.model';
import { Domain, DomainGroup, Organization } from '@shared/prisma-client';
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { QueryResult } from '@shared/models/query-result.model';
import { DestinationExtractorService } from '../security/destination-extractor.service';
import { SafetyScannerService } from '../security/safety-scanner.service';
import { DomainBlacklistService } from '../security/domain-blacklist.service';
import { RedirectAnalyticsService } from '../security/redirect-analytics.service';
import { Logger } from 'nestjs-pino';
import { LinkMapService } from '../link-map/link-map.service';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Define the structure of the domain context query using Prisma.validator.
 * This ensures the type stays in sync with the actual 'include' logic.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const domainWithRelations = Prisma.validator<Prisma.DomainDefaultArgs>()({
  include: {
    domainGroup: {
      include: {
        redirectRules: {
          where: {
            deletedAt: null,
            isBlocked: false,
          },
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        },
      },
    },
  },
});

/**
 * Extract the return type of the query.
 */
export type DomainWithRelationsContext = Prisma.DomainGetPayload<
  typeof domainWithRelations
>;

export enum InvalidationTargetType {
  HOSTNAME = 'hostname',
  DOMAIN_ID = 'domainId',
  DOMAIN_GROUP_ID = 'domainGroupId',
}

/**
 * Explicit targets for cache invalidation to avoid ambiguous logic.
 */
type CacheInvalidationTarget =
  | { type: InvalidationTargetType.HOSTNAME; value: string }
  | { type: InvalidationTargetType.DOMAIN_ID; value: string }
  | { type: InvalidationTargetType.DOMAIN_GROUP_ID; value: string };

export interface RedirectRule {
  id?: string;
  source: string | RegExp;
  destination: string;
  statusCode?: number;
  matchMethod?: HttpMethod[];
  queryMatch?: 'exact' | 'ignore' | 'subset';
  pathMatch?: 'exact' | 'prefix';
  linkMapId?: string | null;
}

type RedirectSimulationEntry = {
  domainGroupId: string;
  hostname?: string;
  path: string;
  method?: HttpMethod;
  protocol?: 'http' | 'https';
  ip?: string;
  userAgent?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | string[] | number | boolean>;
};

type RedirectSimulationResult = {
  index: number;
  domainGroupId: string;
  method: string;
  path: string;
  hostname: string;
  matched: boolean;
  statusCode: number;
  target: string | null;
};

type Manipulator = (val: string) => string;

const ALLOWED_MATCH_METHODS = new Set<string>(Object.values(HttpMethod));
const CADDY_DOMAIN_CACHE_TTL_SECONDS = 5 * 60;

@Injectable()
export class RedirectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleValidator: RuleValidatorService,
    private readonly organizationService: OrganizationService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly clsService: ClsService,
    private readonly destinationExtractor: DestinationExtractorService,
    private readonly safetyScannerService: SafetyScannerService,
    private readonly domainBlacklistService: DomainBlacklistService,
    private readonly redirectAnalyticsService: RedirectAnalyticsService,
    private readonly linkMapService: LinkMapService,
    private readonly logger: Logger,
  ) {}

  /**
   * Invalidates the redirect context cache based on a specific target.
   */
  private async invalidateDomainCache(
    target: CacheInvalidationTarget,
  ): Promise<void> {
    try {
      const hostnamesToInvalidate: string[] = [];

      switch (target.type) {
        case InvalidationTargetType.HOSTNAME: {
          hostnamesToInvalidate.push(target.value);
          break;
        }

        case InvalidationTargetType.DOMAIN_ID: {
          const domain = await this.prisma.domain.findUnique({
            where: { id: target.value },
            select: { name: true },
          });
          if (domain) {
            hostnamesToInvalidate.push(domain.name);
          }
          break;
        }

        case InvalidationTargetType.DOMAIN_GROUP_ID: {
          const domains = await this.prisma.domain.findMany({
            where: { domainGroupId: target.value, deletedAt: null },
            select: { name: true },
          });
          hostnamesToInvalidate.push(...domains.map((d) => d.name));
          break;
        }
      }

      if (hostnamesToInvalidate.length > 0) {
        const uniqueHostnames = [...new Set(hostnamesToInvalidate)];

        await Promise.all(
          uniqueHostnames.map((name) =>
            this.cacheManagerService.invalidateRedirectContext(name),
          ),
        );
        await Promise.all(
          uniqueHostnames.map((name) => this.invalidateCaddyDomainCache(name)),
        );

        this.logger.debug('Invalidated domain caches', {
          hostnames: uniqueHostnames,
        });
      }
    } catch (error) {
      this.logger.error('Cache invalidation failed', {
        targetType: target.type,
        targetValue: target.value,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
    }
  }

  private normalizeHostname(value: string | undefined | null): string {
    if (!value) return '';
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return '';
    const withoutPort = trimmed.split(':')[0] ?? '';
    return withoutPort.replace(/\.$/, '');
  }

  private getCaddyDomainCacheKey(hostname: string): string {
    return `CADDY_DOMAIN_ALLOWED:${hostname}`;
  }

  private async invalidateCaddyDomainCache(hostname: string): Promise<void> {
    const normalized = this.normalizeHostname(hostname);
    if (!normalized) return;
    const cacheKey = this.getCaddyDomainCacheKey(normalized);
    await this.cacheManagerService.invalidateCustomCache(cacheKey);
  }

  async isDomainAllowed(hostname: string): Promise<boolean> {
    const normalized = this.normalizeHostname(hostname);
    const requestId = this.clsService.getId();
    this.logger.debug('Caddy domain allow check start', {
      requestId,
      hostname,
      normalized,
    });
    if (!normalized) {
      this.logger.warn('Caddy domain allow check invalid hostname', {
        requestId,
        hostname,
      });
      return false;
    }

    const cacheKey = this.getCaddyDomainCacheKey(normalized);
    const cached =
      await this.cacheManagerService.getCustomCache<boolean>(cacheKey);
    if (cached !== undefined) {
      this.logger.debug('Caddy domain allow check cache hit', {
        requestId,
        normalized,
        allowed: cached,
        cacheKey,
      });
      return cached;
    }
    this.logger.debug('Caddy domain allow check cache miss', {
      requestId,
      normalized,
      cacheKey,
    });

    const domain = await this.prisma.domain.findFirst({
      where: {
        name: normalized,
        deletedAt: null,
        domainGroup: { deletedAt: null },
      },
      select: { id: true },
    });

    const allowed = !!domain;
    this.logger.debug('Caddy domain allow check db lookup', {
      requestId,
      normalized,
      allowed,
      domainId: domain?.id ?? null,
    });
    await this.cacheManagerService.setCustomCache(
      cacheKey,
      allowed,
      CADDY_DOMAIN_CACHE_TTL_SECONDS,
    );
    this.logger.debug('Caddy domain allow check cache set', {
      requestId,
      normalized,
      allowed,
      cacheKey,
      ttlSeconds: CADDY_DOMAIN_CACHE_TTL_SECONDS,
    });
    return allowed;
  }

  // --- Management Methods (CRUD) ---

  async listDomains(organizationId: string): Promise<QueryResult<Domain>> {
    const domains = await this.prisma.domain.findMany({
      where: {
        deletedAt: null,
        domainGroup: {
          organizationId,
          deletedAt: null,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return new QueryResult<Domain>({
      data: domains,
      dataType: DataType.DOMAINS,
    });
  }

  async getDomainById(id: string, organizationId: string) {
    const domain = await this.prisma.domain.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
      include: { domainGroup: true },
    });

    if (!domain) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }
    return domain;
  }

  async createDomain(organizationId: string, data: CreateDomainDto) {
    await this.organizationService.checkDomainLimit(
      organizationId,
      data.domainGroupId,
    );
    // 1. Verify domain group exists and belongs to organization
    const domainGroup = await this.prisma.domainGroup.findFirst({
      where: {
        id: data.domainGroupId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!domainGroup) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain group with id ${data.domainGroupId} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    // 2. Check duplicate name
    const existing = await this.prisma.domain.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existing) {
      return throwHttpException(
        new ConflictError({
          details: `Domain name ${data.name} already exists`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    // 3. Create
    let domain: Domain;
    try {
      domain = await this.prisma.domain.create({
        data: {
          id: createCustomCuid(AppEntity.Domain),
          name: data.name,
          domainGroupId: data.domainGroupId,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return throwHttpException(
          new ConflictError({
            details: `Domain name ${data.name} already exists`,
            requestId: this.clsService.getId(),
          }),
        );
      }
      throw error;
    }

    await this.invalidateDomainCache({
      type: InvalidationTargetType.HOSTNAME,
      value: domain.name,
    });
    return domain;
  }

  async updateDomain(
    id: string,
    organizationId: string,
    data: UpdateDomainDto,
  ) {
    // 1. Verify domain exists
    const existing = await this.prisma.domain.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    // 2. Check duplicates if name changes
    if (data.name && data.name !== existing.name) {
      const duplicate = await this.prisma.domain.findFirst({
        where: {
          name: data.name,
          deletedAt: null,
        },
      });

      if (duplicate) {
        return throwHttpException(
          new ConflictError({
            details: `Domain name ${data.name} already exists`,
            requestId: this.clsService.getId(),
          }),
        );
      }
    }

    // 3. Verify new group if changing
    if (data.domainGroupId) {
      const newDomainGroup = await this.prisma.domainGroup.findFirst({
        where: {
          id: data.domainGroupId,
          organizationId,
          deletedAt: null,
        },
      });

      if (!newDomainGroup) {
        return throwHttpException(
          new NotFoundError({
            details: `Domain group with id ${data.domainGroupId} not found`,
            requestId: this.clsService.getId(),
          }),
        );
      }
    }

    // 4. Update
    let domain: Domain;
    try {
      domain = await this.prisma.domain.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const attemptedName = data.name ?? existing.name;
        return throwHttpException(
          new ConflictError({
            details: `Domain name ${attemptedName} already exists`,
            requestId: this.clsService.getId(),
          }),
        );
      }
      throw error;
    }

    // We invalidate both in case name changed
    await this.invalidateDomainCache({
      type: InvalidationTargetType.HOSTNAME,
      value: domain.name,
    });
    if (existing.name !== domain.name) {
      await this.invalidateDomainCache({
        type: InvalidationTargetType.HOSTNAME,
        value: existing.name,
      });
    }
    return domain;
  }

  async deleteDomain(id: string, organizationId: string): Promise<void> {
    const existing = await this.prisma.domain.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    await this.prisma.domain.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.invalidateDomainCache({
      type: InvalidationTargetType.HOSTNAME,
      value: existing.name,
    });
    return;
  }

  async listDomainGroups(organizationId: string) {
    const domainGroups = await this.prisma.domainGroup.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new QueryResult<DomainGroup>({
      data: domainGroups,
      dataType: DataType.DOMAIN_GROUPS,
    });
  }

  async getDomainGroupById(id: string, organizationId: string) {
    const domainGroup = await this.prisma.domainGroup.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!domainGroup) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain group with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }
    return domainGroup;
  }

  async createDomainGroup(organizationId: string, data: CreateDomainGroupDto) {
    await this.organizationService.checkDomainGroupLimit(organizationId);

    return this.prisma.domainGroup.create({
      data: {
        id: createCustomCuid(AppEntity.DomainGroup),
        name: data.name,
        organizationId,
      },
    });
  }

  async updateDomainGroup(
    id: string,
    organizationId: string,
    data: UpdateDomainGroupDto,
  ) {
    // 1. Verify existence
    const existing = await this.prisma.domainGroup.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain group with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    // 2. Update
    return this.prisma.domainGroup.update({
      where: { id },
      data: {
        name: data.name,
        updatedAt: new Date(),
      },
    });
  }

  async deleteDomainGroup(id: string, organizationId: string) {
    const existing = await this.prisma.domainGroup.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain group with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    await this.prisma.domainGroup.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return;
  }

  async listRules(
    organizationId: string,
    domainGroupId: string,
    params?: { limit?: number; search?: string; startAfterId?: string },
  ) {
    const { limit = 20, search, startAfterId } = params || {};
    const take = Number(limit);

    const where: Prisma.RedirectRuleWhereInput = {
      deletedAt: null,
      domainGroupId,
      domainGroup: {
        organizationId,
        deletedAt: null,
      },
    };

    if (search) {
      where.OR = [
        { source: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
      ];
    }

    const startAfter = startAfterId
      ? await this.prisma.redirectRule.findFirst({
          where: {
            ...where,
            id: startAfterId,
          },
          select: { id: true, priority: true, createdAt: true },
        })
      : null;

    const rows = await this.prisma.redirectRule.findMany({
      where,
      take: take + 1,
      ...(startAfter
        ? {
            cursor: {
              priority_createdAt_id: {
                priority: startAfter.priority,
                createdAt: startAfter.createdAt,
                id: startAfter.id,
              },
            },
            skip: 1,
          }
        : {}),
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    });

    const hasMore = rows.length > take;
    const data = hasMore ? rows.slice(0, take) : rows;

    const nextAfterId = hasMore ? data[data.length - 1]?.id : undefined;

    return new QueryResult<RedirectRule>({
      data,
      dataType: DataType.REDIRECT_RULES,
      moreStartingAfterId: nextAfterId,
    });
  }

  async getTopRules(
    organizationId: string,
    query: TopRedirectRulesQueryDto,
  ) {
    const boundedLimit = Number.isFinite(query.limit)
      ? Math.min(Math.max(query.limit, 1), 50)
      : 50;

    if (query.start && query.end) {
      return this.getTopRulesFromHourlyAggregates(
        organizationId,
        boundedLimit,
        query.start,
        query.end,
      );
    }

    const topHits =
      await this.redirectAnalyticsService.getTopRulesForOrganization(
        organizationId,
        boundedLimit,
        this.resolveTopRulesWindow(query.range ?? 'day'),
      );

    const ruleIds = topHits.map((entry) => entry.ruleId);
    if (ruleIds.length === 0) {
      return { data: [] };
    }

    const rules = await this.prisma.redirectRule.findMany({
      where: {
        id: { in: ruleIds },
        deletedAt: null,
        isBlocked: false,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    const ruleMap = new Map(rules.map((rule) => [rule.id, rule]));
    const data = topHits
      .map((entry) => {
        const rule = ruleMap.get(entry.ruleId);
        if (!rule) return null;
        return {
          rule,
          hits: entry.hits,
        };
      })
      .filter(
        (entry): entry is { rule: (typeof rules)[number]; hits: number } =>
          Boolean(entry),
      );

    return { data };
  }

  private async getTopRulesFromHourlyAggregates(
    organizationId: string,
    limit: number,
    start: Date,
    end: Date,
  ) {
    const range = this.normalizeHourlyRange(start, end);
    const topHits = await this.prisma.redirectRuleHitsHourly.groupBy({
      by: ['ruleId'],
      where: {
        organizationId,
        bucketStart: {
          gte: range.start,
          lte: range.end,
        },
      },
      _sum: { hits: true },
      orderBy: {
        _sum: { hits: 'desc' },
      },
      take: limit,
    });

    const ruleIds = topHits.map((entry) => entry.ruleId);
    if (ruleIds.length === 0) {
      return { data: [] };
    }

    const rules = await this.prisma.redirectRule.findMany({
      where: {
        id: { in: ruleIds },
        deletedAt: null,
        isBlocked: false,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    const ruleMap = new Map(rules.map((rule) => [rule.id, rule]));
    const data = topHits
      .map((entry) => {
        const rule = ruleMap.get(entry.ruleId);
        if (!rule) return null;
        return {
          rule,
          hits: entry._sum.hits ?? 0,
        };
      })
      .filter(
        (entry): entry is { rule: (typeof rules)[number]; hits: number } =>
          Boolean(entry),
      );

    return { data };
  }

  private normalizeHourlyRange(start: Date, end: Date): {
    start: Date;
    end: Date;
  } {
    const startHour = dayjs(start).utc().startOf('hour');
    const endHour = dayjs(end).utc().startOf('hour');
    if (endHour.isBefore(startHour)) {
      throwHttpException(
        new BadRequestError({
          details: 'Start must be before end',
          requestId: this.clsService.getId(),
        }),
      );
    }
    return { start: startHour.toDate(), end: endHour.toDate() };
  }

  private resolveTopRulesWindow(range: string): number {
    const normalized = range?.toLowerCase?.() ?? 'day';
    switch (normalized) {
      case 'week':
        return 24 * 7;
      case 'month':
        return 24 * 30;
      case 'day':
      default:
        return 24;
    }
  }

  async getRuleById(id: string, organizationId: string) {
    const rule = await this.prisma.redirectRule.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!rule) {
      return throwHttpException(
        new NotFoundError({
          details: `Redirect rule with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }
    return rule;
  }

  async createRule(organizationId: string, data: CreateRedirectRuleDto) {
    // 1. Check limits
    await this.organizationService.checkRedirectRuleLimit(
      organizationId,
      data.domainGroupId,
    );
    // 2. Verify domain group
    const domainGroup = await this.prisma.domainGroup.findFirst({
      where: {
        id: data.domainGroupId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!domainGroup) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain group with id ${data.domainGroupId} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    // 3. Validate logic
    const validationResult = this.ruleValidator.validate(
      data.source,
      data.destination,
    );
    if (!validationResult.isValid) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Rule validation failed',
          errors: {
            details: validationResult.errors,
          },
        }),
      );
    }

    await this.validateDestinationSafety(data.destination, {
      organizationId,
      domainGroupId: data.domainGroupId,
    });

    await this.validateLinkMapRule({
      organizationId,
      domainGroupId: data.domainGroupId,
      linkMapId: data.linkMapId ?? null,
      source: data.source,
      pathMatch: data.pathMatch,
      queryMatch: data.queryMatch,
    });

    // 4. Create
    const matchMethod = this.normalizeMatchMethods(data.matchMethod);
    const rule = await this.prisma.redirectRule.create({
      data: {
        id: createCustomCuid(AppEntity.RedirectRule, 32),
        source: data.source,
        destination: data.destination,
        statusCode: data.statusCode,
        matchMethod,
        queryMatch: data.queryMatch ?? 'exact',
        pathMatch: data.pathMatch ?? 'exact',
        linkMapId: data.linkMapId ?? null,
        priority: data.priority,
        domainGroupId: data.domainGroupId,
      },
    });

    await this.invalidateDomainCache({
      type: InvalidationTargetType.DOMAIN_GROUP_ID,
      value: data.domainGroupId,
    });
    return rule;
  }

  async updateRule(
    id: string,
    organizationId: string,
    data: UpdateRedirectRuleDto,
  ) {
    // 1. Verify existence
    const existing = await this.prisma.redirectRule.findFirst({
      where: {
        id,
        deletedAt: null,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          details: `Redirect rule with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    // 2. Validate logic if fields changed
    const sourceToValidate = data.source ?? existing.source;
    const destinationToValidate = data.destination ?? existing.destination;

    const validationResult = this.ruleValidator.validate(
      sourceToValidate,
      destinationToValidate,
    );
    if (!validationResult.isValid) {
      return throwHttpException(
        new BadRequestError({
          details: 'Rule validation failed',
          errors: {
            details: validationResult.errors,
          },
          requestId: this.clsService.getId(),
        }),
      );
    }

    await this.validateDestinationSafety(destinationToValidate, {
      ruleId: existing.id,
      organizationId,
      domainGroupId: existing.domainGroupId,
    });

    await this.validateLinkMapRule({
      organizationId,
      domainGroupId: existing.domainGroupId,
      linkMapId:
        data.linkMapId !== undefined ? data.linkMapId : existing.linkMapId,
      source: data.source ?? existing.source,
      pathMatch: data.pathMatch ?? existing.pathMatch,
      queryMatch: data.queryMatch ?? existing.queryMatch,
    });

    // 3. Update
    const updateData: Prisma.RedirectRuleUpdateInput = {
      updatedAt: new Date(),
      isBlocked: false,
      blockedAt: null,
    };

    if (data.source !== undefined) {
      updateData.source = data.source;
    }
    if (data.destination !== undefined) {
      updateData.destination = data.destination;
    }
    if (data.statusCode !== undefined) {
      updateData.statusCode = data.statusCode;
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }
    if (data.matchMethod !== undefined) {
      updateData.matchMethod = this.normalizeMatchMethods(data.matchMethod);
    }
    if (data.queryMatch !== undefined) {
      updateData.queryMatch = data.queryMatch;
    }
    if (data.pathMatch !== undefined) {
      updateData.pathMatch = data.pathMatch;
    }
    if (data.linkMapId !== undefined) {
      updateData.linkMap =
        data.linkMapId === null
          ? { disconnect: true }
          : { connect: { id: data.linkMapId } };
    }

    const rule = await this.prisma.redirectRule.update({
      where: { id },
      data: updateData,
    });

    await this.invalidateDomainCache({
      type: InvalidationTargetType.DOMAIN_GROUP_ID,
      value: rule.domainGroupId,
    });
    return rule;
  }

  async deleteRule(id: string, organizationId: string) {
    const existing = await this.prisma.redirectRule.findFirst({
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
          details: `Redirect rule with id ${id} not found`,
        }),
      );
    }

    const rule = await this.prisma.redirectRule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.invalidateDomainCache({
      type: InvalidationTargetType.DOMAIN_GROUP_ID,
      value: rule.domainGroupId,
    });
    return;
  }

  private async validateDestinationSafety(
    destination: string,
    context: { ruleId?: string; organizationId: string; domainGroupId: string },
  ): Promise<void> {
    const extractedUrls = this.destinationExtractor.extractUrls(destination);

    this.logger.debug('Redirect rule domains extracted', {
      ruleId: context.ruleId ?? null,
      organizationId: context.organizationId,
      domainGroupId: context.domainGroupId,
      extractedDomains: extractedUrls,
    });

    if (extractedUrls.length === 0) {
      return;
    }

    let scanResults: Map<string, boolean>;
    try {
      scanResults = await this.safetyScannerService.checkUrls(extractedUrls);
    } catch (error) {
      this.logger.error('Redirect rule safety scan failed', {
        ruleId: context.ruleId ?? null,
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
      this.logger.warn('Redirect rule blocked by unsafe domain', {
        ruleId: context.ruleId ?? null,
        organizationId: context.organizationId,
        domainGroupId: context.domainGroupId,
        unsafeDomains: unsafeUrls,
        extractedDomains: extractedUrls,
      });
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: `Unsafe destination domain detected: ${unsafeUrls.join(
            ', ',
          )}`,
        }),
      );
    }

    this.logger.debug('Redirect rule domains safe', {
      ruleId: context.ruleId ?? null,
      organizationId: context.organizationId,
      domainGroupId: context.domainGroupId,
      extractedDomains: extractedUrls,
    });
  }

  private async validateLinkMapRule(params: {
    organizationId: string;
    domainGroupId: string;
    linkMapId: string | null | undefined;
    source: string;
    pathMatch?: 'exact' | 'prefix';
    queryMatch?: 'exact' | 'ignore' | 'subset';
  }): Promise<void> {
    if (!params.linkMapId) {
      return;
    }

    if (params.source === '*') {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Link map rules cannot use the "*" source.',
          relatedObjectParameter: 'source',
        }),
      );
    }

    if (params.source.includes('?')) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Link map rule source must not include query params.',
          relatedObjectParameter: 'source',
        }),
      );
    }

    if (params.source.startsWith('/') && params.source.lastIndexOf('/') > 0) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Link map rules do not support regex sources.',
          relatedObjectParameter: 'source',
        }),
      );
    }

    const pathMatch = params.pathMatch ?? 'exact';
    if (pathMatch !== 'prefix') {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Link map rules require pathMatch set to prefix.',
          relatedObjectParameter: 'pathMatch',
        }),
      );
    }

    const queryMatch = params.queryMatch ?? 'exact';
    if (queryMatch !== 'ignore') {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Link map rules require queryMatch set to ignore.',
          relatedObjectParameter: 'queryMatch',
        }),
      );
    }

    const linkMap = await this.prisma.linkMap.findFirst({
      where: {
        id: params.linkMapId,
        deletedAt: null,
        domainGroupId: params.domainGroupId,
        domainGroup: { organizationId: params.organizationId, deletedAt: null },
      },
      select: { id: true },
    });

    if (!linkMap) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Link map not found for this domain group.',
          relatedObjectParameter: 'linkMapId',
        }),
      );
    }
  }

  static readonly manipulators: Record<string, Manipulator> = {
    to_lower_case: (val) => val.toLowerCase(),
    to_upper_case: (val) => val.toUpperCase(),
    url_encode: (val) => encodeURIComponent(val),
    url_decode: (val) => decodeURIComponent(val),
    base64_encode: (val) => Buffer.from(val).toString('base64'),
    to_iso_string: (val) => RedirectService.toIsoString(val),
    auto_trailing_slash: (val) => (val && !val.endsWith('/') ? `${val}/` : val),
    // Math manipulators
    multiply_10: (val) => String(Number(val || 0) * 10),
    divide_10: (val) => RedirectService.divideByTen(val),
    add_10: (val) => String(Number(val || 0) + 10),
    multiply_2: (val) => String(Number(val || 0) * 2),
    round: (val) => String(Math.round(Number(val || 0))),
  };

  private static divideByTen(value: string): string {
    const normalized = String(value ?? '').trim();
    if (!normalized) {
      return '0';
    }

    const sign = normalized.startsWith('-') ? '-' : '';
    const unsigned = sign ? normalized.slice(1) : normalized;

    if (!/^\d+(\.\d+)?$/.test(unsigned)) {
      return String(Number(value || 0) / 10);
    }

    const [intPart, fracPart = ''] = unsigned.split('.');
    const digits = `${intPart}${fracPart}`;
    if (!digits) {
      return '0';
    }

    const newIndex = intPart.length - 1;
    let result: string;
    if (newIndex <= 0) {
      const zeros = '0'.repeat(Math.abs(newIndex));
      result = `0.${zeros}${digits}`;
    } else {
      result = `${digits.slice(0, newIndex)}.${digits.slice(newIndex)}`;
    }

    const [resInt, resFrac = ''] = result.split('.');
    const trimmedFrac = resFrac.replace(/0+$/, '');
    const normalizedResult = trimmedFrac ? `${resInt}.${trimmedFrac}` : resInt;
    if (!normalizedResult || normalizedResult === '0') {
      return '0';
    }

    return sign ? `${sign}${normalizedResult}` : normalizedResult;
  }

  private static toIsoString(value: string): string {
    const trimmed = String(value ?? '').trim();
    const nowIso = new Date().toISOString();

    if (!trimmed) {
      return nowIso;
    }

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      const date = new Date(numeric);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    return nowIso;
  }

  /**
   * Retrieves the full redirect context (Domain, Group, Rules) for a hostname.
   * Uses Redis caching to minimize DB hits on the hot path.
   */
  private async getDomainRedirectContext(hostname: string) {
    // 1. Try Cache
    const cached = await this.cacheManagerService.getRedirectContext(hostname);
    if (cached) {
      return cached;
    }

    // 2. DB Query
    const domain: DomainWithRelationsContext | null =
      await this.prisma.domain.findFirst({
        where: {
          name: hostname,
          deletedAt: null,
        },
        include: {
          domainGroup: {
            include: {
              redirectRules: {
                where: {
                  deletedAt: null,
                  isBlocked: false,
                },
                orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
              },
            },
          },
        },
      });

    // 3. Set Cache through Manager
    await this.cacheManagerService.setRedirectContext(hostname, domain);

    return domain;
  }

  async applyRedirect(req: express.Request, res: express.Response) {
    const hostname = req.hostname;

    // 1. Get Domain Context (Cached)
    const domain = await this.getDomainRedirectContext(hostname);

    // If no domain found, return 404
    if (!domain) {
      res.status(404).json({
        message: `Domain ${hostname} not found`,
        error: 'Not Found',
        statusCode: 404,
      });
      return;
    }

    // 2. Check Organization Status (Subscription status)
    try {
      const organization = await this.cacheManagerService.getData<Organization>(
        {
          dataType: DataType.ORGANIZATIONS,
          properties: {
            [CachedByProperty.ID]: domain.domainGroup.organizationId,
          },
        },
      );

      // Default limit if config is missing (safety fallback)
      let limit = 60;

      if (organization && organization.configuration) {
        const config = OrganizationConfiguration.fromJson(
          organization.configuration,
        );
        const subscription =
          this.organizationService.getEffectiveSubscription(config);
        limit = subscription.limits.redirectionLimitPerMinute;
      }

      await this.cacheManagerService.checkOrganizationRateLimit(
        domain.domainGroup.organizationId,
        limit,
      );

      await this.organizationService.checkRedirectionAccess(
        domain.domainGroup.organizationId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json(error.getResponse());
        return;
      }
      throw error;
    }

    // 3. Convert database rules to RedirectRule format
    const rules: RedirectRule[] = this.mapStoredRules(
      domain.domainGroup.redirectRules,
    );

    // 4. Pass rules to getRedirect to find a match
    const match = await this.getRedirectMatch(req, rules);

    // 5. Action: redirect or return 404
    if (match) {
      const statusCode = match.rule.statusCode ?? 302;
      const targetDomain = this.destinationExtractor.extractUrl(match.target);

      if (targetDomain) {
        try {
          const isBlacklisted =
            await this.domainBlacklistService.isBlacklisted(targetDomain);
          if (isBlacklisted) {
            this.logger.warn('Redirect blocked by blacklist', {
              ruleId: match.rule.id ?? null,
              domain: targetDomain,
              hostname,
            });
            res.status(403).json({
              message: 'Destination domain is blocked',
              error: 'Forbidden',
              statusCode: 403,
            });
            return;
          }
        } catch (error) {
          this.logger.error('Redirect blacklist check failed', {
            ruleId: match.rule.id ?? null,
            domain: targetDomain,
            error: error instanceof Error ? error.message : 'unknown_error',
          });
        }
      }

      if (match.rule.id) {
        this.redirectAnalyticsService
          .trackRuleHit(match.rule.id, domain.domainGroup.organizationId)
          .catch((error) => {
            this.logger.error('Redirect hit tracking failed', {
              ruleId: match.rule.id ?? null,
              error: error instanceof Error ? error.message : 'unknown_error',
            });
          });
      }
      res.redirect(statusCode, match.target);
      return;
    }

    res.status(404).json({
      message: `Target for ${req.method} ${req.url} does not exist.`,
      error: 'Not Found',
      statusCode: 404,
    });
  }

  async getRedirect(req: Request, rules: RedirectRule[]): Promise<string | null> {
    const match = await this.getRedirectMatch(req, rules);
    return match ? match.target : null;
  }

  async simulateRedirects(
    organizationId: string,
    entries: RedirectSimulationEntry[],
  ): Promise<{ results: RedirectSimulationResult[] }> {
    await this.organizationService.checkRedirectionAccess(organizationId);

    const domainGroupIds = [
      ...new Set(entries.map((entry) => entry.domainGroupId)),
    ];
    const domainGroups = await this.prisma.domainGroup.findMany({
      where: {
        id: { in: domainGroupIds },
        organizationId,
        deletedAt: null,
      },
      include: {
        redirectRules: {
          where: {
            deletedAt: null,
            isBlocked: false,
          } as Prisma.RedirectRuleWhereInput,
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        },
        domains: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (domainGroups.length !== domainGroupIds.length) {
      const foundIds = new Set(domainGroups.map((group) => group.id));
      const missing = domainGroupIds.filter((id) => !foundIds.has(id));
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: `Domain group(s) not found or not owned by organization: ${missing.join(', ')}`,
          relatedObject: 'DomainGroup',
        }),
      );
    }

    const groupMap = new Map(domainGroups.map((group) => [group.id, group]));

    const results = await Promise.all(entries.map(async (entry, index) => {
      const group = groupMap.get(entry.domainGroupId);
      if (!group) {
        return {
          index,
          domainGroupId: entry.domainGroupId,
          method: entry.method ?? 'GET',
          path: entry.path,
          hostname: '',
          matched: false,
          statusCode: 400,
          target: null,
        };
      }

      const groupDomains = group.domains.map((domain) => domain.name);
      const requestedHost = entry.hostname?.trim().toLowerCase();
      let hostname = this.selectSimulationHostname(
        groupDomains,
        entry.domainGroupId,
      );

      if (requestedHost) {
        if (groupDomains.length > 0) {
          const matched = groupDomains.find(
            (domain) => domain.toLowerCase() === requestedHost,
          );
          if (!matched) {
            return throwHttpException(
              new BadRequestError({
                requestId: this.clsService.getId(),
                details: `Hostname ${entry.hostname} does not belong to domain group ${entry.domainGroupId}`,
                relatedObject: 'DomainGroup',
                relatedObjectId: entry.domainGroupId,
              }),
            );
          }
          hostname = matched;
        } else {
          hostname = requestedHost;
        }
      }
      const request = this.buildSimulationRequest(entry, hostname);
      const rules = this.mapStoredRules(group.redirectRules);
      const match = await this.getRedirectMatch(request, rules);

      if (match) {
        const statusCode = match.rule.statusCode ?? 302;
        return {
          index,
          domainGroupId: entry.domainGroupId,
          method: request.method,
          path: request.path,
          hostname,
          matched: true,
          statusCode,
          target: match.target,
        };
      }

      return {
        index,
        domainGroupId: entry.domainGroupId,
        method: request.method,
        path: request.path,
        hostname,
        matched: false,
        statusCode: 404,
        target: null,
      };
    }));

    return { results };
  }

  private async getRedirectMatch(
    req: Request,
    rules: RedirectRule[],
  ): Promise<{ target: string; rule: RedirectRule } | null> {
    const url = this.getRequestUrl(req);
    const variables = this.extractVariables(req, url);
    const matchContext = this.buildMatchContext(req, url);

    for (const rule of rules) {
      const result = this.processRule(
        rule,
        matchContext,
        req.method,
        variables,
      );
      if (result) {
        if (rule.linkMapId) {
          const linkMapTarget = await this.resolveLinkMapTarget(
            rule,
            matchContext,
          );
          if (linkMapTarget) {
            return { target: linkMapTarget, rule };
          }
          continue;
        }
        return { target: result, rule };
      }
    }

    return null;
  }

  private mapStoredRules(
    rules: {
      id?: string;
      source: string;
      destination: string;
      statusCode: number;
      matchMethod: HttpMethod[];
      queryMatch?: 'exact' | 'ignore' | 'subset';
      pathMatch?: 'exact' | 'prefix';
      linkMapId?: string | null;
    }[],
  ): RedirectRule[] {
    return rules.map((rule) => {
      if (rule.source.startsWith('/') && rule.source.lastIndexOf('/') > 0) {
        const lastSlashIndex = rule.source.lastIndexOf('/');
        const pattern = rule.source.substring(1, lastSlashIndex);
        const flags = rule.source.substring(lastSlashIndex + 1);
        return {
          id: rule.id,
          source: new RegExp(pattern, flags),
          destination: rule.destination,
          statusCode: rule.statusCode,
          matchMethod: rule.matchMethod,
          queryMatch: rule.queryMatch,
          pathMatch: rule.pathMatch,
          linkMapId: rule.linkMapId ?? null,
        };
      }

      return {
        id: rule.id,
        source: rule.source,
        destination: rule.destination,
        statusCode: rule.statusCode,
        matchMethod: rule.matchMethod,
        queryMatch: rule.queryMatch,
        pathMatch: rule.pathMatch,
        linkMapId: rule.linkMapId ?? null,
      };
    });
  }

  private selectSimulationHostname(
    domains: string[],
    domainGroupId: string,
  ): string {
    if (domains.length > 0) {
      return domains[0];
    }

    const safeId = domainGroupId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return `group-${safeId}.local`;
  }

  private buildSimulationRequest(
    entry: RedirectSimulationEntry,
    hostname: string,
  ): Request {
    const headers = this.normalizeHeaders(entry.headers);
    const userAgent = entry.userAgent ?? headers['user-agent'] ?? '';
    const method = (entry.method ?? 'GET').toUpperCase();
    const protocol = entry.protocol ?? 'https';
    const ip = entry.ip ?? '127.0.0.1';
    const { path, originalUrl } = this.normalizePath(entry.path, entry.query);

    const get = (header: string) => {
      const key = header.toLowerCase();
      if (key === 'host') {
        return hostname;
      }
      if (key === 'user-agent') {
        return userAgent;
      }
      return headers[key];
    };

    return {
      method,
      protocol,
      path,
      originalUrl,
      ip,
      socket: { remoteAddress: ip },
      get,
    } as Request;
  }

  private normalizeHeaders(
    headers?: Record<string, string>,
  ): Record<string, string> {
    if (!headers) {
      return {};
    }

    return Object.entries(headers).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[key.toLowerCase()] = value;
        return acc;
      },
      {},
    );
  }

  private normalizePath(
    path: string,
    query?: Record<string, string | string[] | number | boolean>,
  ): { path: string; originalUrl: string } {
    const url = new URL(path, 'http://localhost');
    const searchParams = new URLSearchParams(url.search);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, item));
        } else if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
    }

    const normalizedPath = url.pathname.startsWith('/')
      ? url.pathname
      : `/${url.pathname}`;
    const queryString = searchParams.toString();
    const originalUrl = queryString
      ? `${normalizedPath}?${queryString}`
      : normalizedPath;

    return { path: normalizedPath, originalUrl };
  }

  private getRequestUrl(req: Request): URL {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    return new URL(fullUrl);
  }

  private extractVariables(
    req: Request,
    url: URL,
  ): Record<string, string | undefined> {
    const hostParts = url.hostname.split('.');
    const domainRoot =
      hostParts.length >= 2 ? hostParts[hostParts.length - 2] : hostParts[0];
    const subdomains = hostParts.length > 2 ? hostParts.slice(0, -2) : [];
    const path = url.pathname.replace(/^\//, '');
    const segments = path.split('/').filter(Boolean);

    const variables: Record<string, string | undefined> = {
      'domain.fqdn': url.hostname,
      'domain.label': hostParts.slice(0, -1).join('.'),
      'domain.root': domainRoot,
      'domain.extension': hostParts.slice(1).join('.'),
      'domain.subdomain': subdomains.join('.'),
      path: path,
      method: req.method,
      ip: req.ip || req.socket.remoteAddress,
      'user-agent': req.get('User-Agent') || '',
      // Geo placeholder (Mock)
      'geo.country': this.getCountryByIp(req.ip || req.socket.remoteAddress),
    };

    segments.forEach((seg, i) => (variables[`segments.${i}`] = seg));
    subdomains.forEach((sub, i) => (variables[`domain.subdomains.${i}`] = sub));
    url.searchParams.forEach(
      (value, key) => (variables[`query.${key}`] = value),
    );

    return variables;
  }

  private getCountryByIp(ip: string | undefined): string {
    // TODO: Integrate with MaxMind GeoIP or similar service
    // For now, we return 'US' as default, or 'PL' if localhost for testing
    if (ip === '127.0.0.1' || ip === '::1') return 'PL';
    return 'US';
  }

  private isMethodMatch(
    matchMethod: HttpMethod[] | undefined,
    requestMethod: string,
  ): boolean {
    if (!matchMethod || matchMethod.length === 0) {
      return true;
    }
    const normalized = requestMethod.toUpperCase();
    return matchMethod.some((method) => method.toUpperCase() === normalized);
  }

  private normalizeMatchMethods(
    matchMethod: string[] | undefined,
  ): HttpMethod[] {
    if (!matchMethod || matchMethod.length === 0) {
      return [];
    }

    const normalized = matchMethod
      .map((method) => method.toUpperCase().trim())
      .filter((method) => method.length > 0);

    if (normalized.length === 0) {
      return [];
    }

    const unique = new Set(normalized);
    if (unique.size !== normalized.length) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'matchMethod must not contain duplicate methods.',
          relatedObjectParameter: 'matchMethod',
        }),
      );
    }

    const invalid = normalized.filter(
      (method) => !ALLOWED_MATCH_METHODS.has(method),
    );
    if (invalid.length > 0) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: `matchMethod contains unsupported values: ${invalid.join(', ')}`,
          relatedObjectParameter: 'matchMethod',
        }),
      );
    }

    return Array.from(unique) as HttpMethod[];
  }

  private processRule(
    rule: RedirectRule,
    matchContext: {
      path: string;
      originalUrl: string;
      query: URLSearchParams;
    },
    currentMethod: string,
    variables: Record<string, string | undefined>,
  ): string | null {
    try {
      let target = rule.destination;
      let isMatch = false;
      const pathMatch = rule.pathMatch ?? 'exact';
      const queryMatch = rule.queryMatch ?? 'exact';

      if (!this.isMethodMatch(rule.matchMethod, currentMethod)) {
        return null;
      }

      if (rule.source instanceof RegExp) {
        const matchTarget =
          queryMatch === 'ignore'
            ? matchContext.path
            : matchContext.originalUrl;
        const match = matchTarget.match(rule.source);
        if (match) {
          isMatch = true;
          match.forEach((val, index) => {
            target = target.replace(new RegExp(`\\$${index}`, 'g'), val);
          });
        }
      } else if (rule.source === '*') {
        isMatch = true;
      } else {
        const { path: sourcePath, query: sourceQuery } =
          this.parseSourceForMatch(rule.source);
        if (pathMatch === 'prefix') {
          isMatch = this.isPrefixMatch(sourcePath, matchContext.path);
        } else {
          isMatch = matchContext.path === sourcePath;
        }

        if (isMatch) {
          isMatch = this.isQueryMatch(
            sourceQuery,
            matchContext.query,
            queryMatch,
          );
        }
      }

      if (!isMatch) return null;

      // 1. Replace variables first to resolve values for logic
      const resolvedTarget = this.replacePlaceholders(target, variables);

      // 2. Process conditional logic (Traffic splitting, A/B testing, etc.)
      return this.processConditionals(resolvedTarget);
    } catch (error) {
      this.logger.error('Error processing redirect rule', {
        source:
          rule.source instanceof RegExp ? rule.source.toString() : rule.source,
        destination: rule.destination,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      // If a rule is malformed or dangerous, return null (skip it) so the server stays alive
      return null;
    }
  }

  private async resolveLinkMapTarget(
    rule: RedirectRule,
    matchContext: { path: string; query: URLSearchParams },
  ): Promise<string | null> {
    if (!rule.linkMapId || typeof rule.source !== 'string') {
      return null;
    }

    const sourcePath = this.parseSourcePath(rule.source);
    if (!sourcePath) {
      return null;
    }

    const keyPath = this.extractLinkMapKey(matchContext.path, sourcePath);
    if (keyPath === null) {
      return null;
    }

    return this.linkMapService.resolveLinkMapDestination(
      rule.linkMapId,
      keyPath,
      matchContext.query,
    );
  }

  private parseSourcePath(source: string): string | null {
    try {
      const url = new URL(source, 'http://localhost');
      const path = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
      return path;
    } catch {
      return null;
    }
  }

  private extractLinkMapKey(path: string, sourcePath: string): string | null {
    if (!path.startsWith(sourcePath)) {
      return null;
    }

    let remainder = path.slice(sourcePath.length);
    if (remainder.startsWith('/')) {
      remainder = remainder.slice(1);
    }
    return remainder;
  }

  private buildMatchContext(req: Request, url: URL): {
    path: string;
    originalUrl: string;
    query: URLSearchParams;
  } {
    const path = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
    const originalUrl =
      req.originalUrl ?? (url.search ? `${path}${url.search}` : path);
    return {
      path,
      originalUrl,
      query: url.searchParams,
    };
  }

  private isPrefixMatch(source: string, currentPath: string): boolean {
    if (!currentPath.startsWith(source)) {
      return false;
    }

    if (currentPath.length === source.length) {
      return true;
    }

    if (source.endsWith('/')) {
      return true;
    }

    const boundary = currentPath[source.length];
    return boundary === '/' || boundary === '?';
  }

  private parseSourceForMatch(source: string): {
    path: string;
    query: URLSearchParams;
  } {
    const url = new URL(source, 'http://localhost');
    const path = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
    return { path, query: url.searchParams };
  }

  private isQueryMatch(
    expected: URLSearchParams,
    actual: URLSearchParams,
    mode: 'exact' | 'ignore' | 'subset',
  ): boolean {
    if (mode === 'ignore') {
      return true;
    }

    const expectedMap = this.toQueryMap(expected);
    const actualMap = this.toQueryMap(actual);

    if (mode === 'exact') {
      if (expectedMap.size !== actualMap.size) {
        return false;
      }
      for (const [key, values] of expectedMap.entries()) {
        const actualValues = actualMap.get(key);
        if (!actualValues || actualValues.length !== values.length) {
          return false;
        }
        for (let i = 0; i < values.length; i += 1) {
          if (values[i] !== actualValues[i]) {
            return false;
          }
        }
      }
      return true;
    }

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
    return map;
  }

  /**
   * Recursively processes conditional logic in the string.
   * Syntax: Condition ? TrueValue : FalseValue
   * Supports nesting: Cond1 ? (Cond2 ? A : B) : C
   */
  private processConditionals(template: string, depth = 0): string {
    if (depth > REDIRECT_ENGINE_LIMITS.MAX_RECURSION_DEPTH) {
      throw new Error('Maximum recursion depth exceeded in redirect rule.');
    }

    let trimmed = template.trim();

    // Remove outer parentheses if they wrap the entire expression
    while (this.hasOuterParentheses(trimmed)) {
      trimmed = trimmed.substring(1, trimmed.length - 1).trim();
    }

    const isUrlLike =
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/');
    if (isUrlLike) {
      return trimmed;
    }

    // Simple check if it might be a conditional
    if (!trimmed.includes('?') || !trimmed.includes(':')) {
      return trimmed;
    }

    const split = this.splitConditional(trimmed);
    if (!split) {
      return trimmed;
    }

    const { condition, truePart, falsePart } = split;
    const isTrue = this.evaluateCondition(condition);

    // Recursively process the chosen branch
    return this.processConditionals(isTrue ? truePart : falsePart, depth + 1);
  }

  /**
   * Check if string has matching outer parentheses that wrap the entire expression
   */
  private hasOuterParentheses(str: string): boolean {
    const trimmed = str.trim();
    if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
      return false;
    }

    // Check if first '(' matches the last ')'
    let balance = 0;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '(') balance++;
      else if (trimmed[i] === ')') balance--;

      // If balance hits 0 before the end, these aren't matching outer parens
      if (balance === 0 && i < trimmed.length - 1) {
        return false;
      }
    }

    // They are matching outer parens
    return true;
  }

  /**
   * Parses the string to find the top-level ternary operator components.
   * Respects parentheses nesting.
   */
  private splitConditional(
    template: string,
  ): { condition: string; truePart: string; falsePart: string } | null {
    let balance = 0;
    let questionMarkIndex = -1;
    let colonIndex = -1;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    // 1. Find the split point (?)
    for (let i = 0; i < template.length; i++) {
      const char = template[i];

      // Track quotes
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }

      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') balance++;
        else if (char === ')') balance--;
        else if (char === '?' && balance === 0) {
          questionMarkIndex = i;
          break;
        }
      }
    }

    if (questionMarkIndex === -1) return null;

    // 2. Find the corresponding colon (:) - skip URL colons (://)
    balance = 0;
    inSingleQuote = false;
    inDoubleQuote = false;
    for (let i = questionMarkIndex + 1; i < template.length; i++) {
      const char = template[i];

      // Track quotes
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }

      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') balance++;
        else if (char === ')') balance--;
        else if (char === ':' && balance === 0) {
          // Skip URL colons (check if followed by //)
          if (template.substring(i + 1, i + 3) === '//') {
            continue;
          }
          colonIndex = i;
          break;
        }
      }
    }

    if (colonIndex === -1) return null;

    return {
      condition: template.substring(0, questionMarkIndex).trim(),
      truePart: template.substring(questionMarkIndex + 1, colonIndex).trim(),
      falsePart: template.substring(colonIndex + 1).trim(),
    };
  }

  /**
   * Evaluates a single condition string.
   * Supports:
   * - Comparisons: ==, !=, <, >, <=, >=
   * - Regex Match: ~=
   * - String literals (quoted) and Numbers
   * - Date/Time functions: time(), datetime(date, timezone?)
   */
  private evaluateCondition(condition: string): boolean {
    const preprocessed = this.preprocessCondition(condition.trim());
    const operatorMatch = this.findOperatorPosition(preprocessed);

    if (!operatorMatch) {
      this.logger.debug('No operator found in condition', { condition });
      return false;
    }

    const { leftPart, operator, rightPart } = operatorMatch;
    const left = this.parseValue(leftPart);
    const right = this.parseValue(rightPart);

    // Temporary debug log
    this.logger.debug('Evaluating redirect condition', {
      left,
      operator,
      right,
    });

    switch (operator) {
      case '==':
        return left == right;
      case '!=':
        return left != right;
      case '<':
        return left < right;
      case '>':
        return left > right;
      case '<=':
        return left <= right;
      case '>=':
        return left >= right;
      case '~=': // Regex match
        try {
          // Support regex with flags: value ~= /pattern/flags format
          let pattern = String(right);
          let flags = '';

          // Check if it's in /pattern/flags format
          const regexMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
          if (regexMatch) {
            pattern = regexMatch[1];
            flags = regexMatch[2];
          }

          return new RegExp(pattern, flags).test(String(left));
        } catch {
          return false;
        }
      case 'includes':
        return String(left).includes(String(right));
      default:
        return false;
    }
  }

  /**
   * Find operator position respecting quotes and parentheses
   */
  private findOperatorPosition(condition: string): {
    leftPart: string;
    operator: string;
    rightPart: string;
  } | null {
    const operators = ['==', '!=', '<=', '>=', '~=', 'includes', '<', '>'];

    let inSingleQuote = false;
    let inDoubleQuote = false;
    let parenDepth = 0;

    // Scan for operators that are NOT inside quotes or parentheses
    for (let i = 0; i < condition.length; i++) {
      const char = condition[i];

      // Track quotes
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }

      // Track parentheses (only when not in quotes)
      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') parenDepth++;
        else if (char === ')') parenDepth--;
      }

      // Look for operators only when not in quotes/parens
      if (!inSingleQuote && !inDoubleQuote && parenDepth === 0) {
        // Try each operator (longest first to match '==' before '=')
        for (const op of operators) {
          if (condition.substring(i, i + op.length) === op) {
            return {
              leftPart: condition.substring(0, i).trim(),
              operator: op,
              rightPart: condition.substring(i + op.length).trim(),
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Preprocess condition to handle parentheses wrapping
   */
  private preprocessCondition(condition: string): string {
    // Remove wrapping parentheses if they exist
    const trimmed = condition.trim();
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      // Check if these are matching outer parens
      let balance = 0;
      for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] === '(') balance++;
        if (trimmed[i] === ')') balance--;
        // If balance reaches 0 before the end, these aren't outer parens
        if (balance === 0 && i < trimmed.length - 1) {
          return trimmed;
        }
      }
      // They are outer parens, remove them
      return this.preprocessCondition(trimmed.substring(1, trimmed.length - 1));
    }
    return trimmed;
  }

  /**
   * Parse a value from condition string (handles time(), datetime(), strings, numbers)
   */
  private parseValue(val: string): string | number {
    const trimmed = val.trim();

    // 1. Check for time()
    if (/^time\s*\(\s*\)$/.test(trimmed)) {
      return Date.now();
    }

    // 2. Check for random()
    const randomMatch = trimmed.match(/^random\s*\(\s*(.*?)\s*\)$/);
    if (randomMatch) {
      const randomInput = this.buildRandomInput(randomMatch[1]?.trim() ?? '');
      if (randomInput === null) {
        return NaN;
      }
      return Number(RedirectService.processRandom(randomInput));
    }

    // 3. Check for datetime('date', 'timezone'?)
    const dtMatch = trimmed.match(
      /^datetime\s*\(\s*(['"])(.*?)\1\s*(?:,\s*(['"])(.*?)\3)?\s*\)$/,
    );

    if (dtMatch) {
      const dateStr = dtMatch[2];
      const tz = dtMatch[4];

      let parsed: dayjs.Dayjs | undefined;
      if (tz) {
        parsed = dayjs.tz(dateStr, tz);
      } else {
        parsed = dayjs.utc(dateStr);
      }

      if (!parsed.isValid()) {
        this.logger.warn('Invalid date in rule condition', {
          date: dateStr,
          timezone: tz || 'UTC',
        });
        return NaN;
      }

      return parsed.valueOf();
    }

    // 4. Remove surrounding quotes for strings
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.substring(1, trimmed.length - 1);
    }

    // 5. Try parsing as number - MUST be before returning trimmed
    const num = Number(trimmed);
    if (!isNaN(num)) {
      return num; // Return number, not trimmed string!
    }

    // 6. Return as string if not a number
    return trimmed;
  }

  private replacePlaceholders(
    template: string,
    variables: Record<string, string | undefined>,
  ): string {
    const result = template.replace(
      /(?<!\{)\{([^{}]+)\}(?!\})/g,
      (match, content: string) => {
        const lastColonIndex: number = content.lastIndexOf(':');
        const key =
          lastColonIndex === -1
            ? content
            : content.substring(0, lastColonIndex);
        const modifierChain =
          lastColonIndex === -1
            ? undefined
            : content.substring(lastColonIndex + 1);

        let value = key ? variables[key] : '';

        if (value === undefined && key) {
          const functionValue = this.resolveFunctionValue(key);
          if (functionValue !== undefined) {
            value = functionValue;
          }
        }

        if (value === undefined && modifierChain) {
          value = key;
        }

        if (value === undefined && key && !modifierChain) return match;

        if (modifierChain) {
          return this.applyModifiers(value ?? '', modifierChain);
        }

        return value ?? '';
      },
    );

    return result.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
  }

  private applyModifiers(initialValue: string, modifierChain: string): string {
    const modifiers = modifierChain.split('.');
    return modifiers.reduce((acc, mod) => {
      const manipulator = RedirectService.manipulators[mod];
      if (manipulator) {
        try {
          return manipulator(acc);
        } catch (e: any) {
          this.logger.error('Error applying manipulator', {
            manipulator: mod,
            error: e instanceof Error ? e.message : 'unknown_error',
          });
          return acc;
        }
      }
      this.logger.warn('Unknown manipulator', { manipulator: mod });
      return acc;
    }, initialValue);
  }

  private resolveFunctionValue(key: string): string | undefined {
    const trimmed = key.trim();

    if (/^time\s*\(\s*\)$/.test(trimmed)) {
      return String(Date.now());
    }

    const randomMatch = trimmed.match(/^random\s*\(\s*(.*?)\s*\)$/);
    if (randomMatch) {
      const randomInput = this.buildRandomInput(randomMatch[1]?.trim() ?? '');
      if (randomInput === null) {
        return undefined;
      }
      return RedirectService.processRandom(randomInput);
    }

    return undefined;
  }

  private buildRandomInput(args: string): string | null {
    if (!args) {
      return '';
    }

    const parts = args
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0 || parts.length > 2) {
      return null;
    }

    const parsedParts: number[] = [];
    for (const part of parts) {
      const parsed = Number(part);
      if (!Number.isSafeInteger(parsed)) {
        return null;
      }
      parsedParts.push(parsed);
    }

    return parsedParts.length === 1
      ? String(parsedParts[0])
      : `${parsedParts[0]}:${parsedParts[1]}`;
  }

  /**
   * Helper function to generate random number based on input string.
   * Input formats:
   * - "min:max" (e.g. "-10:20") -> random between -10 and 20
   * - "max" (e.g. "100") -> random between 0 and 100
   * - "" (empty) -> random between 0 and MAX_SAFE_INTEGER
   */
  private static processRandom(val: string): string {
    let min = 0;
    let max = Number.MAX_SAFE_INTEGER;

    if (val && val.includes(':')) {
      const parts = val.split(':');
      if (parts.length === 2) {
        const parsedMin = parseInt(parts[0], 10);
        const parsedMax = parseInt(parts[1], 10);
        if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
          min = parsedMin;
          max = parsedMax;
        }
      }
    } else if (val) {
      const parsedMax = parseInt(val, 10);
      if (!isNaN(parsedMax)) {
        max = parsedMax;
      }
    }

    if (min > max) [min, max] = [max, min];

    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}
