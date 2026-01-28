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

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly cls: ClsService,
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
      domainCounts,
      ruleCounts,
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

    return null;
  }

  async getUsageSummary(organizationId: string): Promise<{
    domainGroups: number;
    domains: number;
    rules: number;
  }> {
    const [domainGroups, domains, rules] = await Promise.all([
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
    ]);

    return { domainGroups, domains, rules };
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
