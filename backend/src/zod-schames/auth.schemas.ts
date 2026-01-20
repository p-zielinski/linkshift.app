import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(1, 'Organization name is required'),
});

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
