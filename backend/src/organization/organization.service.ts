import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ClsService } from 'nestjs-cls';
import {
  NotFoundError,
  PaymentRequiredError,
} from '@shared/models/error.model';
import {
  OrganizationConfiguration,
  OrganizationPlan,
  OrganizationSubscription,
  OrganizationStatus,
} from '@shared/models/organization-config.model';
import {
  CachedByProperty,
  CacheManagerService,
  DataType,
} from '../cache/cache-manager.service';
import { Organization } from '@shared/prisma-client';
import { throwHttpException } from '../utils';
import { Logger } from 'nestjs-pino';
import {
  DEFAULT_PLAN_LIMITS,
  UNMETERED_PLAN_LIMITS,
} from '@shared/models/plan-limits.model';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly cls: ClsService,
    private readonly logger: Logger,
  ) {}

  /**
   * Retrieves the organization's configuration.
   * Returns default configuration if none is set in the database.
   */
  async getConfiguration(
    organizationId: string,
  ): Promise<OrganizationConfiguration> {
    const organization = await this.cacheManagerService.getData<Organization>({
      dataType: DataType.ORGANIZATIONS,
      properties: {
        [CachedByProperty.ID]: organizationId,
      },
    });

    if (!organization) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.cls.getId(),
          details: `Organization with id ${organizationId} not found`,
        }),
      );
    }

    return OrganizationConfiguration.fromJson(organization?.configuration);
  }

  /**
   * Checks if the organization can create a new domain group.
   */
  async checkDomainGroupLimit(organizationId: string): Promise<void> {
    const config = await this.getConfiguration(organizationId);
    const limits = this.getEffectiveSubscription(config).limits;

    const count = await this.prisma.domainGroup.count({
      where: { organizationId, deletedAt: null },
    });

    if (count >= limits.maxDomainGroups) {
      this.throwLimitError(
        `Domain group limit reached (${limits.maxDomainGroups} max). Please upgrade your plan.`,
      );
    }
  }

  /**
   * Checks if the organization can create a new domain in a specific group.
   * Verifies both total organization limit and per-group limit.
   */
  async checkDomainLimit(
    organizationId: string,
    domainGroupId: string,
  ): Promise<void> {
    const config = await this.getConfiguration(organizationId);
    const limits = this.getEffectiveSubscription(config).limits;

    // 1. Check total domains limit
    const totalCount = await this.prisma.domain.count({
      where: {
        domainGroup: { organizationId, deletedAt: null },
        deletedAt: null,
      },
    });

    if (totalCount >= limits.maxTotalDomains) {
      this.throwLimitError(
        `Total domain limit reached (${limits.maxTotalDomains} max). Please upgrade your plan.`,
      );
    }

    // 2. Check domains per group limit
    const groupCount = await this.prisma.domain.count({
      where: {
        domainGroupId,
        deletedAt: null,
      },
    });

    if (groupCount >= limits.maxDomainsPerGroup) {
      this.throwLimitError(
        `Domain limit for this group reached (${limits.maxDomainsPerGroup} max). Please upgrade your plan.`,
      );
    }
  }

  /**
   * Checks if the organization can create a new redirect rule.
   * Verifies both total organization limit and per-group limit.
   */
  async checkRedirectRuleLimit(
    organizationId: string,
    domainGroupId: string,
  ): Promise<void> {
    const config = await this.getConfiguration(organizationId);
    const limits = this.getEffectiveSubscription(config).limits;

    // 1. Check total rules limit
    const totalCount = await this.prisma.redirectRule.count({
      where: {
        domainGroup: { organizationId, deletedAt: null },
        deletedAt: null,
      },
    });

    if (totalCount >= limits.maxTotalRules) {
      this.throwLimitError(
        `Total redirect rule limit reached (${limits.maxTotalRules} max). Please upgrade your plan.`,
      );
    }

    // 2. Check rules per group limit
    const groupCount = await this.prisma.redirectRule.count({
      where: {
        domainGroupId,
        deletedAt: null,
      },
    });

    if (groupCount >= limits.maxRulesPerGroup) {
      this.throwLimitError(
        `Redirect rule limit for this group reached (${limits.maxRulesPerGroup} max). Please upgrade your plan.`,
      );
    }
  }

  /**
   * Checks if the organization can create a new link map.
   */
  async checkLinkMapLimit(
    organizationId: string,
    domainGroupId: string,
  ): Promise<void> {
    const config = await this.getConfiguration(organizationId);
    const limits = this.getEffectiveSubscription(config).limits;

    const totalCount = await this.prisma.linkMap.count({
      where: {
        domainGroup: { organizationId, deletedAt: null },
        deletedAt: null,
      },
    });

    if (totalCount >= limits.maxLinkMaps) {
      this.throwLimitError(
        `Link map limit reached (${limits.maxLinkMaps} max). Please upgrade your plan.`,
      );
    }

    // Domain group validation for ownership (used for audit-style errors later).
    const groupExists = await this.prisma.domainGroup.findFirst({
      where: { id: domainGroupId, organizationId, deletedAt: null },
      select: { id: true },
    });
    if (!groupExists) {
      this.throwLimitError(
        `Domain group ${domainGroupId} not found for this organization.`,
      );
    }
  }

  /**
   * Checks if the organization can add more link map entries.
   */
  async checkLinkMapEntryLimit(
    organizationId: string,
    domainGroupId: string,
    additionalCount: number,
    linkMapId?: string,
  ): Promise<void> {
    if (additionalCount <= 0) return;

    const config = await this.getConfiguration(organizationId);
    const limits = this.getEffectiveSubscription(config).limits;

    const totalCount = await this.prisma.linkMapEntry.count({
      where: {
        deletedAt: null,
        linkMap: {
          deletedAt: null,
          domainGroup: { organizationId, deletedAt: null },
        },
      },
    });

    if (totalCount + additionalCount > limits.maxLinkMapEntriesTotal) {
      this.throwLimitError(
        `Link map entry limit reached (${limits.maxLinkMapEntriesTotal} max). Please upgrade your plan.`,
      );
    }

    if (linkMapId) {
      const mapCount = await this.prisma.linkMapEntry.count({
        where: { linkMapId, deletedAt: null },
      });
      if (mapCount + additionalCount > limits.maxLinkMapEntriesPerMap) {
        this.throwLimitError(
          `Link map entry limit for this map reached (${limits.maxLinkMapEntriesPerMap} max). Please upgrade your plan.`,
        );
      }
    } else if (additionalCount > limits.maxLinkMapEntriesPerMap) {
      this.throwLimitError(
        `Link map entry limit for this map reached (${limits.maxLinkMapEntriesPerMap} max). Please upgrade your plan.`,
      );
    }
  }

  /**
   * Checks if the organization can create a new redirect test.
   * Verifies both total organization limit and per-group limit.
   */
  async checkRedirectTestLimit(
    organizationId: string,
    domainGroupId: string,
  ): Promise<void> {
    const config = await this.getConfiguration(organizationId);
    const limits = this.getEffectiveSubscription(config).limits;

    const totalCount = await this.prisma.redirectTest.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    if (totalCount >= limits.maxTotalTests) {
      this.throwLimitError(
        `Total redirect test limit reached (${limits.maxTotalTests} max). Please upgrade your plan.`,
      );
    }

    const groupCount = await this.prisma.redirectTest.count({
      where: {
        domainGroupId,
        deletedAt: null,
      },
    });

    if (groupCount >= limits.maxTestsPerGroup) {
      this.throwLimitError(
        `Redirect test limit for this group reached (${limits.maxTestsPerGroup} max). Please upgrade your plan.`,
      );
    }
  }

  /**
   * Checks if the organization can activate another user.
   * Only active (non-blocked) users are counted.
   */
  async checkActiveUserLimit(organizationId: string): Promise<void> {
    const config = await this.getConfiguration(organizationId);
    const limits = this.getEffectiveSubscription(config).limits;

    const activeUserCount = await this.prisma.user.count({
      where: {
        organizationId,
        deletedAt: null,
        isBlocked: false,
      },
    });

    if (activeUserCount >= limits.maxUsers) {
      this.throwLimitError(
        `Active user limit reached (${limits.maxUsers} max). Please upgrade your plan.`,
      );
    }
  }

  /**
   * Checks if the organization is allowed to process redirects.
   * Throws PaymentRequiredError if the subscription is suspended or over limits.
   */
  async checkRedirectionAccess(organizationId: string): Promise<void> {
    const config = await this.getConfiguration(organizationId);
    const status = config.activeSubscription.status;

    if (status === OrganizationStatus.SUSPENDED) {
      this.throwLimitError(
        `Organization status is ${status}. Please check your billing settings.`,
      );
    }

    const subscription = this.getEffectiveSubscription(config);
    const overage = await this.findLimitOverage(
      organizationId,
      subscription.limits,
    );

    if (overage) {
      this.throwLimitError(
        `Organization exceeds ${subscription.plan} plan limits. ${overage}. Please upgrade or remove resources.`,
      );
    }
  }

  getEffectiveSubscription(
    config: OrganizationConfiguration,
  ): OrganizationSubscription {
    const subscription =
      config.activeSubscription ?? new OrganizationSubscription();

    if (subscription.status === OrganizationStatus.SUSPENDED) {
      return subscription;
    }

    const activeUntil = subscription.activeUntil;
    const hasEnded =
      activeUntil instanceof Date && activeUntil.getTime() <= Date.now();

    if (subscription.status === OrganizationStatus.CANCELED) {
      if (activeUntil instanceof Date && !hasEnded) {
        return subscription;
      }
      return new OrganizationSubscription({
        plan: OrganizationPlan.FREE,
        status: OrganizationStatus.ACTIVE,
      });
    }

    if (hasEnded) {
      return new OrganizationSubscription({
        plan: OrganizationPlan.FREE,
        status: OrganizationStatus.ACTIVE,
      });
    }

    if (subscription.plan === OrganizationPlan.UNMETERED) {
      subscription.limits = UNMETERED_PLAN_LIMITS;
    }

    return subscription;
  }

  private async findLimitOverage(
    organizationId: string,
    limits: OrganizationSubscription['limits'],
  ): Promise<string | null> {
    const [
      domainGroupCount,
      totalDomainCount,
      totalRuleCount,
      totalLinkMapCount,
      totalLinkMapEntryCount,
      activeUserCount,
      domainCounts,
      ruleCounts,
      linkMapEntryCounts,
    ] = await Promise.all([
      this.prisma.domainGroup.count({
        where: { organizationId, deletedAt: null },
      }),
      this.prisma.domain.count({
        where: {
          domainGroup: { organizationId, deletedAt: null },
          deletedAt: null,
        },
      }),
      this.prisma.redirectRule.count({
        where: {
          domainGroup: { organizationId, deletedAt: null },
          deletedAt: null,
        },
      }),
      this.prisma.linkMap.count({
        where: {
          domainGroup: { organizationId, deletedAt: null },
          deletedAt: null,
        },
      }),
      this.prisma.linkMapEntry.count({
        where: {
          deletedAt: null,
          linkMap: {
            deletedAt: null,
            domainGroup: { organizationId, deletedAt: null },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          organizationId,
          deletedAt: null,
          isBlocked: false,
        },
      }),
      this.prisma.domain.groupBy({
        by: ['domainGroupId'],
        where: {
          deletedAt: null,
          domainGroup: { organizationId, deletedAt: null },
        },
        _count: { _all: true },
      }),
      this.prisma.redirectRule.groupBy({
        by: ['domainGroupId'],
        where: {
          deletedAt: null,
          domainGroup: { organizationId, deletedAt: null },
        },
        _count: { _all: true },
      }),
      this.prisma.linkMapEntry.groupBy({
        by: ['linkMapId'],
        where: {
          deletedAt: null,
          linkMap: {
            deletedAt: null,
            domainGroup: { organizationId, deletedAt: null },
          },
        },
        _count: { _all: true },
      }),
    ]);

    if (domainGroupCount > limits.maxDomainGroups) {
      return `Domain groups ${domainGroupCount}/${limits.maxDomainGroups}`;
    }

    if (totalDomainCount > limits.maxTotalDomains) {
      return `Total domains ${totalDomainCount}/${limits.maxTotalDomains}`;
    }

    if (totalRuleCount > limits.maxTotalRules) {
      return `Total rules ${totalRuleCount}/${limits.maxTotalRules}`;
    }

    if (totalLinkMapCount > limits.maxLinkMaps) {
      return `Link maps ${totalLinkMapCount}/${limits.maxLinkMaps}`;
    }

    if (totalLinkMapEntryCount > limits.maxLinkMapEntriesTotal) {
      return `Link map entries ${totalLinkMapEntryCount}/${limits.maxLinkMapEntriesTotal}`;
    }

    if (activeUserCount > limits.maxUsers) {
      return `Active users ${activeUserCount}/${limits.maxUsers}`;
    }

    const domainOverage = domainCounts.find(
      (entry) => entry._count._all > limits.maxDomainsPerGroup,
    );
    if (domainOverage) {
      return `Domains per group ${domainOverage._count._all}/${limits.maxDomainsPerGroup}`;
    }

    const ruleOverage = ruleCounts.find(
      (entry) => entry._count._all > limits.maxRulesPerGroup,
    );
    if (ruleOverage) {
      return `Rules per group ${ruleOverage._count._all}/${limits.maxRulesPerGroup}`;
    }

    const linkMapEntryOverage = linkMapEntryCounts.find(
      (entry) => entry._count._all > limits.maxLinkMapEntriesPerMap,
    );
    if (linkMapEntryOverage) {
      return `Link map entries per map ${linkMapEntryOverage._count._all}/${limits.maxLinkMapEntriesPerMap}`;
    }

    return null;
  }

  async getUsageSummary(organizationId: string): Promise<{
    domainGroups: number;
    domains: number;
    rules: number;
    tests: number;
    users: number;
    apiKeys: number;
    linkMaps: number;
    linkMapEntries: number;
  }> {
    const [
      domainGroups,
      domains,
      rules,
      tests,
      users,
      apiKeys,
      linkMaps,
      linkMapEntries,
    ] = await Promise.all([
      this.prisma.domainGroup.count({
        where: { organizationId, deletedAt: null },
      }),
      this.prisma.domain.count({
        where: {
          domainGroup: { organizationId, deletedAt: null },
          deletedAt: null,
        },
      }),
      this.prisma.redirectRule.count({
        where: {
          domainGroup: { organizationId, deletedAt: null },
          deletedAt: null,
        },
      }),
      this.prisma.redirectTest.count({
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
      this.prisma.user.count({
        where: {
          organizationId,
          deletedAt: null,
          isBlocked: false,
        },
      }),
      this.prisma.apiKey.count({
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
      this.prisma.linkMap.count({
        where: {
          deletedAt: null,
          domainGroup: { organizationId, deletedAt: null },
        },
      }),
      this.prisma.linkMapEntry.count({
        where: {
          deletedAt: null,
          linkMap: {
            deletedAt: null,
            domainGroup: { organizationId, deletedAt: null },
          },
        },
      }),
    ]);

    return {
      domainGroups,
      domains,
      rules,
      tests,
      users,
      apiKeys,
      linkMaps,
      linkMapEntries,
    };
  }

  private throwLimitError(details: string): never {
    return throwHttpException(
      new PaymentRequiredError({
        details,
        requestId: this.cls.getId(),
      }),
    );
  }
}
