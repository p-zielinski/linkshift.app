export type LoginDto = {
  email: string;
  password: string;
};

import {
  BillingInterval,
  OrganizationPlan,
} from '@shared/models/organization-config.model';

export type RegisterDto = {
  email: string;
  password: string;
  organizationName: string;
  plan?: OrganizationPlan;
  billingInterval?: BillingInterval;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  confirmAge: boolean;
};

export type InviteRegisterDto = {
  token: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  confirmAge: boolean;
};

export type PasswordResetRequestDto = {
  email: string;
};

export type PasswordResetConfirmDto = {
  token: string;
  password: string;
};

export type EmailVerificationDto = {
  token: string;
};

export type EmailChangeRequestDto = {
  newEmail: string;
};

export type EmailChangeConfirmDto = {
  code: string;
};

export type LegalConsentDto = {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  confirmAge: boolean;
};

export type RefreshTokenDto = {
  refreshToken?: string;
};
