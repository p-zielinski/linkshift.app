import { z } from 'zod';
import { QrCodeFormatSchema } from './qr-code.schemas';
import { RedirectTraceQuerySchema } from './redirect-trace.schemas';

export const DocsSearchCatalogInputSchema = z.object({
  query: z.string().trim().min(1, 'query is required').max(512, 'query is too long'),
  limit: z.number().int().min(1).max(20).optional(),
});

export const DocsGetPageInputSchema = z.object({
  catalogId: z.string().trim().min(1, 'catalogId is required').max(256, 'catalogId is too long'),
});

export const TraceRedirectInputSchema = RedirectTraceQuerySchema;

export const GenerateQrCodeInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'url is required')
    .max(16384, 'url is too long')
    .url('Invalid URL')
    .refine(
      (value) => {
        try {
          const parsed = new URL(value);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'Only http and https URLs are supported' },
    ),
  format: QrCodeFormatSchema.default('png'),
  size: z.number().int().min(128).max(16384).default(512),
});

export type DocsSearchCatalogInput = z.infer<typeof DocsSearchCatalogInputSchema>;
export type DocsGetPageInput = z.infer<typeof DocsGetPageInputSchema>;
export type TraceRedirectInput = z.infer<typeof TraceRedirectInputSchema>;
export type GenerateQrCodeInput = z.infer<typeof GenerateQrCodeInputSchema>;
