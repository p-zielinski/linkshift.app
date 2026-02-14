import { OrganizationConfiguration } from '@shared/models/organization-config.model';

export type Organization = {
  id: string;
  name: string;
  configuration?: OrganizationConfiguration | Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};
