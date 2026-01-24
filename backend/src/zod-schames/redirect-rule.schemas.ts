import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';

const ALLOWED_STATUS_CODES: number[] = [301, 302, 303, 307, 308];

export const CreateRedirectRuleSchema = z.object({
  source: z
    .string()
    .min(1, 'Source is required')
    .max(16384, 'Source is too long (max 16384 chars)'),
  destination: z
    .string()
    .min(1, 'Destination is required')
    .max(16384, 'Destination is too long (max 16384 chars)'),
  statusCode: z
    .number()
    .int()
    .refine(
      (code) => ALLOWED_STATUS_CODES.includes(code),
      `Status code must be one of: ${ALLOWED_STATUS_CODES.join(', ')}`,
    )
    .default(302),
  priority: z
    .number()
    .int()
    .min(0, 'Priority cannot be negative')
    .max(1000, 'Priority cannot be greater than 1000')
    .default(0),
  domainGroupId: z
    .string()
    .max(100)
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid ID'),
});

export const UpdateRedirectRuleSchema = z.object({
  source: z
    .string()
    .min(1, 'Source is required')
    .max(16384, 'Source is too long')
    .optional(),
  destination: z
    .string()
    .min(1, 'Destination is required')
    .max(16384, 'Destination is too long')
    .optional(),
  statusCode: z
    .number()
    .int()
    .refine(
      (code) => ALLOWED_STATUS_CODES.includes(code as any),
      `Status code must be one of: ${ALLOWED_STATUS_CODES.join(', ')}`,
    )
    .optional(),
  priority: z.number().int().min(0).max(1000).optional(),
});

export const ListRedirectRulesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  domainGroupId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid Domain Group ID'),
});

export type CreateRedirectRuleDto = z.infer<typeof CreateRedirectRuleSchema>;
export type UpdateRedirectRuleDto = z.infer<typeof UpdateRedirectRuleSchema>;
export type ListRedirectRulesQueryDto = z.infer<
  typeof ListRedirectRulesQuerySchema
>;
