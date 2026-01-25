import type { Organization } from './organization.model';

export type User = {
  id: string;
  email: string;
  organizationId: string;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  organization?: Organization;
};
