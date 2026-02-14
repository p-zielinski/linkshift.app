import { z } from 'zod';
export const CreateCheckoutSchema = z.object({
  variantId: z.string().min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const CustomPlanCheckoutSchema = z.object({
  variantId: z.string().min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>;
export type CustomPlanCheckoutDto = z.infer<typeof CustomPlanCheckoutSchema>;
