import {
  OrganizationPlan,
  OrganizationSubscription,
} from '@shared/models/organization-config.model';

export type PlanLimits = OrganizationSubscription['limits'];

export const PLAN_LIMITS: Record<OrganizationPlan, PlanLimits> = {
  [OrganizationPlan.FREE]: {
    maxDomainGroups: 1,
    maxDomainsPerGroup: 1,
    maxTotalDomains: 1,
    maxRulesPerGroup: 15,
    maxTotalRules: 15,
    redirectionLimitPerMinute: 10,
  },
  [OrganizationPlan.STARTER]: {
    maxDomainGroups: 1,
    maxDomainsPerGroup: 10,
    maxTotalDomains: 10,
    maxRulesPerGroup: 250,
    maxTotalRules: 250,
    redirectionLimitPerMinute: 50,
  },
  [OrganizationPlan.PRO]: {
    maxDomainGroups: 2,
    maxDomainsPerGroup: 15,
    maxTotalDomains: 15,
    maxRulesPerGroup: 500,
    maxTotalRules: 500,
    redirectionLimitPerMinute: 100,
  },
};

export const CHECKOUT_PLANS: OrganizationPlan[] = [
  OrganizationPlan.STARTER,
  OrganizationPlan.PRO,
];

export function getPlanLimits(plan: OrganizationPlan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS[OrganizationPlan.FREE];
}

export function getVariantIdForPlan(plan: OrganizationPlan): string | null {
  if (plan === OrganizationPlan.STARTER) {
    return process.env.LEMON_SQUEEZY_VARIANT_STARTER_ID ?? null;
  }
  if (plan === OrganizationPlan.PRO) {
    return process.env.LEMON_SQUEEZY_VARIANT_PRO_ID ?? null;
  }
  return null;
}
