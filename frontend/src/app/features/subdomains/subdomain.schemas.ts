import { z } from 'zod';

const subdomainPattern = /^[a-z0-9-]{1,30}$/;

export const subdomainSchema = z.object({
  name: z
    .string()
    .min(1, 'Subdomain name is required')
    .max(30, 'Subdomain name must be 30 characters or fewer')
    .regex(
      subdomainPattern,
      'Use lowercase letters, numbers, and hyphens only',
    ),
  domainGroupId: z.string().min(1, 'Domain group is required'),
});
