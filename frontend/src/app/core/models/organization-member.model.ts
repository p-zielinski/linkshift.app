export type OrganizationMember = {
  id: string;
  email: string;
  isOwner: boolean;
  isBlocked: boolean;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationInvite = {
  id: string;
  email: string;
  expiresAt: string;
};
