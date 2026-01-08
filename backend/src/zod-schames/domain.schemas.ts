import { z } from 'zod';

export const CreateDomainSchema = z.object({
  name: z
    .string()
    .min(1, 'Domain name is required')
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i,
      'Invalid domain name format',
    ),
  domainGroupId: z.string().uuid('Invalid domain group ID'),
});

export const UpdateDomainSchema = z.object({
  name: z
    .string()
    .min(1, 'Domain name is required')
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i,
      'Invalid domain name format',
    )
    .optional(),
  domainGroupId: z.string().uuid('Invalid domain group ID').optional(),
});

export type CreateDomainDto = z.infer<typeof CreateDomainSchema>;
export type UpdateDomainDto = z.infer<typeof UpdateDomainSchema>;
