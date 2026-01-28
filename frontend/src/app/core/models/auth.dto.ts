export type LoginDto = {
  email: string;
  password: string;
};

import { OrganizationPlan } from '@shared/models/organization-config.model';

export type RegisterDto = {
  email: string;
  password: string;
  organizationName: string;
  plan?: OrganizationPlan;
};

export type RefreshTokenDto = {
  refreshToken?: string;
};
