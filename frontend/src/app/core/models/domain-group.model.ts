import type { RobotsPolicy } from '@shared/models/robots-policy.model';

export type DomainGroup = {
  id: string;
  name: string;
  organizationId: string;
  robotsPolicy: RobotsPolicy;
  customRobotsContent?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateDomainGroupDto = {
  name: string;
  robotsPolicy: RobotsPolicy;
  customRobotsContent?: string | null;
};

export type UpdateDomainGroupDto = {
  name: string;
  robotsPolicy?: RobotsPolicy;
  customRobotsContent?: string | null;
};
