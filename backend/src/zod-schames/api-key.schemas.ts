import { z } from 'zod';
import { AppEntity, getEntityIdRegex } from '../utils';

const apiKeyNameSchema = z
  .string()
  .trim()
  .min(1, 'API key name is required')
  .max(120, 'API key name is too long (max 120 chars)');

const expiresAtSchema = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? value : parsed;
    }
    return value;
  }, z.union([z.date(), z.null()]))
  .optional()
  .refine(
    (value) => value === undefined || value === null || value.getTime() > Date.now(),
    'Expiration date must be in the future',
  );

export const CreateApiKeySchema = z.object({
  name: apiKeyNameSchema,
  expiresAt: expiresAtSchema,
});

export const UpdateApiKeySchema = z
  .object({
    name: apiKeyNameSchema.optional(),
    expiresAt: expiresAtSchema,
  })
  .refine((value) => value.name !== undefined || value.expiresAt !== undefined, {
    message: 'At least one field is required',
  });

export const ApiKeyIdParamSchema = z.object({
  id: z
    .string()
    .regex(getEntityIdRegex(AppEntity.ApiKey), 'Invalid API key ID'),
});

export type CreateApiKeyDto = z.infer<typeof CreateApiKeySchema>;
export type UpdateApiKeyDto = z.infer<typeof UpdateApiKeySchema>;
