import { z } from 'zod';
import {
  DOCS_SEARCH_STAGES,
  type DocsSearchStreamEvent,
} from './docs-assistant-stream.model';

const DocsSearchStatusEventSchema = z.object({
  type: z.literal('status'),
  stage: z.enum(DOCS_SEARCH_STAGES),
});

const DocsSearchResultEventSchema = z.object({
  type: z.literal('result'),
  answer: z.string(),
  sources: z.array(z.string()),
  logId: z.string().nullable(),
  conversationSummary: z.string().nullable(),
});

const DocsSearchErrorEventSchema = z.object({
  type: z.literal('error'),
  details: z.string(),
});

export const DocsSearchStreamEventSchema = z.discriminatedUnion('type', [
  DocsSearchStatusEventSchema,
  DocsSearchResultEventSchema,
  DocsSearchErrorEventSchema,
]);

export function parseDocsSearchStreamBuffer(buffer: string): {
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

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(line);
    } catch {
      continue;
    }

    const parsed = DocsSearchStreamEventSchema.safeParse(parsedJson);
    if (parsed.success) {
      events.push(parsed.data);
    }
  }

  return {
    events,
    remainder: buffer.slice(start),
  };
}
