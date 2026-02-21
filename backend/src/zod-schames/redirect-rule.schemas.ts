import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';
import { HttpMethod } from '@prisma/client';

const ALLOWED_STATUS_CODES: number[] = [301, 302, 307, 308];

const HTTP_METHOD_VALUES = Object.values(HttpMethod) as [string, ...string[]];
const QUERY_MATCH_VALUES = ['exact', 'ignore', 'subset'] as const;
const PATH_MATCH_VALUES = ['exact', 'prefix'] as const;

const MatchMethodListSchema = z
  .array(z.enum(HttpMethod))
  .superRefine((values, ctx) => {
    if (new Set(values).size !== values.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'matchMethod must not contain duplicates',
      });
    }

    if (values.length >= HTTP_METHOD_VALUES.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Maximum ${HTTP_METHOD_VALUES.length - 1} methods allowed (or leave empty for all)`,
      });
    }
  });

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
  matchMethod: MatchMethodListSchema.default([]),
  queryMatch: z.enum(QUERY_MATCH_VALUES).default('exact'),
  pathMatch: z.enum(PATH_MATCH_VALUES).default('exact'),
  linkMapId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.LinkMap), 'Invalid Link Map ID')
    .nullable()
    .optional(),
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
  matchMethod: MatchMethodListSchema.optional(),
  queryMatch: z.enum(QUERY_MATCH_VALUES).optional(),
  pathMatch: z.enum(PATH_MATCH_VALUES).optional(),
  linkMapId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.LinkMap), 'Invalid Link Map ID')
    .nullable()
    .optional(),
  priority: z.number().int().min(0).max(1000).optional(),
});

export const ListRedirectRulesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  domainGroupId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid Domain Group ID'),
  startAfterId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.RedirectRule), 'Invalid Redirect rule ID')
    .optional(),
});

const RangeEnum = z.enum(['day', 'week', 'month']);
const CoercedDateSchema = z.coerce.date().refine(
  (value) => !Number.isNaN(value.getTime()),
  'Invalid date',
);

export const TopRedirectRulesQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(50),
    range: RangeEnum.optional(),
    start: CoercedDateSchema.optional(),
    end: CoercedDateSchema.optional(),
  })
  .superRefine((value, ctx) => {
    const hasStart = Boolean(value.start);
    const hasEnd = Boolean(value.end);
    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Both start and end must be provided together',
        path: ['start'],
      });
      return;
    }
    if (value.start && value.end && value.start > value.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start must be before end',
        path: ['start'],
      });
    }
  });

const SimulationEntrySchema = z.object({
  domainGroupId: z
    .string()
    .max(100)
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid ID'),
  hostname: z.string().max(253).optional(),
  path: z.string().min(1, 'Path is required'),
  method: z.nativeEnum(HttpMethod).optional(),
  protocol: z.enum(['http', 'https']).optional(),
  ip: z.string().optional(),
  userAgent: z.string().max(512).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  query: z
    .record(
      z.string(),
      z.union([
        z.string(),
        z.array(z.string()),
        z.number(),
        z.boolean(),
      ]),
    )
    .optional(),
});

export const SimulateRedirectsSchema = z.object({
  entries: z.array(SimulationEntrySchema).min(1).max(100),
});

export type CreateRedirectRuleDto = z.infer<typeof CreateRedirectRuleSchema>;
export type UpdateRedirectRuleDto = z.infer<typeof UpdateRedirectRuleSchema>;
export type ListRedirectRulesQueryDto = z.infer<
  typeof ListRedirectRulesQuerySchema
>;
export type TopRedirectRulesQueryDto = z.infer<
  typeof TopRedirectRulesQuerySchema
>;
export type SimulateRedirectsDto = z.infer<typeof SimulateRedirectsSchema>;
