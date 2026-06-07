import type { DashboardMode } from './dashboard-mode.service';

export const SHARED_DASHBOARD_MODE_ROUTES = new Set([
  '/links',
  '/tools',
  '/tools/qr-code-generator',
  '/tools/redirect-tester',
  '/organization',
  '/organization/api-keys',
  '/profile',
  '/settings',
]);

export const CAMPAIGN_TO_ADVANCED_ROUTE_MAP: Readonly<Record<string, string>> = {
  '/overview': '/dashboard',
  '/analytics': '/redirect-rules-analytics',
};

export const ADVANCED_TO_CAMPAIGN_ROUTE_MAP: Readonly<Record<string, string>> = {
  '/dashboard': '/overview',
  '/redirect-rules-analytics': '/analytics',
  '/redirect-rules': '/links',
  '/domains': '/settings#hosts',
  '/domain-groups': '/settings#hosts',
  '/subdomains': '/settings#hosts',
  '/link-maps': '/links',
  '/tests': '/tools/redirect-tester',
};

export const LINK_MAP_ID_QUERY_PARAM = 'linkMapId';

type PrefixRouteMapping = {
  prefix: string;
  target: string;
  buildQueryParams?: (path: string) => Record<string, string>;
};

const ADVANCED_TO_CAMPAIGN_PREFIX_ROUTES: ReadonlyArray<PrefixRouteMapping> = [
  {
    prefix: '/link-maps/',
    target: '/links',
    buildQueryParams: (path): Record<string, string> => {
      const suffix = path.slice('/link-maps/'.length);
      const id = suffix.split('/')[0]?.trim();
      return id ? { [LINK_MAP_ID_QUERY_PARAM]: id } : {};
    },
  },
];

export function mergeQueryString(
  sourceQuery: string,
  additions: Record<string, string>,
): string {
  const params = new URLSearchParams(sourceQuery);
  for (const [key, value] of Object.entries(additions)) {
    params.set(key, value);
  }
  return params.toString();
}

export function appendQueryAndFragment(
  pathWithOptionalHash: string,
  query: string,
  sourceFragment: string | null,
): string {
  const hashIndex = pathWithOptionalHash.indexOf('#');
  const mappedPath = hashIndex >= 0 ? pathWithOptionalHash.slice(0, hashIndex) : pathWithOptionalHash;
  const mappedFragment = hashIndex >= 0 ? pathWithOptionalHash.slice(hashIndex + 1) : null;

  let result = mappedPath;
  if (query) {
    result += `?${query}`;
  }
  const resolvedFragment = sourceFragment ?? mappedFragment;
  if (resolvedFragment) {
    result += `#${resolvedFragment}`;
  }
  return result;
}

function resolveMappedPath(
  path: string,
  routeMap: Readonly<Record<string, string>>,
  prefixRoutes: ReadonlyArray<PrefixRouteMapping> = [],
): string | undefined {
  const exact = routeMap[path];
  if (exact) {
    return exact;
  }

  for (const { prefix, target, buildQueryParams } of prefixRoutes) {
    if (path.startsWith(prefix)) {
      const extraQuery = buildQueryParams?.(path) ?? {};
      const mergedQuery = mergeQueryString('', extraQuery);
      return appendQueryAndFragment(target, mergedQuery, null);
    }
  }

  return undefined;
}

export function resolveAdvancedToCampaignRedirectPath(path: string): string | undefined {
  return resolveMappedPath(path, ADVANCED_TO_CAMPAIGN_ROUTE_MAP, ADVANCED_TO_CAMPAIGN_PREFIX_ROUTES);
}

export function defaultLandingPathForMode(mode: DashboardMode): string {
  return mode === 'campaign' ? '/overview' : '/dashboard';
}

export function resolveDashboardAnalyticsPath(mode: DashboardMode): string {
  return mode === 'campaign' ? '/analytics' : '/redirect-rules-analytics';
}

export function resolveDashboardModeToggleNavigation(
  currentUrl: string,
  newMode: DashboardMode,
): string {
  const hashIndex = currentUrl.indexOf('#');
  const withoutHash = hashIndex >= 0 ? currentUrl.slice(0, hashIndex) : currentUrl;
  const fragment = hashIndex >= 0 ? currentUrl.slice(hashIndex + 1) : null;

  const queryIndex = withoutHash.indexOf('?');
  const path = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';

  if (SHARED_DASHBOARD_MODE_ROUTES.has(path)) {
    return currentUrl;
  }

  const routeMap =
    newMode === 'advanced' ? CAMPAIGN_TO_ADVANCED_ROUTE_MAP : ADVANCED_TO_CAMPAIGN_ROUTE_MAP;
  if (newMode === 'campaign') {
    for (const { prefix, target, buildQueryParams } of ADVANCED_TO_CAMPAIGN_PREFIX_ROUTES) {
      if (path.startsWith(prefix)) {
        const extraQuery = buildQueryParams?.(path) ?? {};
        const mergedQuery = mergeQueryString(query, extraQuery);
        return appendQueryAndFragment(target, mergedQuery, fragment);
      }
    }
  }

  const mappedPath = resolveMappedPath(path, routeMap);

  if (mappedPath) {
    return appendQueryAndFragment(mappedPath, query, fragment);
  }

  return defaultLandingPathForMode(newMode);
}
