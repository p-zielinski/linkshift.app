import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { type CanMatchFn, type UrlSegment } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthStore } from '../store/auth.store';

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
  'dpa',
  'cookies',
  'do-not-sell',
] as const;

const publicMarketingRoots = new Set<string>(SIGNED_IN_PUBLIC_MARKETING_ROOT_SEGMENTS);

export function isSignedInPublicMarketingPath(segments: UrlSegment[]): boolean {
  if (segments.length === 0) {
    return true;
  }

  const first = segments[0]?.path;
  return first !== undefined && publicMarketingRoots.has(first);
}

function resolveMarketingShellMatch(
  segments: UrlSegment[],
  authenticated: boolean,
): boolean {
  if (!authenticated) {
    return true;
  }

  return isSignedInPublicMarketingPath(segments);
}

/**
 * Limits the marketing shell to guests and public marketing pages (including `/`).
 * App paths (e.g. /overview, /links) fall through to AppShell when signed in.
 */
export const marketingPublicCanMatch: CanMatchFn = (_route, segments) => {
  const platformId = inject(PLATFORM_ID);
  const authStore = inject(AuthStore);

  if (isPlatformServer(platformId)) {
    return true;
  }

  if (authStore.isAuthenticated()) {
    return resolveMarketingShellMatch(segments, true);
  }

  return authStore.refreshTokens().pipe(
    switchMap(() => authStore.fetchSession()),
    map(() => resolveMarketingShellMatch(segments, authStore.isAuthenticated())),
    catchError(() => of(resolveMarketingShellMatch(segments, false))),
  );
};
