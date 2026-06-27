import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';

export const CreateDomainSchema = z.object({
  name: z
    .string()
    .min(1, 'Domain name is required')
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i,
      'Invalid domain name format',
    ),
  domainGroupId: z
    .string()
    .max(100)
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid ID'),
});

export const UpdateDomainSchema = z
  .object({
    domainGroupId: z
      .string()
      .max(100)
      .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid ID'),
  })
  .strict();

export type CreateDomainDto = z.infer<typeof CreateDomainSchema>;
export type UpdateDomainDto = z.infer<typeof UpdateDomainSchema>;
