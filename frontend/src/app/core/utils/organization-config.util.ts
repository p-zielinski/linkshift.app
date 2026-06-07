import {
  OrganizationConfiguration,
  OrganizationPlan,
  OrganizationSubscription,
} from '@shared/models/organization-config.model';
import { UNMETERED_PLAN_LIMITS } from '@shared/models/plan-limits.model';

export function resolveOrganizationConfig(configuration: unknown): OrganizationConfiguration {
  const parsed = OrganizationConfiguration.fromJson(configuration ?? {});

  if (parsed.activeSubscription.plan !== OrganizationPlan.UNMETERED) {
    return parsed;
  }

  return new OrganizationConfiguration({
    activeSubscription: new OrganizationSubscription({
      ...parsed.activeSubscription,
      limits: { ...UNMETERED_PLAN_LIMITS },
    }),
    subscriptionHistory: parsed.subscriptionHistory,
  });
}
