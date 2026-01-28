import { z } from 'zod';
import { OrganizationPlan } from '@shared/models/organization-config.model';

export const CheckoutPlanSchema = z.enum([
  OrganizationPlan.STARTER,
  OrganizationPlan.PRO,
]);

export const CreateCheckoutSchema = z.object({
  plan: CheckoutPlanSchema,
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>;
