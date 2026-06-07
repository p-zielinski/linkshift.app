import type { DashboardMode } from './dashboard-mode.service';

export type UsageDestination = {
  path: string;
  fragment: string | null;
};

/** Where Organization "View full usage" should navigate for the active dashboard mode. */
export function resolveUsageDestination(mode: DashboardMode): UsageDestination {
  if (mode === 'campaign') {
    return { path: '/settings', fragment: 'plan-usage' };
  }

  return { path: '/dashboard', fragment: null };
}
