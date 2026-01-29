import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';
import { HttpMethod } from '@prisma/client';

const RedirectTestResultSchema = z.object({
  matched: z.boolean(),
  statusCode: z.number().int().min(100).max(599),
  target: z.string().max(4096).nullable(),
});

const RequestDataSchema = z
  .object({
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
  })
  .default({});

export const CreateRedirectTestSchema = z.object({
  domainGroupId: z
    .string()
    .max(100)
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid ID'),
  pathWithQuery: z
    .string()
    .min(1, 'Path is required')
    .max(2048, 'Path is too long'),
  requestData: RequestDataSchema.optional(),
  expectedResult: RedirectTestResultSchema,
});

export const UpdateRedirectTestSchema = z.object({
  pathWithQuery: z
    .string()
    .min(1, 'Path is required')
    .max(2048, 'Path is too long')
    .optional(),
  requestData: RequestDataSchema.optional(),
  expectedResult: RedirectTestResultSchema.optional(),
});

export const ListRedirectTestsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  domainGroupId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid Domain Group ID'),
  startAfterId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.RedirectTest), 'Invalid Redirect test ID')
    .optional(),
});

export type CreateRedirectTestDto = z.infer<typeof CreateRedirectTestSchema>;
export type UpdateRedirectTestDto = z.infer<typeof UpdateRedirectTestSchema>;
export type ListRedirectTestsQueryDto = z.infer<
  typeof ListRedirectTestsQuerySchema
>;
