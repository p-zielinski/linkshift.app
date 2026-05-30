export const DOCS_SEARCH_STAGES = ['routing', 'reading', 'drafting'] as const;

export type DocsSearchStage = (typeof DOCS_SEARCH_STAGES)[number];

export type DocsSearchStatusEvent = {
  type: 'status';
  stage: DocsSearchStage;
};

export type DocsSearchResultEvent = {
  type: 'result';
  answer: string;
  sources: string[];
  logId: string | null;
  conversationSummary: string | null;
};

export type DocsSearchErrorEvent = {
  type: 'error';
  details: string;
};

export type DocsSearchStreamEvent = DocsSearchStatusEvent | DocsSearchResultEvent | DocsSearchErrorEvent;

export function formatDocsSearchStreamLine(event: DocsSearchStreamEvent): string {
  return `${JSON.stringify(event)}\n`;
}
