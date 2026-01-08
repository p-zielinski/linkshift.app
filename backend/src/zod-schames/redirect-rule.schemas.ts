import { z } from 'zod';

export const CreateRedirectRuleSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  statusCode: z.number().int().min(301).max(308).default(302),
  priority: z.number().int().default(0),
  domainGroupId: z.string().uuid('Invalid domain group ID'),
});

export const UpdateRedirectRuleSchema = z.object({
  source: z.string().min(1, 'Source is required').optional(),
  destination: z.string().min(1, 'Destination is required').optional(),
  statusCode: z.number().int().min(301).max(308).optional(),
  priority: z.number().int().optional(),
});

export type CreateRedirectRuleDto = z.infer<typeof CreateRedirectRuleSchema>;
export type UpdateRedirectRuleDto = z.infer<typeof UpdateRedirectRuleSchema>;
