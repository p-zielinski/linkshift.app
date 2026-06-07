import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { type CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { DashboardModeService } from '../layout/dashboard-mode.service';

/** Placeholder for the wildcard route; navigation is handled by the guard. */
@Component({
  standalone: true,
  template: '',
})
export class AppFallbackRedirectPageComponent {}

/**
 * Wildcard fallback: guests go to marketing `/`, signed-in users to mode default landing.
 * On SSR, unknown paths resolve to marketing `/` (auth is resolved on the client).
 */
export const appFallbackRedirectGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const dashboardMode = inject(DashboardModeService);

  if (isPlatformServer(platformId)) {
    return router.parseUrl('/');
  }

  const landingPath = dashboardMode.defaultLandingPath();

  if (authStore.isAuthenticated()) {
    return router.parseUrl(landingPath);
  }

  return authStore.refreshTokens().pipe(
    switchMap(() => authStore.fetchSession()),
    map(() => router.parseUrl(landingPath)),
    catchError(() => of(router.parseUrl('/'))),
  );
};
