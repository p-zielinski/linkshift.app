import { z } from 'zod';
import { DOCS_ASSISTANT_MAX_CONVERSATION_SUMMARY_CHARS } from '../docs-assistant/docs-assistant-conversation.util';

export const DocsSearchBodySchema = z.object({
  question: z.string().trim().min(1).max(4_000),
  conversationSummary: z
    .string()
    .trim()
    .max(DOCS_ASSISTANT_MAX_CONVERSATION_SUMMARY_CHARS)
    .optional(),
});

export type DocsSearchBodyDto = z.infer<typeof DocsSearchBodySchema>;

export const DocsRateBodySchema = z.object({
  logId: z.uuid(),
  rating: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export type DocsRateBodyDto = z.infer<typeof DocsRateBodySchema>;
