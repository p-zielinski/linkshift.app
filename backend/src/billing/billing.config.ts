import {
  BillingInterval,
  OrganizationPlan,
} from '@shared/models/organization-config.model';
import {
  DEFAULT_PLAN_LIMITS,
  type PlanLimits,
} from '@shared/models/plan-limits.model';

export const PLAN_LIMITS = {
  [OrganizationPlan.FREE]: {
    ...DEFAULT_PLAN_LIMITS,
  },
  [OrganizationPlan.BASIC]: {
    maxDomainGroups: 1,
    maxDomainsPerGroup: 10,
    maxTotalDomains: 10,
    maxSubdomainsPerGroup: 1,
    maxTotalSubdomains: 1,
    maxRulesPerGroup: 250,
    maxTotalRules: 250,
    maxTestsPerGroup: 500,
    maxTotalTests: 500,
    maxUsers: 3,
    redirectionLimitPerMinute: 50,
    maxApiKeys: 1,
    apiKeyCallsPerMinute: 10,
    maxLinkMaps: 5,
    maxLinkMapEntriesTotal: 5000,
    maxLinkMapEntriesPerMap: 2000,
    analyticsRetentionDays: 30,
  },
  [OrganizationPlan.PRO]: {
    maxDomainGroups: 2,
    maxDomainsPerGroup: 15,
    maxTotalDomains: 15,
    maxSubdomainsPerGroup: 1,
    maxTotalSubdomains: 2,
    maxRulesPerGroup: 500,
    maxTotalRules: 500,
    maxTestsPerGroup: 1000,
    maxTotalTests: 1000,
    maxUsers: 5,
    redirectionLimitPerMinute: 100,
    maxApiKeys: 3,
    apiKeyCallsPerMinute: 50,
    maxLinkMaps: 20,
    maxLinkMapEntriesTotal: 20000,
    maxLinkMapEntriesPerMap: 8000,
    analyticsRetentionDays: 60,
  },
} satisfies Record<
  Exclude<OrganizationPlan, OrganizationPlan.UNMETERED>,
  PlanLimits
>;

export function getPlanLimits(plan: string): PlanLimits {
  return plan in PLAN_LIMITS
    ? PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]
    : PLAN_LIMITS[OrganizationPlan.FREE];
}

export type PriceIdMap = {
  starterMonthly?: string | null;
  starterYearly?: string | null;
  proMonthly?: string | null;
  proYearly?: string | null;
};

export function getPriceIdForPlan(
  plan: OrganizationPlan,
  interval: BillingInterval,
  prices: PriceIdMap,
): string | null {
  if (plan === OrganizationPlan.BASIC) {
    if (interval === 'YEARLY') {
      return prices.starterYearly ?? null;
    }
    return prices.starterMonthly ?? null;
  }
  if (plan === OrganizationPlan.PRO) {
    if (interval === 'YEARLY') {
      return prices.proYearly ?? null;
    }
    return prices.proMonthly ?? null;
  }
  return null;
}
