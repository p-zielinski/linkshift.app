import {
  OrganizationPlan,
  OrganizationSubscription,
} from '@shared/models/organization-config.model';

export type PlanLimits = OrganizationSubscription['limits'];

export const PLAN_LIMITS: Record<
  Exclude<OrganizationPlan, OrganizationPlan.CUSTOM>,
  PlanLimits
> = {
  [OrganizationPlan.FREE]: {
    maxDomainGroups: 1,
    maxDomainsPerGroup: 1,
    maxTotalDomains: 1,
    maxRulesPerGroup: 15,
    maxTotalRules: 15,
    maxTestsPerGroup: 30,
    maxTotalTests: 30,
    maxUsers: 1,
    redirectionLimitPerMinute: 10,
  },
  [OrganizationPlan.STARTER]: {
    maxDomainGroups: 1,
    maxDomainsPerGroup: 10,
    maxTotalDomains: 10,
    maxRulesPerGroup: 250,
    maxTotalRules: 250,
    maxTestsPerGroup: 500,
    maxTotalTests: 500,
    maxUsers: 3,
    redirectionLimitPerMinute: 50,
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
  },
};

export const CHECKOUT_PLANS: OrganizationPlan[] = [
  OrganizationPlan.STARTER,
  OrganizationPlan.PRO,
];

export function getPlanLimits(
  plan: Exclude<OrganizationPlan, OrganizationPlan.CUSTOM>,
): PlanLimits {
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
  interval: OrganizationSubscription['interval'],
  variants: VariantIdMap,
): string | null {
  if (plan === OrganizationPlan.STARTER) {
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
