import { resolvePageWorkspaceAllowAllSites } from './attach-page-workspace.util';

/** Only `/links` may select "All sites" in advanced mode when multiple groups exist. */
export const ADVANCED_ALL_SITES_ROUTE = '/links' as const;

/** Routes where the page-level Workspace selector is meaningful. */
export const WORKSPACE_CONTEXT_EXACT_ROUTES = [
  ADVANCED_ALL_SITES_ROUTE,
  '/redirect-rules-analytics',
  '/domains',
  '/subdomains',
  '/link-maps',
  '/tests',
] as const;

/** Route prefixes (exact path or subpaths) that use workspace context. */
export const WORKSPACE_CONTEXT_ROUTE_PREFIXES = ['/redirect-rules'] as const;

export function normalizeRoutePath(path: string): string {
  const withoutQueryOrHash = path.split('?')[0]?.split('#')[0] ?? path;
  if (withoutQueryOrHash === '/') {
    return '/';
  }
  return withoutQueryOrHash.replace(/\/+$/, '') || '/';
}

export function routeUsesWorkspaceContext(path: string): boolean {
  const normalized = normalizeRoutePath(path);

  if (
    (WORKSPACE_CONTEXT_EXACT_ROUTES as readonly string[]).includes(normalized)
  ) {
    return true;
  }

  return WORKSPACE_CONTEXT_ROUTE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/** Whether shell group reconcile may keep an empty workspace selection. */
export function resolveShellReconcileAllowEmptySelection(params: {
  groupCount: number;
  isCampaignMode: boolean;
  currentRoutePath: string;
}): boolean {
  if (!routeUsesWorkspaceContext(params.currentRoutePath)) {
    return resolvePageWorkspaceAllowAllSites({
      groupCount: params.groupCount,
      isCampaignMode: params.isCampaignMode,
      allowEmptySelection: undefined,
    });
  }

  const isLinksRoute =
    normalizeRoutePath(params.currentRoutePath) === ADVANCED_ALL_SITES_ROUTE;

  return resolvePageWorkspaceAllowAllSites({
    groupCount: params.groupCount,
    isCampaignMode: params.isCampaignMode,
    allowEmptySelection: isLinksRoute ? true : undefined,
  });
}

