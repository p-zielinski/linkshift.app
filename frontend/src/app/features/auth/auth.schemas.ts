import { z } from 'zod';

const EMAIL_MAX_LENGTH = 254;
const ORGANIZATION_NAME_MAX_LENGTH = 50;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Email must be valid')
    .max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters`),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Email must be valid')
    .max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters`),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .max(
      ORGANIZATION_NAME_MAX_LENGTH,
      `Organization name must be at most ${ORGANIZATION_NAME_MAX_LENGTH} characters`,
    ),
  plan: z.enum(['FREE', 'BASIC', 'PRO']).default('FREE'),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: 'Accept the Terms of Service to continue'
  }),
  acceptPrivacy: z.boolean().refine((value) => value === true, {
    message: 'Accept the Privacy Policy to continue'
  }),
  confirmAge: z.boolean().refine((value) => value === true, {
    message: 'You must confirm you are at least 16 years old'
  })
});
