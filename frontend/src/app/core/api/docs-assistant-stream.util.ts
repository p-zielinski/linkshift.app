import {
  DOCS_ASSISTANT_SEARCH_STAGES,
  type DocsAssistantSearchStage,
} from './docs-assistant-search-stages';

export type DocsSearchStreamEvent =
  | { type: 'status'; stage: DocsAssistantSearchStage }
  | {
      type: 'result';
      answer: string;
      sources: string[];
      logId: string | null;
      conversationSummary: string | null;
    }
  | { type: 'error'; details: string };

function isSearchStage(value: unknown): value is DocsAssistantSearchStage {
  return typeof value === 'string' && (DOCS_ASSISTANT_SEARCH_STAGES as readonly string[]).includes(value);
}

function parseStreamEvent(value: unknown): DocsSearchStreamEvent | null {
  if (!value || typeof value !== 'object' || !('type' in value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (record['type'] === 'status' && isSearchStage(record['stage'])) {
    return { type: 'status', stage: record['stage'] };
  }

  if (
    record['type'] === 'result' &&
    typeof record['answer'] === 'string' &&
    Array.isArray(record['sources']) &&
    record['sources'].every((entry) => typeof entry === 'string') &&
    (typeof record['logId'] === 'string' || record['logId'] === null) &&
    (typeof record['conversationSummary'] === 'string' || record['conversationSummary'] === null)
  ) {
    return {
      type: 'result',
      answer: record['answer'],
      sources: record['sources'],
      logId: record['logId'],
      conversationSummary: record['conversationSummary'],
    };
  }

  if (record['type'] === 'error' && typeof record['details'] === 'string') {
    return { type: 'error', details: record['details'] };
  }

  return null;
}

export function parseDocsAssistantStreamBuffer(buffer: string): {
  events: DocsSearchStreamEvent[];
  remainder: string;
} {
  const events: DocsSearchStreamEvent[] = [];
  let start = 0;

  while (start < buffer.length) {
    const lineEnd = buffer.indexOf('\n', start);
    if (lineEnd === -1) {
      break;
    }

    const line = buffer.slice(start, lineEnd).trim();
    start = lineEnd + 1;

    if (!line) {
      continue;
    }

    try {
      const parsed = parseStreamEvent(JSON.parse(line));
      if (parsed) {
        events.push(parsed);
      }
    } catch {
      continue;
    }
  }

  return {
    events,
    remainder: buffer.slice(start),
  };
}
