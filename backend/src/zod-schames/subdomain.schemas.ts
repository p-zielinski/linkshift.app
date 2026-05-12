import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';

const subdomainNamePattern = /^[a-z0-9-]{1,30}$/;

export const CreateSubdomainSchema = z.object({
  name: z
    .string()
    .min(1, 'Subdomain name is required')
    .max(30, 'Subdomain name must be at most 30 characters')
    .regex(
      subdomainNamePattern,
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
      subdomainNamePattern,
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
