import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { type CanActivateFn, type CanMatchFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
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
 * On Browser: Redirects to dashboard if the user is already logged in.
 */
export const guestGuard: CanMatchFn = () => {
  const platformId = inject(PLATFORM_ID);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Skip logic on the server
  if (isPlatformServer(platformId)) {
    return true;
  }

  if (authStore.isAuthenticated()) {
    return router.parseUrl('/dashboard');
  }

  return authStore.refreshTokens().pipe(
    switchMap(() => authStore.fetchSession()),
    map(() => router.parseUrl('/dashboard')),
    catchError(() => of(true)),
  );
};
