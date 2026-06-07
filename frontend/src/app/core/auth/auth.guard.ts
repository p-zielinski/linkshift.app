import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { type CanActivateFn, type CanMatchFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { DashboardModeService } from '../layout/dashboard-mode.service';
import { AuthStore } from '../store/auth.store';

/**
 * Guard to protect routes that require authentication.
 * On SSR: Always returns true to allow rendering the shell.
 * On Browser: Validates session or attempts to refresh tokens.
 */
export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Skip logic on the server to prevent SSR errors with tokens/cookies
  if (isPlatformServer(platformId)) {
    return true;
  }

  if (authStore.isAuthenticated()) {
    return true;
  }

  return authStore.refreshTokens().pipe(
    switchMap(() => authStore.fetchSession()),
    map(() => true),
    catchError(() => {
      return of(router.parseUrl('/auth'));
    }),
  );
};

/**
 * Guard to protect routes intended for guests (e.g., login page).
 * On SSR: Always returns true to allow the page to render.
 * On Browser: Redirects to the mode landing path when the user is already signed in.
 */
export const guestGuard: CanMatchFn = () => {
  const platformId = inject(PLATFORM_ID);
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const dashboardMode = inject(DashboardModeService);

  // Skip logic on the server
  if (isPlatformServer(platformId)) {
    return true;
  }

  const landingUrl = () => router.parseUrl(dashboardMode.defaultLandingPath());

  if (authStore.isAuthenticated()) {
    return landingUrl();
  }

  return authStore.refreshTokens().pipe(
    switchMap(() => authStore.fetchSession()),
    map(() => (authStore.isAuthenticated() ? landingUrl() : true)),
    catchError(() => of(true)),
  );
};
