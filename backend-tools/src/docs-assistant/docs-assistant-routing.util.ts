import type { RouterResult } from './docs-assistant-json.util';
import { rankCatalogIdsByQuestion } from './docs-catalog-metadata';

export const DOCS_ASSISTANT_CONVERSATION_DEFAULT_REPLY =
  'Hi — ask me anything about LinkShift documentation.';

export const DOCS_ASSISTANT_OUT_OF_SCOPE_DEFAULT_REPLY =
  'I only answer questions about LinkShift documentation — redirects, domains, link maps, and the API. Ask something about those topics and I\'ll search the docs for you.';

export type DocsAssistantEarlyExitResult = {
  answer: string;
  sources: [];
  logId: null;
};

export type CatalogPickInput = {
  catalogId: string;
  summary: string;
};

export function isRouterEarlyExitIntent(intent: RouterResult['intent']): boolean {
  return intent === 'CONVERSATION' || intent === 'OUT_OF_SCOPE';
}

export function buildRouterEarlyExitResult(routerData: RouterResult): DocsAssistantEarlyExitResult {
  const answer =
    routerData.directReply?.trim() ||
    (routerData.intent === 'OUT_OF_SCOPE'
      ? DOCS_ASSISTANT_OUT_OF_SCOPE_DEFAULT_REPLY
      : DOCS_ASSISTANT_CONVERSATION_DEFAULT_REPLY);

  return { answer, sources: [], logId: null };
}

export function resolveCatalogIdsForDocumentationSearch(
  question: string,
  routerSuggestedIds: string[],
  catalog: CatalogPickInput[],
  trimCatalogPicks: (ids: string[]) => string[],
): string[] {
  let catalogIds = trimCatalogPicks(routerSuggestedIds);
  if (catalogIds.length === 0) {
    catalogIds = trimCatalogPicks(rankCatalogIdsByQuestion(question, catalog));
  }

  return catalogIds;
}

export function buildNoCatalogMatchResult(routerData: RouterResult): DocsAssistantEarlyExitResult {
  const answer = routerData.directReply?.trim() || DOCS_ASSISTANT_OUT_OF_SCOPE_DEFAULT_REPLY;
  return { answer, sources: [], logId: null };
}
