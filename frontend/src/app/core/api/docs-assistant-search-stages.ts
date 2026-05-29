export const DOCS_ASSISTANT_SEARCH_STAGES = [
  'routing',
  'reading',
  'drafting',
] as const;

export type DocsAssistantSearchStage = (typeof DOCS_ASSISTANT_SEARCH_STAGES)[number];

/** In-progress labels — present participle + ellipsis (UX_WRITING). */
export const DOCS_ASSISTANT_SEARCH_STAGE_LABELS: Record<DocsAssistantSearchStage, string> = {
  routing: 'Finding relevant docs…',
  reading: 'Reading documentation…',
  drafting: 'Drafting an answer…',
};

export const DOCS_ASSISTANT_SEARCH_INITIAL_LABEL = 'Searching docs…';

export const DOCS_ASSISTANT_SEARCH_LONG_WAIT_SECONDS = 8;
