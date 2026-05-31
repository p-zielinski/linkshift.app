import { DOCS_ASSISTANT_MAX_CATALOG_PICKS } from './docs-catalog-metadata';

/** Dashboard catalog ids to inject when related feature docs are selected but the UI guide is missing. */
export const DASHBOARD_COMPANION_RULES: ReadonlyArray<{
  dashboardCatalogId: string;
  matchesCatalogId: (catalogId: string) => boolean;
}> = [
  {
    dashboardCatalogId: 'page:guides/dashboard/redirect-rules-in-dashboard',
    matchesCatalogId: (id) =>
      id === 'openapi:redirect-rules' || id.startsWith('page:guides/redirect-rules'),
  },
  {
    dashboardCatalogId: 'page:guides/dashboard/link-maps-in-dashboard',
    matchesCatalogId: (id) =>
      id === 'openapi:link-maps' ||
      id === 'openapi:link-map-entries' ||
      id.startsWith('page:guides/link-map'),
  },
  {
    dashboardCatalogId: 'page:guides/dashboard/domain-groups-in-dashboard',
    matchesCatalogId: (id) => id === 'openapi:domain-groups' || id.startsWith('page:guides/domains'),
  },
  {
    dashboardCatalogId: 'page:guides/dashboard/domains-and-subdomains-in-dashboard',
    matchesCatalogId: (id) =>
      id === 'openapi:domains' ||
      id === 'openapi:subdomains' ||
      id.startsWith('page:guides/domains'),
  },
  {
    dashboardCatalogId: 'page:guides/dashboard/tests-in-dashboard',
    matchesCatalogId: (id) =>
      id === 'openapi:redirect-tests' || id.startsWith('page:guides/redirect-tests'),
  },
  {
    dashboardCatalogId: 'page:guides/dashboard/organization-and-api-keys-in-dashboard',
    matchesCatalogId: (id) =>
      id === 'openapi:organization' || id.startsWith('page:guides/getting-started'),
  },
];

const DASHBOARD_CHANNEL_RE =
  /\b(dashboard|ui|screen|button|wizard|sidebar|in the app|clicks?|menus?)\b/i;

const API_ONLY_CHANNEL_RE =
  /\b(api|endpoint|rest|curl|http|request body|openapi|automate|script|integrat(?:e|ion)|via api)\b/i;

export function questionSignalsDashboardChannel(question: string): boolean {
  return DASHBOARD_CHANNEL_RE.test(question);
}

export function questionSignalsApiOnlyChannel(question: string): boolean {
  return API_ONLY_CHANNEL_RE.test(question);
}

/**
 * Prepends missing dashboard companion catalog ids so UI docs are not dropped when the router
 * picks only API-oriented guides or OpenAPI tags for the same feature area.
 */
export function enrichCatalogIdsWithDashboardCompanions(
  question: string,
  catalogIds: string[],
  validCatalogIds: ReadonlySet<string>,
  maxPicks = DOCS_ASSISTANT_MAX_CATALOG_PICKS,
): string[] {
  const wantsDashboard = questionSignalsDashboardChannel(question);
  const apiOnly = questionSignalsApiOnlyChannel(question);

  if (apiOnly && !wantsDashboard) {
    return catalogIds.slice(0, maxPicks);
  }

  const prepend: string[] = [];

  for (const rule of DASHBOARD_COMPANION_RULES) {
    if (!validCatalogIds.has(rule.dashboardCatalogId)) {
      continue;
    }

    const topicSelected = catalogIds.some((id) => rule.matchesCatalogId(id));
    const dashboardAlreadySelected = catalogIds.includes(rule.dashboardCatalogId);

    if (!topicSelected || dashboardAlreadySelected) {
      continue;
    }

    if (wantsDashboard || !apiOnly) {
      prepend.push(rule.dashboardCatalogId);
    }
  }

  const merged = [...new Set([...prepend, ...catalogIds])];
  return merged.slice(0, maxPicks);
}
