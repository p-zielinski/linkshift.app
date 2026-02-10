import { z } from 'zod';

const RegisterBaseSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(1, 'Organization name is required'),
  plan: z.enum(['FREE', 'STARTER', 'PRO']).optional(),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']).optional(),
});

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const InviteRegisterBaseSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const EmailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const ResendVerificationSchema = z.object({
  email: z.email('Invalid email address').optional(),
});

export const PasswordResetRequestSchema = z.object({
  email: z.email('Invalid email address'),
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const EmailChangeRequestSchema = z.object({
  newEmail: z.email('Invalid email address'),
});

export const EmailChangeConfirmSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
});

export const LegalConsentSchema = z
  .object({
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: 'Terms of Service acceptance is required',
    }),
    acceptPrivacy: z.boolean().refine((value) => value === true, {
      message: 'Privacy Policy acceptance is required',
    }),
    confirmAge: z.boolean().refine((value) => value === true, {
      message: 'Age confirmation is required',
    }),
  })
  .strict();

export const RegisterSchema =
  RegisterBaseSchema.merge(LegalConsentSchema).strict();
export const InviteRegisterSchema =
  InviteRegisterBaseSchema.merge(LegalConsentSchema).strict();

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type InviteRegisterDto = z.infer<typeof InviteRegisterSchema>;
export type EmailVerificationDto = z.infer<typeof EmailVerificationSchema>;
export type ResendVerificationDto = z.infer<typeof ResendVerificationSchema>;
export type PasswordResetRequestDto = z.infer<
  typeof PasswordResetRequestSchema
>;
export type PasswordResetConfirmDto = z.infer<
  typeof PasswordResetConfirmSchema
>;
export type EmailChangeRequestDto = z.infer<typeof EmailChangeRequestSchema>;
export type EmailChangeConfirmDto = z.infer<typeof EmailChangeConfirmSchema>;
export type LegalConsentDto = z.infer<typeof LegalConsentSchema>;
