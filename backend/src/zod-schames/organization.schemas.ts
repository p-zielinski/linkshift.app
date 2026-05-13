import { z } from 'zod';

export const OrganizationInviteSchema = z.object({
  email: z.email('Invalid email address'),
});

export const OrganizationMemberStatusSchema = z.object({
  blocked: z.boolean(),
});

export type OrganizationInviteDto = z.infer<typeof OrganizationInviteSchema>;
export type OrganizationMemberStatusDto = z.infer<
  typeof OrganizationMemberStatusSchema
>;
