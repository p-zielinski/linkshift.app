import { OrganizationPlan } from '@shared/models/organization-config.model';
import {
  DEFAULT_PLAN_LIMITS,
  UNMETERED_PLAN_LIMITS,
} from '@shared/models/plan-limits.model';
import { resolveOrganizationConfig } from './organization-config.util';

describe('resolveOrganizationConfig', () => {
  it('returns metered plan limits unchanged', () => {
    const configuration = {
      activeSubscription: {
        plan: OrganizationPlan.PRO,
        limits: { ...DEFAULT_PLAN_LIMITS, maxUsers: 5 },
      },
    };

    const resolved = resolveOrganizationConfig(configuration);

    expect(resolved.activeSubscription.plan).toBe(OrganizationPlan.PRO);
    expect(resolved.activeSubscription.limits.maxUsers).toBe(5);
    expect(resolved.activeSubscription.limits).not.toBe(UNMETERED_PLAN_LIMITS);
  });

  it('applies unmetered plan limits without mutating the source configuration', () => {
    const configuration = {
      activeSubscription: {
        plan: OrganizationPlan.UNMETERED,
        limits: { ...DEFAULT_PLAN_LIMITS },
      },
    };

    const resolved = resolveOrganizationConfig(configuration);

    expect(resolved.activeSubscription.limits).toEqual(UNMETERED_PLAN_LIMITS);
    expect(configuration.activeSubscription.limits).toEqual(DEFAULT_PLAN_LIMITS);
    expect(resolved.activeSubscription.limits).not.toBe(configuration.activeSubscription.limits);
  });

  it('defaults empty configuration to free plan limits', () => {
    const resolved = resolveOrganizationConfig(undefined);

    expect(resolved.activeSubscription.plan).toBe(OrganizationPlan.FREE);
    expect(resolved.activeSubscription.limits).toEqual(DEFAULT_PLAN_LIMITS);
  });
});
