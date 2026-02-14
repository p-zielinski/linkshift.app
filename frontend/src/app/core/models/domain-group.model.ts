export type DomainGroup = {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateDomainGroupDto = {
  name: string;
};

export type UpdateDomainGroupDto = {
  name: string;
};
