import { z } from 'zod';
import {
  DEFAULT_ROBOTS_POLICY,
  MAX_CUSTOM_ROBOTS_CONTENT_LENGTH,
  ROBOTS_POLICY_VALUES,
} from '@shared/models/robots-policy.model';
import {
  DEFAULT_REDIRECT_DELIVERY_MODE,
  REDIRECT_DELIVERY_MODE_VALUES,
} from '@shared/models/redirect-delivery-mode.model';

export const robotsPolicySchema = z.enum(ROBOTS_POLICY_VALUES);
export const redirectDeliveryModeSchema = z.enum(REDIRECT_DELIVERY_MODE_VALUES);

export const domainGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  robotsPolicy: robotsPolicySchema.default(DEFAULT_ROBOTS_POLICY),
  customRobotsContent: z
    .string()
    .max(
      MAX_CUSTOM_ROBOTS_CONTENT_LENGTH,
      `Content is too long (max ${MAX_CUSTOM_ROBOTS_CONTENT_LENGTH} characters)`
    )
    .optional(),
  redirectDeliveryMode: redirectDeliveryModeSchema.default(
    DEFAULT_REDIRECT_DELIVERY_MODE
  ),
});
