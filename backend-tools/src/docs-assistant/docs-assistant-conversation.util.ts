export const DOCS_ASSISTANT_MAX_CONVERSATION_SUMMARY_CHARS = 2_000;

export function trimConversationSummary(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length <= DOCS_ASSISTANT_MAX_CONVERSATION_SUMMARY_CHARS) {
    return trimmed;
  }

  return `${trimmed.slice(0, DOCS_ASSISTANT_MAX_CONVERSATION_SUMMARY_CHARS - 1)}…`;
}

/** Prefer model-updated summary; keep the previous summary when the model omits or clears it. */
export function resolveConversationSummary(
  previous: string | null | undefined,
  next: string | null | undefined,
): string | null {
  return trimConversationSummary(next) ?? trimConversationSummary(previous);
}
