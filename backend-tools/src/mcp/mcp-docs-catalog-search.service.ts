import { Injectable } from '@nestjs/common';
import type { DocsCatalogEntry } from '../docs-assistant/docs-catalog.service';
import { DocsCatalogService } from '../docs-assistant/docs-catalog.service';
import { DOCS_SEARCH_DEFAULT_LIMIT, DOCS_SEARCH_MAX_LIMIT } from './mcp.constants';

export type DocsCatalogSearchHit = Pick<
  DocsCatalogEntry,
  'catalogId' | 'kind' | 'userFacingRef' | 'summary'
>;

@Injectable()
export class McpDocsCatalogSearchService {
  constructor(private readonly docsCatalogService: DocsCatalogService) {}

  searchCatalog(query: string, limit = DOCS_SEARCH_DEFAULT_LIMIT): DocsCatalogSearchHit[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    const cappedLimit = Math.min(Math.max(1, limit), DOCS_SEARCH_MAX_LIMIT);

    return this.docsCatalogService
      .getEntries()
      .filter((entry) => this.matchesQuery(entry, normalizedQuery))
      .slice(0, cappedLimit)
      .map((entry) => ({
        catalogId: entry.catalogId,
        kind: entry.kind,
        userFacingRef: entry.userFacingRef,
        summary: entry.summary,
      }));
  }

  matchesQuery(entry: DocsCatalogEntry, normalizedQuery: string): boolean {
    return (
      entry.catalogId.toLowerCase().includes(normalizedQuery) ||
      entry.userFacingRef.toLowerCase().includes(normalizedQuery) ||
      entry.summary.toLowerCase().includes(normalizedQuery)
    );
  }
}
