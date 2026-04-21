import type { Organization } from './organization.model';
import type { User } from './user.model';

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
  organization: Organization;
};

export type AuthSession = {
  user: User;
  organization: Organization;
};
