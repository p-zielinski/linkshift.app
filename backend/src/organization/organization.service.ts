import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ClsService } from 'nestjs-cls';
import {
  NotFoundError,
  PaymentRequiredError,
} from '@shared/models/error.model';
import {
  OrganizationConfiguration,
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

    const count = await this.prisma.domainGroup.count({
      where: { organizationId, deletedAt: null },
    });

    if (count >= config.maxDomainGroups) {
      this.throwLimitError(
        `Domain group limit reached (${config.maxDomainGroups} max). Please upgrade your plan.`,
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

    // 1. Check total domains limit
    const totalCount = await this.prisma.domain.count({
      where: {
        domainGroup: { organizationId, deletedAt: null },
        deletedAt: null,
      },
    });

    if (totalCount >= config.maxTotalDomains) {
      this.throwLimitError(
        `Total domain limit reached (${config.maxTotalDomains} max). Please upgrade your plan.`,
      );
    }

    // 2. Check domains per group limit
    const groupCount = await this.prisma.domain.count({
      where: {
        domainGroupId,
        deletedAt: null,
      },
    });

    if (groupCount >= config.maxDomainsPerGroup) {
      this.throwLimitError(
        `Domain limit for this group reached (${config.maxDomainsPerGroup} max). Please upgrade your plan.`,
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

    // 1. Check total rules limit
    const totalCount = await this.prisma.redirectRule.count({
      where: {
        domainGroup: { organizationId, deletedAt: null },
        deletedAt: null,
      },
    });

    if (totalCount >= config.maxTotalRules) {
      this.throwLimitError(
        `Total redirect rule limit reached (${config.maxTotalRules} max). Please upgrade your plan.`,
      );
    }

    // 2. Check rules per group limit
    const groupCount = await this.prisma.redirectRule.count({
      where: {
        domainGroupId,
        deletedAt: null,
      },
    });

    if (groupCount >= config.maxRulesPerGroup) {
      this.throwLimitError(
        `Redirect rule limit for this group reached (${config.maxRulesPerGroup} max). Please upgrade your plan.`,
      );
    }
  }

  /**
   * Checks if the organization is allowed to process redirects.
   * Throws PaymentRequiredError if the account is suspended or has payment due.
   */
  async checkRedirectionAccess(organizationId: string): Promise<void> {
    const config = await this.getConfiguration(organizationId);

    if (
      config.status === OrganizationStatus.SUSPENDED ||
      config.status === OrganizationStatus.PAYMENT_DUE
    ) {
      this.throwLimitError(
        `Organization status is ${config.status}. Please check your billing settings.`,
      );
    }
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
