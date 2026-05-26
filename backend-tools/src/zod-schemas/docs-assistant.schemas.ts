import { z } from 'zod';

export const DocsSearchBodySchema = z.object({
  question: z.string().trim().min(1).max(4_000),
});

export type DocsSearchBodyDto = z.infer<typeof DocsSearchBodySchema>;

export const DocsRateBodySchema = z.object({
  logId: z.uuid(),
  rating: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export type DocsRateBodyDto = z.infer<typeof DocsRateBodySchema>;
