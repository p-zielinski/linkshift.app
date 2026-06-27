import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';
import { LINKSHIFT_SUBDOMAIN_NAME_PATTERN } from '../security/subdomain-name.constants';

export const CreateSubdomainSchema = z.object({
  name: z
    .string()
    .min(1, 'Subdomain name is required')
    .max(30, 'Subdomain name must be at most 30 characters')
    .regex(
      LINKSHIFT_SUBDOMAIN_NAME_PATTERN,
      'Subdomain name can contain only lowercase letters, numbers, and hyphens',
    ),
  domainGroupId: z
    .string()
    .max(100)
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid ID'),
});

export const UpdateSubdomainSchema = z.object({
  name: z
    .string()
    .min(1, 'Subdomain name is required')
    .max(30, 'Subdomain name must be at most 30 characters')
    .regex(
      LINKSHIFT_SUBDOMAIN_NAME_PATTERN,
      'Subdomain name can contain only lowercase letters, numbers, and hyphens',
    )
    .optional(),
  domainGroupId: z
    .string()
    .max(100)
    .regex(getEntityIdRegex(AppEntity.DomainGroup), 'Invalid ID'),
});

export type CreateSubdomainDto = z.infer<typeof CreateSubdomainSchema>;
export type UpdateSubdomainDto = z.infer<typeof UpdateSubdomainSchema>;
