import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { type CanActivateFn, Router } from '@angular/router';
import { DashboardModeService } from './dashboard-mode.service';

/**
 * When campaign mode is active, send /dashboard visitors to /overview.
 */
export const campaignDashboardRedirectGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return true;
  }

  const dashboardMode = inject(DashboardModeService);
  if (dashboardMode.isCampaign()) {
    return inject(Router).parseUrl('/overview');
  }

  return true;
};
