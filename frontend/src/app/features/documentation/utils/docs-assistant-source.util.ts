const DOCS_PATH_IN_PARENS = /\((\/docs\/[^)]+)\)/;
/** Legacy Ask docs citations used file paths; manifest routes omit the dashboard folder. */
const LEGACY_DASHBOARD_GUIDE_ROUTE = /^\/docs\/guides\/dashboard\/([^/]+)$/;

export type DocsAssistantSourceLink = {
  label: string;
  route: string | null;
};

export function normalizeDocsAssistantSourceRoute(route: string): string {
  const legacy = route.match(LEGACY_DASHBOARD_GUIDE_ROUTE);
  return legacy ? `/docs/guides/${legacy[1]}` : route;
}

export function parseDocsAssistantSource(source: string): DocsAssistantSourceLink {
  const trimmed = source.trim();
  const match = trimmed.match(DOCS_PATH_IN_PARENS);
  const route = match?.[1] ? normalizeDocsAssistantSourceRoute(match[1]) : null;
  const label = route ? trimmed.replace(DOCS_PATH_IN_PARENS, '').trim() : trimmed;

  return {
    label: label || trimmed,
    route,
  };
}
