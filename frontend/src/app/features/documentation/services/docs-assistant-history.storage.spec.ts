import {
  DOCS_ASSISTANT_MAX_THREADS,
  buildThreadTitle,
  createEmptyHistory,
  trimDocsAssistantHistory,
  type DocsAssistantThread,
} from './docs-assistant-history.storage';

function makeThread(id: string, updatedAt: string): DocsAssistantThread {
  return {
    id,
    title: id,
    pageContext: null,
    messages: [],
    createdAt: updatedAt,
    updatedAt,
  };
}

describe('trimDocsAssistantHistory', () => {
  it('keeps newest threads up to the limit', () => {
    const threads = Array.from({ length: DOCS_ASSISTANT_MAX_THREADS + 5 }, (_, index) =>
      makeThread(`t-${index}`, new Date(2026, 0, index + 1).toISOString()),
    );

    const result = trimDocsAssistantHistory({
      version: 1,
      activeThreadId: 't-0',
      threads,
    });

    expect(result.threads).toHaveLength(DOCS_ASSISTANT_MAX_THREADS);
    expect(result.threads[0]?.id).toBe(`t-${DOCS_ASSISTANT_MAX_THREADS + 4}`);
    expect(result.activeThreadId).toBe(`t-${DOCS_ASSISTANT_MAX_THREADS + 4}`);
  });
});

describe('buildThreadTitle', () => {
  it('truncates long questions', () => {
    const title = buildThreadTitle('a'.repeat(120));
    expect(title.length).toBeLessThanOrEqual(80);
    expect(title.endsWith('…')).toBe(true);
  });

  it('returns default for empty input', () => {
    expect(buildThreadTitle('   ')).toBe('New chat');
  });
});

describe('createEmptyHistory', () => {
  it('starts with no threads', () => {
    expect(createEmptyHistory()).toEqual({
      version: 1,
      activeThreadId: null,
      threads: [],
    });
  });
});
