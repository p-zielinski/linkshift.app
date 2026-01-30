import type { Organization } from './organization.model';

export type User = {
  id: string;
  email: string;
  organizationId: string;
  isOwner: boolean;
  emailVerifiedAt?: string | null;
  isBlocked?: boolean;
  blockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  organization?: Organization;
};
