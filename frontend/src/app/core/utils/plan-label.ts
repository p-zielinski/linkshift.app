import { OrganizationPlan } from '@shared/models/organization-config.model';

export function formatPlanLabel(
  plan: OrganizationPlan | string | null | undefined,
): string {
  switch (plan) {
    case OrganizationPlan.STARTER:
      return 'Basic';
    case OrganizationPlan.PRO:
      return 'Pro';
    case OrganizationPlan.FREE:
      return 'Free';
    default:
      return plan ? String(plan) : '';
  }
}
