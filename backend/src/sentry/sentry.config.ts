import type { ErrorEvent, EventHint } from '@sentry/core';

export const SENTRY_REDACTED_VALUE = '[Filtered]';

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
]);

const SENSITIVE_FIELD_PATTERN =
  /^(password|passwd|token|refresh_token|access_token|secret|api_key|apikey|api-key)$/i;

const SENSITIVE_COOKIE_NAMES = new Set(['refresh_token', 'access_token', 'session']);

export function isSensitiveFieldName(key: string): boolean {
  return SENSITIVE_FIELD_PATTERN.test(key);
}

export function scrubSensitiveRecord(
  record: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!record) {
    return record;
  }

  const scrubbed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase();
    if (SENSITIVE_HEADER_NAMES.has(normalizedKey) || isSensitiveFieldName(key)) {
      scrubbed[key] = SENTRY_REDACTED_VALUE;
      continue;
    }
    scrubbed[key] = scrubSensitiveValue(value);
  }
  return scrubbed;
}

export function scrubCookieValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .split(';')
      .map((part) => {
        const trimmed = part.trim();
        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) {
          return trimmed;
        }
        const name = trimmed.slice(0, separatorIndex).trim().toLowerCase();
        if (SENSITIVE_COOKIE_NAMES.has(name)) {
          return `${trimmed.slice(0, separatorIndex)}=${SENTRY_REDACTED_VALUE}`;
        }
        return trimmed;
      })
      .join('; ');
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return scrubSensitiveRecord(value as Record<string, unknown>);
  }

  return value;
}

export function scrubSensitiveValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => scrubSensitiveValue(entry));
  }

  if (value && typeof value === 'object') {
    return scrubSensitiveRecord(value as Record<string, unknown>);
  }

  return value;
}

export function scrubSentryEvent(event: ErrorEvent, _hint?: EventHint): ErrorEvent {
  if (event.request) {
    if (event.request.headers) {
      event.request.headers = scrubSensitiveRecord(
        event.request.headers as Record<string, unknown>,
      ) as typeof event.request.headers;
    }

    if (event.request.cookies) {
      event.request.cookies = scrubCookieValue(event.request.cookies) as typeof event.request.cookies;
    }

    if (event.request.data) {
      event.request.data = scrubSensitiveValue(event.request.data);
    }

    if (event.request.query_string && typeof event.request.query_string === 'string') {
      event.request.query_string = scrubCookieValue(event.request.query_string) as string;
    }
  }

  if (event.extra) {
    event.extra = scrubSensitiveRecord(event.extra as Record<string, unknown>) as typeof event.extra;
  }

  if (event.contexts) {
    for (const [contextKey, contextValue] of Object.entries(event.contexts)) {
      if (contextValue && typeof contextValue === 'object') {
        event.contexts[contextKey] = scrubSensitiveRecord(
          contextValue as Record<string, unknown>,
        ) as (typeof event.contexts)[string];
      }
    }
  }

  return event;
}

export function createSentryInitOptions(nodeEnv: string, dsn: string) {
  return {
    dsn,
    environment: nodeEnv,
    sendDefaultPii: false,
    beforeSend: scrubSentryEvent,
  };
}
