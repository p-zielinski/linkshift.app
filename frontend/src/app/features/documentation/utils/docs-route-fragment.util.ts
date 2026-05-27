import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { parseDocsFragment } from './docs-scroll.util';

export function extractDocsFragmentFromHref(href: string): string | null {
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) {
    return null;
  }

  const raw = href.slice(hashIndex + 1);
  if (!raw) {
    return null;
  }

  return parseDocsFragment(raw);
}

export function getDocsFragmentFromUrl(url: string): string | null {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) {
    return null;
  }

  return extractDocsFragmentFromHref(url.slice(hashIndex));
}

export function getDocsRouteFragment(router: Router): string | null {
  const fromRoute = findFragmentInRouteTree(router.routerState.snapshot.root);
  if (fromRoute) {
    return fromRoute;
  }

  const fromRouterUrl = router.parseUrl(router.url).fragment;
  if (fromRouterUrl) {
    return fromRouterUrl;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const hash = window.location.hash;
  if (hash.length <= 1) {
    return null;
  }

  return decodeURIComponent(hash.slice(1));
}

/** Prefer NavigationEnd url — avoids stale `location.hash` during transitions. */
export function getDocsNavigationFragment(
  router: Router,
  navigationUrl?: string,
): string | null {
  if (navigationUrl) {
    const fromNavigation = getDocsFragmentFromUrl(navigationUrl);
    if (fromNavigation) {
      return fromNavigation;
    }
  }

  const fromRoute = findFragmentInRouteTree(router.routerState.snapshot.root);
  if (fromRoute) {
    return fromRoute;
  }

  return router.parseUrl(router.url).fragment ?? null;
}

/** Deepest non-null fragment on the activated route tree (Angular may attach it above the leaf). */
export function findFragmentInRouteTree(route: ActivatedRouteSnapshot): string | null {
  let found: string | null = null;
  let current: ActivatedRouteSnapshot | null = route;

  while (current) {
    if (current.fragment) {
      found = current.fragment;
    }
    current = current.firstChild;
  }

  return found;
}
