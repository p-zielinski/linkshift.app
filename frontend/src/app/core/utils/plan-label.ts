import { OrganizationPlan } from '@shared/models/organization-config.model';

export function formatPlanLabel(
  plan: OrganizationPlan | string | null | undefined,
  planName?: string | null,
): string {
  if (planName) {
    return planName;
  }
  switch (plan) {
    case OrganizationPlan.STARTER:
      return 'Basic';
    case OrganizationPlan.PRO:
      return 'Pro';
    case OrganizationPlan.FREE:
      return 'Free';
    case OrganizationPlan.CUSTOM:
      return 'Custom';
    default:
      return plan ? String(plan) : '';
  }
}
