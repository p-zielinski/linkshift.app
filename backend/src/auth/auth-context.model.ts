export type AuthContextType = 'user' | 'api_key';

export type AuthenticatedPrincipal = {
  organizationId: string;
  authType: AuthContextType;
  userId?: string;
  apiKeyId?: string;
};
