import { z } from 'zod';

export const CreateDomainGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
});

export const UpdateDomainGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
});

export type CreateDomainGroupDto = z.infer<typeof CreateDomainGroupSchema>;
export type UpdateDomainGroupDto = z.infer<typeof UpdateDomainGroupSchema>;
