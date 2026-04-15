import { z } from 'zod';

const DEFAULT_USER_AGENT = 'LinkShift-Redirect-Trace/1.0';
const TRACE_URL_MAX_LENGTH = 1024 * 16;

const normalizeCandidateUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `http://${trimmed}`;
};

const TraceUrlSchema = z
  .string()
  .trim()
  .min(1, 'URL is required')
  .max(TRACE_URL_MAX_LENGTH, 'URL is too long')
  .transform((value) => normalizeCandidateUrl(value))
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Provide a valid HTTP or HTTPS URL');

export const RedirectTraceQuerySchema = z.object({
  url: TraceUrlSchema,
  userAgent: z
    .string()
    .trim()
    .max(256, 'User-Agent is too long')
    .optional()
    .transform((value) => value || DEFAULT_USER_AGENT),
});

export type RedirectTraceQueryDto = z.infer<typeof RedirectTraceQuerySchema>;
export { DEFAULT_USER_AGENT };
