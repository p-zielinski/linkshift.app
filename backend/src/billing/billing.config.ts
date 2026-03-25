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
    maxRulesPerGroup: 250,
    maxTotalRules: 250,
    maxTestsPerGroup: 500,
    maxTotalTests: 500,
    maxUsers: 3,
    redirectionLimitPerMinute: 50,
    maxLinkMaps: 5,
    maxLinkMapEntriesTotal: 5000,
    maxLinkMapEntriesPerMap: 2000,
    analyticsRetentionDays: 60,
  },
  [OrganizationPlan.PRO]: {
    maxDomainGroups: 2,
    maxDomainsPerGroup: 15,
    maxTotalDomains: 15,
    maxRulesPerGroup: 500,
    maxTotalRules: 500,
    maxTestsPerGroup: 1000,
    maxTotalTests: 1000,
    maxUsers: 5,
    redirectionLimitPerMinute: 100,
    maxLinkMaps: 20,
    maxLinkMapEntriesTotal: 20000,
    maxLinkMapEntriesPerMap: 8000,
    analyticsRetentionDays: 90,
  },
} satisfies Record<OrganizationPlan, PlanLimits>;

export const CHECKOUT_PLANS: OrganizationPlan[] = [
  OrganizationPlan.BASIC,
  OrganizationPlan.PRO,
];

export function getPlanLimits(plan: OrganizationPlan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS[OrganizationPlan.FREE];
}

export type VariantIdMap = {
  starterMonthly?: string | null;
  starterYearly?: string | null;
  proMonthly?: string | null;
  proYearly?: string | null;
};

export function getVariantIdForPlan(
  plan: OrganizationPlan,
  interval: BillingInterval,
  variants: VariantIdMap,
): string | null {
  if (plan === OrganizationPlan.BASIC) {
    if (interval === 'YEARLY') {
      return variants.starterYearly ?? null;
    }
    return variants.starterMonthly ?? null;
  }
  if (plan === OrganizationPlan.PRO) {
    if (interval === 'YEARLY') {
      return variants.proYearly ?? null;
    }
    return variants.proMonthly ?? null;
  }
  return null;
}
