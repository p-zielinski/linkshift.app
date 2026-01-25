import type { Organization } from './organization.model';
import type { User } from './user.model';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = AuthTokens & {
  user: User;
  organization: Organization;
};
