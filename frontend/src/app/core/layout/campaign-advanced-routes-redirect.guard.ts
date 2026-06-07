import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { type CanActivateFn, Router } from '@angular/router';
import { resolveAdvancedToCampaignRedirectPath } from './dashboard-mode-toggle-navigation.util';
import { DashboardModeService } from './dashboard-mode.service';

/**
 * When campaign mode is active, send advanced-only routes to their campaign equivalents.
 */
export const campaignAdvancedRoutesRedirectGuard: CanActivateFn = (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return true;
  }

  const dashboardMode = inject(DashboardModeService);
  if (!dashboardMode.isCampaign()) {
    return true;
  }

  const path = state.url.split('?')[0]?.split('#')[0] ?? state.url;
  const redirectPath = resolveAdvancedToCampaignRedirectPath(path);
  if (redirectPath) {
    const router = inject(Router);
    const sourceUrl = router.parseUrl(state.url);
    const redirectUrl = router.parseUrl(redirectPath);
    redirectUrl.queryParams = {
      ...sourceUrl.queryParams,
      ...redirectUrl.queryParams,
    };
    redirectUrl.fragment = sourceUrl.fragment ?? redirectUrl.fragment;
    return redirectUrl;
  }

  return true;
};
