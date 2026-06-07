import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { type CanActivateFn, Router } from '@angular/router';
import { CAMPAIGN_TO_ADVANCED_ROUTE_MAP } from './dashboard-mode-toggle-navigation.util';
import { DashboardModeService } from './dashboard-mode.service';

/**
 * When advanced mode is active, send campaign-only routes to their advanced equivalents.
 */
export const advancedCampaignRoutesRedirectGuard: CanActivateFn = (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return true;
  }

  const dashboardMode = inject(DashboardModeService);
  if (!dashboardMode.isAdvanced()) {
    return true;
  }

  const path = state.url.split('?')[0]?.split('#')[0] ?? state.url;
  const redirectPath = CAMPAIGN_TO_ADVANCED_ROUTE_MAP[path];
  if (redirectPath) {
    const router = inject(Router);
    const sourceUrl = router.parseUrl(state.url);
    const redirectUrl = router.parseUrl(redirectPath);
    redirectUrl.queryParams = sourceUrl.queryParams;
    redirectUrl.fragment = sourceUrl.fragment;
    return redirectUrl;
  }

  return true;
};
