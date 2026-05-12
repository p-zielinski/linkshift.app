export type Subdomain = {
  id: string;
  name: string;
  domainGroupId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateSubdomainDto = {
  name: string;
  domainGroupId: string;
};

export type UpdateSubdomainDto = {
  name?: string;
  domainGroupId?: string;
};
