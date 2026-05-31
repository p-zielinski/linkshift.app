import type { DocsCatalogEntry, DocsCatalogKind, DocsContentSource } from './docs-catalog.service';

export const CANONICAL_OPENAPI_YAML = 'openapi/linkshift-api-keys.openapi.yaml';

/** Hard cap on catalog entries passed to the generator (router + keyword fallback). */
export const DOCS_ASSISTANT_MAX_CATALOG_PICKS = 8;

export interface SummaryFrontmatter {
  source?: string;
  canonicalOpenApi?: string;
  openApiTag?: string;
  sliceType?: string;
}

export function parseSummaryFrontmatter(raw: string): { frontmatter: SummaryFrontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatter: SummaryFrontmatter = {};
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key === 'source' || key === 'llmSlice' || key === 'summarizedFrom') {
      frontmatter.source = value;
    } else if (key === 'canonicalOpenApi') {
      frontmatter.canonicalOpenApi = value;
    } else if (key === 'openApiTag') {
      frontmatter.openApiTag = value;
    } else if (key === 'sliceType') {
      frontmatter.sliceType = value;
    }
  }

  return { frontmatter, body: match[2] };
}

export function toDocsPagePath(source: string | undefined): string | null {
  if (!source) {
    return null;
  }

  const normalized = source.replace(/^shared\/docs\//, '').replaceAll('\\', '/');
  if (!normalized.startsWith('pages/') || !normalized.endsWith('.md')) {
    return null;
  }

  return normalized;
}

export function toOpenApiSlicePath(source: string | undefined): string | null {
  if (!source) {
    return null;
  }

  const normalized = source.replace(/^shared\/docs\//, '').replaceAll('\\', '/');
  if (!normalized.startsWith('openapi/by-tag/') || !normalized.endsWith('.openapi.json')) {
    return null;
  }

  return normalized;
}

/** Public docs URL for a manifest page source path (see shared/docs/manifest.yaml routes). */
export function resolveDocsPageRoute(pagePath: string): string {
  const slug = pagePath.replace(/^pages\//, '').replace(/\.md$/i, '');

  if (slug === 'overview') {
    return '/docs';
  }

  if (slug === 'reference') {
    return '/docs/reference';
  }

  // Dashboard UI guides live under pages/guides/dashboard/* but routes are flat /docs/guides/<slug>.
  if (slug.startsWith('guides/dashboard/')) {
    return `/docs/guides/${slug.slice('guides/dashboard/'.length)}`;
  }

  return `/docs/${slug}`;
}

export function toPageUserFacingRef(pagePath: string): string {
  const slug = pagePath.replace(/^pages\//, '').replace(/\.md$/i, '');
  const route = resolveDocsPageRoute(pagePath);

  if (slug === 'overview') {
    return 'Documentation overview (/docs)';
  }

  if (slug === 'reference') {
    return 'API reference (/docs/reference)';
  }

  if (slug.startsWith('guides/')) {
    const labelSlug = slug.replace(/^guides\//, '').replace(/^dashboard\//, '');
    return `Guide: ${humanizeSlug(labelSlug)} (${route})`;
  }

  if (slug.startsWith('concepts/')) {
    return `Concept: ${humanizeSlug(slug.replace(/^concepts\//, ''))} (${route})`;
  }

  if (slug.startsWith('intro/')) {
    return `${humanizeSlug(slug.replace(/^intro\//, ''))} (${route})`;
  }

  return `Documentation page (${route})`;
}

export function toOpenApiUserFacingRef(openApiTag: string): string {
  return `API reference: ${openApiTag} (/docs/reference) — LinkShift API keys OpenAPI`;
}

export function buildOpenApiContextPreamble(openApiTag: string): string {
  return [
    `Canonical contract: LinkShift API keys OpenAPI (\`/docs/reference\`, \`${CANONICAL_OPENAPI_YAML}\`).`,
    `Operations below are scoped to OpenAPI tag «${openApiTag}».`,
    'Do not cite internal repository paths or per-tag slice files.',
  ].join('\n');
}

export function slugifyTag(tagName: string): string {
  return tagName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildPageCatalogEntry(pagePath: string, summary: string): DocsCatalogEntry {
  const slug = pagePath.replace(/^pages\//, '').replace(/\.md$/i, '');

  return {
    catalogId: `page:${slug}`,
    kind: 'page',
    userFacingRef: toPageUserFacingRef(pagePath),
    summary,
    contentSources: [{ type: 'page-md', docsRelativePath: pagePath }],
  };
}

export function buildOpenApiCatalogEntry(
  openApiTag: string,
  slicePath: string,
  summary: string,
  guidePage: string | undefined,
  dashboardPage?: string,
): DocsCatalogEntry {
  const contentSources: DocsContentSource[] = [
    {
      type: 'openapi-slice',
      docsRelativePath: slicePath,
      openApiTag,
    },
  ];

  if (guidePage) {
    contentSources.unshift({ type: 'page-md', docsRelativePath: guidePage });
  }

  if (dashboardPage && dashboardPage !== guidePage) {
    contentSources.unshift({ type: 'page-md', docsRelativePath: dashboardPage });
  }

  return {
    catalogId: `openapi:${slugifyTag(openApiTag)}`,
    kind: 'openapi-tag',
    userFacingRef: toOpenApiUserFacingRef(openApiTag),
    summary,
    contentSources,
  };
}

export function sectionTitleForSource(source: DocsContentSource, entry: DocsCatalogEntry): string {
  if (source.type === 'page-md') {
    return toPageUserFacingRef(source.docsRelativePath);
  }

  if (source.type === 'openapi-slice' && source.openApiTag) {
    return toOpenApiUserFacingRef(source.openApiTag);
  }

  return entry.userFacingRef;
}

export function rankCatalogIdsByQuestion(
  question: string,
  entries: Array<{ catalogId: string; summary: string }>,
  limit = DOCS_ASSISTANT_MAX_CATALOG_PICKS,
): string[] {
  const tokens = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);

  if (tokens.length === 0) {
    return [];
  }

  const scored = entries
    .map((entry) => {
      const haystack = `${entry.catalogId} ${entry.summary}`.toLowerCase();
      const score = tokens.reduce((total, token) => (haystack.includes(token) ? total + 1 : total), 0);
      return { catalogId: entry.catalogId, score };
    })
    .filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score);

  return scored.slice(0, limit).map((row) => row.catalogId);
}

function humanizeSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
