import { z } from 'zod';

export const RouterResultSchema = z.object({
  intent: z.enum(['CONVERSATION', 'OUT_OF_SCOPE', 'DOCUMENTATION_SEARCH']),
  directReply: z.string().nullable(),
  suggestedCatalogIds: z.array(z.string()),
  conversationSummary: z.string().nullable(),
});

export type RouterResult = z.infer<typeof RouterResultSchema>;

export const GeneratorResultSchema = z.object({
  answer: z.string(),
  conversationSummary: z.string(),
});

export type GeneratorResult = z.infer<typeof GeneratorResultSchema>;

export function parseValidatedJson<T>(
  raw: string,
  schema: z.ZodType<T>,
): { ok: true; data: T } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'invalid_json' };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true, data: result.data };
}
