export type Domain = {
  id: string;
  name: string;
  domainGroupId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateDomainDto = {
  name: string;
  domainGroupId: string;
};

export type UpdateDomainDto = {
  name?: string;
  domainGroupId?: string;
};
