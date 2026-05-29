import {
  DOCS_ASSISTANT_MAX_CONVERSATION_SUMMARY_CHARS,
  resolveConversationSummary,
  trimConversationSummary,
} from './docs-assistant-conversation.util';

describe('docs-assistant-conversation.util', () => {
  it('trims and drops empty summaries', () => {
    expect(trimConversationSummary('  hello  ')).toBe('hello');
    expect(trimConversationSummary('')).toBeNull();
    expect(trimConversationSummary(null)).toBeNull();
  });

  it('truncates summaries over the character cap', () => {
    const long = 'a'.repeat(DOCS_ASSISTANT_MAX_CONVERSATION_SUMMARY_CHARS + 50);
    const trimmed = trimConversationSummary(long);

    expect(trimmed).not.toBeNull();
    expect(trimmed!.length).toBe(DOCS_ASSISTANT_MAX_CONVERSATION_SUMMARY_CHARS);
    expect(trimmed!.endsWith('…')).toBe(true);
  });

  it('prefers the next summary and falls back to the previous one', () => {
    expect(resolveConversationSummary('old topics', 'updated topics')).toBe('updated topics');
    expect(resolveConversationSummary('old topics', '')).toBe('old topics');
    expect(resolveConversationSummary(null, null)).toBeNull();
  });
});
