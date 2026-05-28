import { buildOpenApiOutline } from './docs-openapi-outline';
import {
  buildOpenApiCatalogEntry,
  buildOpenApiContextPreamble,
  buildPageCatalogEntry,
  DOCS_ASSISTANT_MAX_CATALOG_PICKS,
  parseSummaryFrontmatter,
  rankCatalogIdsByQuestion,
  toOpenApiSlicePath,
  toOpenApiUserFacingRef,
  toPageUserFacingRef,
} from './docs-catalog-metadata';

describe('docs-catalog-metadata', () => {
  it('parses openapi summary frontmatter with canonical contract and slice source', () => {
    const sample = `---
source: shared/docs/openapi/by-tag/domain-groups.openapi.json
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domain Groups
sliceType: openapi-by-tag
---

# summary`;

    const { frontmatter, body } = parseSummaryFrontmatter(sample);
    expect(frontmatter.source).toBe('shared/docs/openapi/by-tag/domain-groups.openapi.json');
    expect(frontmatter.canonicalOpenApi).toBe('shared/docs/openapi/linkshift-api-keys.openapi.yaml');
    expect(frontmatter.openApiTag).toBe('Domain Groups');
    expect(body.trim()).toBe('# summary');
  });

  it('maps slice source paths for internal loader only', () => {
    expect(toOpenApiSlicePath('shared/docs/openapi/by-tag/domain-groups.openapi.json')).toBe(
      'openapi/by-tag/domain-groups.openapi.json',
    );
    expect(toOpenApiSlicePath('shared/docs/openapi/linkshift-api-keys.openapi.yaml')).toBeNull();
  });

  it('builds public API reference citations instead of slice paths', () => {
    expect(toOpenApiUserFacingRef('Domain Groups')).toBe(
      'API reference: Domain Groups (/docs/reference) — LinkShift API keys OpenAPI',
    );
    expect(toPageUserFacingRef('pages/guides/link-maps.md')).toBe(
      'Guide: Link Maps (/docs/guides/link-maps)',
    );
    expect(toPageUserFacingRef('pages/reference.md')).toBe('API reference (/docs/reference)');
  });

  it('builds openapi catalog entries with guide companion pages', () => {
    const entry = buildOpenApiCatalogEntry(
      'Domain Groups',
      'openapi/by-tag/domain-groups.openapi.json',
      'summary text',
      'pages/guides/domains-and-groups.md',
    );

    expect(entry.catalogId).toBe('openapi:domain-groups');
    expect(entry.userFacingRef).toContain('/docs/reference');
    expect(entry.contentSources).toHaveLength(2);
    expect(entry.contentSources[0]?.type).toBe('page-md');
    expect(entry.contentSources[1]?.type).toBe('openapi-slice');
  });

  it('builds page catalog entries with docs routes', () => {
    const entry = buildPageCatalogEntry('pages/concepts/redirect-engine-concepts.md', 'summary');
    expect(entry.catalogId).toBe('page:concepts/redirect-engine-concepts');
    expect(entry.userFacingRef).toContain('/docs/concepts/redirect-engine-concepts');
  });

  it('includes canonical contract preamble for generator context', () => {
    const preamble = buildOpenApiContextPreamble('Domain Groups');
    expect(preamble).toContain('/docs/reference');
    expect(preamble).toContain('linkshift-api-keys.openapi.yaml');
    expect(preamble).toContain('«Domain Groups»');
    expect(preamble).not.toContain('by-tag');
  });

  it('ranks catalog ids by question keywords when router fails', () => {
    const ranked = rankCatalogIdsByQuestion('How do I list domain groups?', [
      { catalogId: 'openapi:domain-groups', summary: 'domain groups CRUD endpoints' },
      { catalogId: 'page:guides/link-maps', summary: 'link maps guide' },
    ]);

    expect(ranked[0]).toBe('openapi:domain-groups');
  });

  it('caps keyword fallback ranking at DOCS_ASSISTANT_MAX_CATALOG_PICKS', () => {
    const entries = Array.from({ length: 12 }, (_, index) => ({
      catalogId: `page:guides/topic-${index}`,
      summary: 'redirect rules configuration matching',
    }));

    const ranked = rankCatalogIdsByQuestion('redirect rules configuration', entries);

    expect(ranked).toHaveLength(DOCS_ASSISTANT_MAX_CATALOG_PICKS);
  });

  it('maps openapi summary source to tag-based outlines', () => {
    const { frontmatter } = parseSummaryFrontmatter(`---
source: shared/docs/openapi/by-tag/domain-groups.openapi.json
openApiTag: Domain Groups
---`);

    const outline = buildOpenApiOutline({
      info: { title: 'LinkShift API — Domain Groups', version: '1' },
      'x-linkshift': { sourceTag: frontmatter.openApiTag },
      paths: {
        '/api/v1/domain-groups': {
          get: { tags: ['Domain Groups'], summary: 'List groups' },
        },
      },
    });

    expect(outline).toContain('Domain Groups');
    expect(outline).toContain('GET /api/v1/domain-groups');
  });
});
