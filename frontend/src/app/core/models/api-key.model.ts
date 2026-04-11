export type ApiKey = {
  id: string;
  name: string;
  tokenPrefix: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  key?: string;
};

export type CreateApiKeyDto = {
  name: string;
  expiresAt?: string | null;
};

export type UpdateApiKeyDto = {
  name?: string;
  expiresAt?: string | null;
};
