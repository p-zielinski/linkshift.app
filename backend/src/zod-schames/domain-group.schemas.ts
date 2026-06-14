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

const RobotsPolicySchema = z.enum(ROBOTS_POLICY_VALUES);
const RedirectDeliveryModeSchema = z.enum(REDIRECT_DELIVERY_MODE_VALUES);
const CustomRobotsContentSchema = z
  .string()
  .max(
    MAX_CUSTOM_ROBOTS_CONTENT_LENGTH,
    `customRobotsContent is too long (max ${MAX_CUSTOM_ROBOTS_CONTENT_LENGTH} characters)`,
  )
  .nullable()
  .optional();

function hasCustomRobotsContent(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export const CreateDomainGroupSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    robotsPolicy: RobotsPolicySchema.optional().default(DEFAULT_ROBOTS_POLICY),
    customRobotsContent: CustomRobotsContentSchema,
    redirectDeliveryMode: RedirectDeliveryModeSchema.optional().default(
      DEFAULT_REDIRECT_DELIVERY_MODE,
    ),
  })
  .superRefine((data, ctx) => {
    if (
      data.robotsPolicy === 'CUSTOM' &&
      !hasCustomRobotsContent(data.customRobotsContent)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customRobotsContent'],
        message: 'customRobotsContent is required when robotsPolicy is CUSTOM',
      });
    }

    if (
      data.robotsPolicy !== 'CUSTOM' &&
      hasCustomRobotsContent(data.customRobotsContent)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customRobotsContent'],
        message:
          'customRobotsContent can be set only when robotsPolicy is CUSTOM',
      });
    }
  });

export const UpdateDomainGroupSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    robotsPolicy: RobotsPolicySchema.optional(),
    customRobotsContent: CustomRobotsContentSchema,
    redirectDeliveryMode: RedirectDeliveryModeSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.customRobotsContent !== undefined &&
      data.robotsPolicy === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['robotsPolicy'],
        message:
          'robotsPolicy is required when customRobotsContent is provided',
      });
    }

    if (
      data.robotsPolicy === 'CUSTOM' &&
      !hasCustomRobotsContent(data.customRobotsContent)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customRobotsContent'],
        message: 'customRobotsContent is required when robotsPolicy is CUSTOM',
      });
    }

    if (
      data.robotsPolicy !== undefined &&
      data.robotsPolicy !== 'CUSTOM' &&
      hasCustomRobotsContent(data.customRobotsContent)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customRobotsContent'],
        message:
          'customRobotsContent can be set only when robotsPolicy is CUSTOM',
      });
    }
  });

export type CreateDomainGroupDto = z.infer<typeof CreateDomainGroupSchema>;
export type UpdateDomainGroupDto = z.infer<typeof UpdateDomainGroupSchema>;
