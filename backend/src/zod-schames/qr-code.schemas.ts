import { z } from 'zod';

const HttpUrlSchema = z
  .string()
  .trim()
  .min(1, 'URL is required')
  .max(2048, 'URL is too long')
  .url('Invalid URL')
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Only http and https URLs are supported');

export const QrCodeFormatSchema = z.enum(['png', 'svg', 'eps']);

export const GenerateQrCodeQuerySchema = z.object({
  url: HttpUrlSchema,
  format: QrCodeFormatSchema.default('svg'),
  size: z.coerce.number().int().min(128).max(2048).default(512),
  download: z.coerce.boolean().optional().default(false),
});

export type GenerateQrCodeQueryDto = z.infer<typeof GenerateQrCodeQuerySchema>;
