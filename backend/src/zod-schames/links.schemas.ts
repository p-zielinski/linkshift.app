import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';

export const ListLinksQuerySchema = z.object({
  domainGroupId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid Domain Group ID')
    .optional(),
  linkMapId: z
    .string()
    .regex(getEntityIdRegex(AppEntity.LinkMap), 'Invalid Link map ID')
    .optional(),
  search: z
    .string()
    .trim()
    .min(2, 'Search must be at least 2 characters')
    .max(200, 'Search is too long (max 200 chars)')
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  startAfterId: z
    .string()
    .regex(
      getEntityIdRegex(AppEntity.LinkMapEntry),
      'Invalid Link map entry ID',
    )
    .optional(),
});

export type ListLinksQueryDto = z.infer<typeof ListLinksQuerySchema>;
