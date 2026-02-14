import { z } from 'zod';

const statusCodes = [301, 302, 307, 308];
const matchMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'] as const;

export const redirectRuleSchema = z.object({
  source: z.string().min(1, 'Source is required').max(16384, 'Source is too long'),
  destination: z
    .string()
    .min(1, 'Destination is required')
    .max(16384, 'Destination is too long')
    .refine(
      (value) => /^https?:\/\/.+/i.test(value.trim()),
      'Destination must be a full URL starting with http:// or https://'
    ),
  statusCode: z
    .coerce
    .number({ invalid_type_error: 'Status code must be a number' })
    .refine((value) => statusCodes.includes(value), 'Status code is invalid'),
  matchMethod: z
    .array(z.enum(matchMethods))
    .refine((value) => new Set(value).size === value.length, 'Match methods must be unique'),
  priority: z
    .coerce
    .number({ invalid_type_error: 'Priority must be a number' })
    .min(0, 'Priority cannot be negative')
    .max(1000, 'Priority is too large'),
  domainGroupId: z.string().min(1, 'Domain group is required')
});

export const redirectRuleStatusCodes = statusCodes;
export const redirectRuleMatchMethods = matchMethods;
