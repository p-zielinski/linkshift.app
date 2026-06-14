import type { RobotsPolicy } from '@shared/models/robots-policy.model';
import type { RedirectDeliveryMode } from '@shared/models/redirect-delivery-mode.model';

export type DomainGroup = {
  id: string;
  name: string;
  organizationId: string;
  robotsPolicy: RobotsPolicy;
  customRobotsContent?: string | null;
  redirectDeliveryMode: RedirectDeliveryMode;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateDomainGroupDto = {
  name: string;
  robotsPolicy: RobotsPolicy;
  customRobotsContent?: string | null;
  redirectDeliveryMode?: RedirectDeliveryMode;
};

export type UpdateDomainGroupDto = {
  name: string;
  robotsPolicy?: RobotsPolicy;
  customRobotsContent?: string | null;
  redirectDeliveryMode?: RedirectDeliveryMode;
};
