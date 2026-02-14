import { z } from 'zod';

const domainPattern =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

export const domainSchema = z.object({
  name: z
    .string()
    .min(1, 'Domain name is required')
    .regex(domainPattern, 'Domain name format is invalid'),
  domainGroupId: z.string().min(1, 'Domain group is required'),
});
