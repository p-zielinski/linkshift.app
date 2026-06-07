import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { type CanMatchFn, Router, type UrlSegment, type UrlTree } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { DashboardModeService } from '../layout/dashboard-mode.service';

/**
 * Marketing routes that remain on the public shell when the user is signed in.
 * `/docs` is a separate route tree and is not listed here.
 */
export const SIGNED_IN_PUBLIC_MARKETING_ROOT_SEGMENTS = [
  'alternatives',
  'blog',
  'pricing',
  'use-cases',
  'contact',
  'qr-code-generator',
  'redirect-tester',
  'terms',
  'privacy',
  'cookies',
  'do-not-sell',
] as const;

const publicMarketingRoots = new Set<string>(SIGNED_IN_PUBLIC_MARKETING_ROOT_SEGMENTS);

export function isSignedInPublicMarketingPath(segments: UrlSegment[]): boolean {
  const first = segments[0]?.path;
  return first !== undefined && publicMarketingRoots.has(first);
}

function resolveMarketingShellMatch(
  segments: UrlSegment[],
  authenticated: boolean,
  router: Router,
  dashboardMode: DashboardModeService,
): boolean | UrlTree {
  if (!authenticated) {
    return true;
  }

  if (isSignedInPublicMarketingPath(segments)) {
    return true;
  }

  // Marketing home only — app paths (e.g. /overview, /links) must fall through to AppShell.
  if (segments.length === 0) {
    return router.parseUrl(dashboardMode.defaultLandingPath());
  }

  return false;
}

/**
 * Limits the marketing shell to guests and explicit public marketing pages.
 * Signed-in users on marketing `/` are redirected to the mode default landing.
 */
export const marketingPublicCanMatch: CanMatchFn = (_route, segments) => {
  const platformId = inject(PLATFORM_ID);
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const dashboardMode = inject(DashboardModeService);

  if (isPlatformServer(platformId)) {
    return true;
  }

  if (authStore.isAuthenticated()) {
    return resolveMarketingShellMatch(segments, true, router, dashboardMode);
  }

  return authStore.refreshTokens().pipe(
    switchMap(() => authStore.fetchSession()),
    map(() =>
      resolveMarketingShellMatch(segments, authStore.isAuthenticated(), router, dashboardMode),
    ),
    catchError(() => of(resolveMarketingShellMatch(segments, false, router, dashboardMode))),
  );
};
