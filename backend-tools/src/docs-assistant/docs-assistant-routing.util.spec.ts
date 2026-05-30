import { RouterResultSchema } from './docs-assistant-json.util';
import {
  buildNoCatalogMatchResult,
  buildRouterEarlyExitResult,
  DOCS_ASSISTANT_OUT_OF_SCOPE_DEFAULT_REPLY,
  isRouterEarlyExitIntent,
  resolveCatalogIdsForDocumentationSearch,
} from './docs-assistant-routing.util';

describe('docs-assistant-routing.util', () => {
  it('parses OUT_OF_SCOPE router JSON', () => {
    const parsed = RouterResultSchema.parse({
      intent: 'OUT_OF_SCOPE',
      directReply: 'I only cover LinkShift docs.',
      suggestedCatalogIds: [],
      conversationSummary: 'User asked off-topic; assistant declined.',
    });

    expect(parsed.intent).toBe('OUT_OF_SCOPE');
  });

  it('treats CONVERSATION and OUT_OF_SCOPE as early exit intents', () => {
    expect(isRouterEarlyExitIntent('CONVERSATION')).toBe(true);
    expect(isRouterEarlyExitIntent('OUT_OF_SCOPE')).toBe(true);
    expect(isRouterEarlyExitIntent('DOCUMENTATION_SEARCH')).toBe(false);
  });

  it('builds default out-of-scope reply when router omits directReply', () => {
    const result = buildRouterEarlyExitResult({
      intent: 'OUT_OF_SCOPE',
      directReply: null,
      suggestedCatalogIds: [],
      conversationSummary: null,
    });

    expect(result.answer).toBe(DOCS_ASSISTANT_OUT_OF_SCOPE_DEFAULT_REPLY);
    expect(result.sources).toEqual([]);
    expect(result.logId).toBeNull();
  });

  it('returns empty catalog ids for nonsense questions with no keyword matches', () => {
    const catalog = [
      { catalogId: 'openapi:domain-groups', summary: 'domain groups CRUD endpoints' },
      { catalogId: 'page:guides/link-maps', summary: 'link maps guide' },
    ];

    const catalogIds = resolveCatalogIdsForDocumentationSearch(
      'tell me about oceans and stars',
      [],
      catalog,
      (ids) => ids,
    );

    expect(catalogIds).toEqual([]);
  });

  it('skips generator path when documentation search has no catalog match', () => {
    const result = buildNoCatalogMatchResult({
      intent: 'DOCUMENTATION_SEARCH',
      directReply: null,
      suggestedCatalogIds: [],
      conversationSummary: null,
    });

    expect(result.answer).toBe(DOCS_ASSISTANT_OUT_OF_SCOPE_DEFAULT_REPLY);
    expect(result.logId).toBeNull();
  });

  it('uses router directReply when documentation search has no catalog match', () => {
    const result = buildNoCatalogMatchResult({
      intent: 'DOCUMENTATION_SEARCH',
      directReply: 'That topic is outside LinkShift documentation.',
      suggestedCatalogIds: [],
      conversationSummary: null,
    });

    expect(result.answer).toBe('That topic is outside LinkShift documentation.');
  });
});
