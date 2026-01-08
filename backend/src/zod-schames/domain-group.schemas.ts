import { z } from 'zod';

export const CreateDomainGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const UpdateDomainGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type CreateDomainGroupDto = z.infer<typeof CreateDomainGroupSchema>;
export type UpdateDomainGroupDto = z.infer<typeof UpdateDomainGroupSchema>;
