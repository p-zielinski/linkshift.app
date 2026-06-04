import type { DocsCatalogEntry } from '../docs-assistant/docs-catalog.service';
import { McpDocsCatalogSearchService } from './mcp-docs-catalog-search.service';

describe('McpDocsCatalogSearchService', () => {
  const entries: DocsCatalogEntry[] = [
    {
      catalogId: 'page:guides/redirect-rules',
      kind: 'page',
      userFacingRef: '/docs/guides/redirect-rules',
      summary: 'How redirect rules work in LinkShift',
      contentSources: [],
    },
    {
      catalogId: 'openapi:domain-groups',
      kind: 'openapi-tag',
      userFacingRef: 'API: Domain Groups',
      summary: 'Domain group endpoints',
      contentSources: [],
    },
  ];

  const catalogService = {
    getEntries: jest.fn(() => entries),
  };

  const service = new McpDocsCatalogSearchService(catalogService as never);

  it('matches catalogId, userFacingRef, and summary case-insensitively', () => {
    expect(service.searchCatalog('REDIRECT')).toHaveLength(1);
    expect(service.searchCatalog('domain group')).toHaveLength(1);
    expect(service.searchCatalog('page:guides')).toHaveLength(1);
  });

  it('returns an empty list for blank queries', () => {
    expect(service.searchCatalog('   ')).toEqual([]);
  });

  it('caps results at the requested limit', () => {
    expect(service.searchCatalog('linkshift', 1)).toHaveLength(1);
  });

  it('matches individual fields via matchesQuery', () => {
    expect(service.matchesQuery(entries[0], 'redirect-rules')).toBe(true);
    expect(service.matchesQuery(entries[1], 'unknown-term')).toBe(false);
  });
});
