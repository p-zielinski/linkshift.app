const DOCS_PATH_IN_PARENS = /\((\/docs\/[^)]+)\)/;

export type DocsAssistantSourceLink = {
  label: string;
  route: string | null;
};

export function parseDocsAssistantSource(source: string): DocsAssistantSourceLink {
  const trimmed = source.trim();
  const match = trimmed.match(DOCS_PATH_IN_PARENS);
  const route = match?.[1] ?? null;
  const label = route ? trimmed.replace(DOCS_PATH_IN_PARENS, '').trim() : trimmed;

  return {
    label: label || trimmed,
    route,
  };
}
