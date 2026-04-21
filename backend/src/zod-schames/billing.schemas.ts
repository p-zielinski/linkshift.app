import { z } from 'zod';
export const CreateCheckoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>;

export const CreateCheckoutSessionSchema = z.object({
  priceId: z.string().min(1),
});

export type CreateCheckoutSessionDto = z.infer<
  typeof CreateCheckoutSessionSchema
>;

export const ChangeSubscriptionSchema = z.object({
  priceId: z.string().min(1),
});

export type ChangeSubscriptionDto = z.infer<typeof ChangeSubscriptionSchema>;

export const PortalActionSchema = z.enum(['manage', 'cancel']).default('manage');

export type PortalAction = z.infer<typeof PortalActionSchema>;
