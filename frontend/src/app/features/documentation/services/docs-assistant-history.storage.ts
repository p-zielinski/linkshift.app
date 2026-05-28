export const DOCS_ASSISTANT_HISTORY_STORAGE_KEY = 'linkshift_docs_assistant_history_v1';
export const DOCS_ASSISTANT_MAX_THREADS = 20;
export const DOCS_ASSISTANT_THREAD_TITLE_MAX = 80;

export type DocsAssistantRating = 1 | -1 | 0;

export type DocsAssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  logId?: string | null;
  rating?: DocsAssistantRating | null;
  createdAt: string;
};

export type DocsAssistantThread = {
  id: string;
  title: string;
  pageContext: string | null;
  messages: DocsAssistantMessage[];
  createdAt: string;
  updatedAt: string;
};

export type DocsAssistantHistorySnapshot = {
  version: 1;
  activeThreadId: string | null;
  threads: DocsAssistantThread[];
};

export function createEmptyHistory(): DocsAssistantHistorySnapshot {
  return {
    version: 1,
    activeThreadId: null,
    threads: [],
  };
}

export function trimDocsAssistantHistory(
  snapshot: DocsAssistantHistorySnapshot,
  maxThreads = DOCS_ASSISTANT_MAX_THREADS,
): DocsAssistantHistorySnapshot {
  const sorted = [...snapshot.threads].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
  );
  const threads = sorted.slice(0, maxThreads);
  const activeThreadId =
    snapshot.activeThreadId && threads.some((thread) => thread.id === snapshot.activeThreadId)
      ? snapshot.activeThreadId
      : (threads[0]?.id ?? null);

  return {
    version: 1,
    activeThreadId,
    threads,
  };
}

export function buildThreadTitle(question: string): string {
  const normalized = question.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return 'New chat';
  }

  if (normalized.length <= DOCS_ASSISTANT_THREAD_TITLE_MAX) {
    return normalized;
  }

  return `${normalized.slice(0, DOCS_ASSISTANT_THREAD_TITLE_MAX - 1)}…`;
}

export function readDocsAssistantHistory(): DocsAssistantHistorySnapshot {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return createEmptyHistory();
  }

  try {
    const raw = localStorage.getItem(DOCS_ASSISTANT_HISTORY_STORAGE_KEY);
    if (!raw) {
      return createEmptyHistory();
    }

    const parsed = JSON.parse(raw) as DocsAssistantHistorySnapshot;
    if (parsed.version !== 1 || !Array.isArray(parsed.threads)) {
      return createEmptyHistory();
    }

    return trimDocsAssistantHistory(parsed);
  } catch {
    return createEmptyHistory();
  }
}

export function writeDocsAssistantHistory(snapshot: DocsAssistantHistorySnapshot): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  const trimmed = trimDocsAssistantHistory(snapshot);
  localStorage.setItem(DOCS_ASSISTANT_HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
}

export function clearDocsAssistantHistory(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem(DOCS_ASSISTANT_HISTORY_STORAGE_KEY);
}
