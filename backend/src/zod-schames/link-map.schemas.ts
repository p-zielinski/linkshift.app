import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';

const QUERY_MATCH_VALUES = ['exact', 'ignore', 'subset'] as const;

const destinationSchema = z
  .string()
  .min(1, 'Destination is required')
  .max(16384, 'Destination is too long (max 16384 chars)')
  .refine(
    (value) => /^https?:\/\//i.test(value.trim()),
    'Destination must start with http:// or https://',
  );

export const LinkMapEntrySchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(1024, 'Key is too long (max 1024 chars)'),
  destination: destinationSchema,
});

export const CreateLinkMapSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name is too long'),
  domainGroupId: z
    .string()
    .max(100)
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid ID'),
  caseSensitive: z.boolean().default(false),
  queryMatch: z.enum(QUERY_MATCH_VALUES).default('ignore'),
  fallbackDestination: destinationSchema.optional(),
  entries: z.array(LinkMapEntrySchema).max(500).optional(),
});

export const UpdateLinkMapSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name is too long').optional(),
  caseSensitive: z.boolean().optional(),
  queryMatch: z.enum(QUERY_MATCH_VALUES).optional(),
  fallbackDestination: destinationSchema.nullable().optional(),
});

export const ListLinkMapsQuerySchema = z.object({
  domainGroupId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid Domain Group ID'),
});

export const UpsertLinkMapEntriesSchema = z.object({
  mode: z.enum(['upsert', 'replace']).default('upsert'),
  entries: z.array(LinkMapEntrySchema).min(1).max(1000),
});

export const DeleteLinkMapEntriesSchema = z.object({
  keys: z.array(z.string().min(1).max(1024)).min(1).max(1000),
});

export type CreateLinkMapDto = z.infer<typeof CreateLinkMapSchema>;
export type UpdateLinkMapDto = z.infer<typeof UpdateLinkMapSchema>;
export type ListLinkMapsQueryDto = z.infer<typeof ListLinkMapsQuerySchema>;
export type UpsertLinkMapEntriesDto = z.infer<typeof UpsertLinkMapEntriesSchema>;
export type DeleteLinkMapEntriesDto = z.infer<typeof DeleteLinkMapEntriesSchema>;
export type LinkMapEntryDto = z.infer<typeof LinkMapEntrySchema>;
