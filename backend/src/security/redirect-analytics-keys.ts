import { REDIRECT_HIT_PREFIX_ORG } from './security.constants';

const HOURLY_SUFFIX_REGEX = /^\d{10}$/;

export const formatHourlyKeySuffix = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  return `${year}${month}${day}${hour}`;
};

export const buildHourlyKey = (prefix: string, date: Date): string =>
  `${prefix}:${formatHourlyKeySuffix(date)}`;

export const buildOrgHourlyKeyPattern = (date: Date): string =>
  `${REDIRECT_HIT_PREFIX_ORG}:*:${formatHourlyKeySuffix(date)}`;

export const parseOrganizationIdFromHourlyKey = (
  key: string,
): { organizationId: string; hourSuffix: string } | null => {
  const prefix = `${REDIRECT_HIT_PREFIX_ORG}:`;
  if (!key.startsWith(prefix)) return null;
  const rest = key.slice(prefix.length);
  const separatorIndex = rest.lastIndexOf(':');
  if (separatorIndex <= 0) return null;
  const organizationId = rest.slice(0, separatorIndex);
  const hourSuffix = rest.slice(separatorIndex + 1);
  if (!organizationId || !HOURLY_SUFFIX_REGEX.test(hourSuffix)) return null;
  return { organizationId, hourSuffix };
};

export const hourSuffixToDate = (suffix: string): Date | null => {
  if (!HOURLY_SUFFIX_REGEX.test(suffix)) return null;
  const year = Number(suffix.slice(0, 4));
  const month = Number(suffix.slice(4, 6));
  const day = Number(suffix.slice(6, 8));
  const hour = Number(suffix.slice(8, 10));
  if ([year, month, day, hour].some((value) => Number.isNaN(value))) {
    return null;
  }
  return new Date(Date.UTC(year, month - 1, day, hour));
};
