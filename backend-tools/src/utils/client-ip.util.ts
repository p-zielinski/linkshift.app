import type { Request } from 'express';

export const extractClientIp = (request: Request): string | null => {
  const value = request.ip?.trim();
  if (value) {
    return value;
  }

  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const [first] = forwarded.split(',');
    return first?.trim() || null;
  }

  return null;
};
