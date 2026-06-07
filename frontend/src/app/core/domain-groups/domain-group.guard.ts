import { computed, inject, PLATFORM_ID } from '@angular/core';
import { type ActivatedRouteSnapshot, type CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomainGroupStore } from '../store/domain-group.store';
import { DEFAULT_LIST_KEY, isExpired } from '../store/entity/entity-store.utils';
import { isPlatformServer } from '@angular/common';
import { DashboardModeService } from '../layout/dashboard-mode.service';

export const DOMAIN_GROUPS_REQUIRED_MESSAGE = 'Add a site to continue';

/** Redirect when advanced mode has no domain groups yet. */
export const ADVANCED_MISSING_DOMAIN_GROUPS_PATH = '/domain-groups?openCreate=1';

function missingDomainGroupsRedirectPath(dashboardMode: DashboardModeService): string {
  if (dashboardMode.isAdvanced()) {
    return ADVANCED_MISSING_DOMAIN_GROUPS_PATH;
  }

  return dashboardMode.defaultLandingPath();
}

const DOMAIN_GROUPS_REDIRECT_SNACKBAR_DEBOUNCE_MS = 3_000;

let lastDomainGroupsRedirectSnackAt = 0;

/** Resets snackbar debounce state for unit tests. */
export function resetDomainGroupsRequiredSnackbarDebounceForTests(): void {
  lastDomainGroupsRedirectSnackAt = 0;
}

function showDomainGroupsRequiredMessage(snackBar: MatSnackBar): void {
  const now = Date.now();
  if (now - lastDomainGroupsRedirectSnackAt < DOMAIN_GROUPS_REDIRECT_SNACKBAR_DEBOUNCE_MS) {
    return;
  }

  lastDomainGroupsRedirectSnackAt = now;
  snackBar.open(DOMAIN_GROUPS_REQUIRED_MESSAGE, 'Dismiss', { duration: 4_000 });
}

export const domainGroupsRequiredGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const platformId = inject(PLATFORM_ID);
  const domainGroupStore = inject(DomainGroupStore);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const dashboardMode = inject(DashboardModeService);
  const redirectForMissingDomainGroups = () => {
    showDomainGroupsRequiredMessage(snackBar);
    return router.parseUrl(missingDomainGroupsRedirectPath(dashboardMode));
  };

  if (route.data['skipDomainGroupsInCampaign'] === true && dashboardMode.isCampaign()) {
    return true;
  }

  if (isPlatformServer(platformId)) {
    return true;
  }

  const listResult = domainGroupStore.selectListResult(DEFAULT_LIST_KEY);
  const listExpiration = computed(
    () => domainGroupStore.expirationDates()[DEFAULT_LIST_KEY] ?? null
  );

  const initialResult = listResult();
  const currentExpiration = listExpiration();

  if (initialResult && !isExpired(currentExpiration)) {
    return initialResult.data.length > 0 ? true : redirectForMissingDomainGroups();
  }

  domainGroupStore.searchList(undefined, true);

  const queryState = computed(() => ({
    result: listResult(),
    isLoading: domainGroupStore.isLoading()[DEFAULT_LIST_KEY]
  }));

  return toObservable(queryState).pipe(
    filter(({ result, isLoading }) => {
      return !isLoading && result !== null && result !== initialResult;
    }),
    map(({ result }) => result),
    take(1),
    map((result) => (result!.data.length > 0 ? true : redirectForMissingDomainGroups()))
  );
};
