import { z } from 'zod';
import { OrganizationPlan } from '@shared/models/organization-config.model';

export const CheckoutPlanSchema = z.enum([
  OrganizationPlan.STARTER,
  OrganizationPlan.PRO,
]);

export const CheckoutIntervalSchema = z.enum([
  'MONTHLY',
  'YEARLY',
]);

export const CreateCheckoutSchema = z.object({
  plan: CheckoutPlanSchema,
  interval: CheckoutIntervalSchema.optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const CustomPlanCheckoutSchema = z.object({
  interval: CheckoutIntervalSchema.optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>;
export type CustomPlanCheckoutDto = z.infer<typeof CustomPlanCheckoutSchema>;
