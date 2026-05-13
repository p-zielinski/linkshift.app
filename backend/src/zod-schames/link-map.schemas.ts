import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';

const QUERY_MATCH_VALUES = ['exact', 'ignore', 'subset'] as const;
const LINK_MAP_KEY_ALLOWED_REGEX = /^[A-Za-z0-9\-._~!$&'()*+,;=:@/?]*$/;

const destinationSchema = z
  .string()
  .min(1, 'Destination is required')
  .max(16384, 'Destination is too long (max 16384 chars)')
  .refine(
    (value) => /^https?:\/\//i.test(value.trim()),
    'Destination must start with http:// or https://',
  );

const linkMapEntryKeySchema = z
  .string()
  .min(1, 'Key is required')
  .max(1024, 'Key is too long (max 1024 chars)')
  .refine((value) => value.trim().length > 0, 'Key is required')
  .refine(
    (value) => !/^https?:\/\//i.test(value.trim()),
    'Key must be a path/query value, not a full URL',
  )
  .refine(
    (value) => !/[\s%#]/.test(value.trim()),
    'Key may not contain spaces, %, or # characters',
  )
  .refine(
    (value) => LINK_MAP_KEY_ALLOWED_REGEX.test(value.trim()),
    'Key contains unsupported characters',
  );

export const LinkMapEntrySchema = z.object({
  key: linkMapEntryKeySchema,
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
});

export const UpdateLinkMapSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(120, 'Name is too long')
    .optional(),
  caseSensitive: z.boolean().optional(),
  queryMatch: z.enum(QUERY_MATCH_VALUES).optional(),
  fallbackDestination: destinationSchema.nullable().optional(),
});

export const ListLinkMapsQuerySchema = z.object({
  domainGroupId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid Domain Group ID'),
});

// Legacy bulk endpoints (kept for internal compatibility if needed).
export const UpsertLinkMapEntriesSchema = z.object({
  mode: z.enum(['upsert', 'replace']).default('upsert'),
  entries: z.array(LinkMapEntrySchema).min(1).max(1000),
});

export const DeleteLinkMapEntriesSchema = z.object({
  keys: z.array(z.string().min(1).max(1024)).min(1).max(1000),
});

export const ListLinkMapEntriesQuerySchema = z.object({
  linkMapId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.LinkMap), 'Invalid Link map ID'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(1024).optional(),
  startAfterId: z
    .string()
    .regex(
      getEntityIdRegex(AppEntity.LinkMapEntry),
      'Invalid Link map entry ID',
    )
    .optional(),
});

export const CreateLinkMapEntrySchema = z.object({
  linkMapId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.LinkMap), 'Invalid Link map ID'),
  key: linkMapEntryKeySchema,
  destination: destinationSchema,
});

export const UpdateLinkMapEntrySchema = z
  .object({
    key: linkMapEntryKeySchema.optional(),
    destination: destinationSchema.optional(),
  })
  .refine(
    (value) => value.key !== undefined || value.destination !== undefined,
    {
      message: 'At least one field is required',
    },
  );

export const DeleteLinkMapEntriesByIdSchema = z.object({
  linkMapId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.LinkMap), 'Invalid Link map ID'),
  entryIds: z
    .array(
      z
        .string()
        .regex(
          getEntityIdRegex(AppEntity.LinkMapEntry),
          'Invalid Link map entry ID',
        ),
    )
    .min(1)
    .max(1000),
});

export const ImportLinkMapEntriesSchema = z.object({
  linkMapId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.LinkMap), 'Invalid Link map ID'),
  entries: z.array(LinkMapEntrySchema).min(1).max(500),
});

export type CreateLinkMapDto = z.infer<typeof CreateLinkMapSchema>;
export type UpdateLinkMapDto = z.infer<typeof UpdateLinkMapSchema>;
export type ListLinkMapsQueryDto = z.infer<typeof ListLinkMapsQuerySchema>;
export type UpsertLinkMapEntriesDto = z.infer<
  typeof UpsertLinkMapEntriesSchema
>;
export type DeleteLinkMapEntriesDto = z.infer<
  typeof DeleteLinkMapEntriesSchema
>;
export type LinkMapEntryDto = z.infer<typeof LinkMapEntrySchema>;
export type ListLinkMapEntriesQueryDto = z.infer<
  typeof ListLinkMapEntriesQuerySchema
>;
export type CreateLinkMapEntryDto = z.infer<typeof CreateLinkMapEntrySchema>;
export type UpdateLinkMapEntryDto = z.infer<typeof UpdateLinkMapEntrySchema>;
export type DeleteLinkMapEntriesByIdDto = z.infer<
  typeof DeleteLinkMapEntriesByIdSchema
>;
export type ImportLinkMapEntriesDto = z.infer<
  typeof ImportLinkMapEntriesSchema
>;
