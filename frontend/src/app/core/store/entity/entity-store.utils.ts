import type { QueryParams } from '../../models/query-params.model';

export const DEFAULT_LIST_KEY = '__all__';
export const CREATE_ENTITY_ID = '__create__';

export function getFilterKey(filter?: QueryParams | string | null): string {
  if (!filter) {
    return DEFAULT_LIST_KEY;
  }
  if (typeof filter === 'string') {
    return filter;
  }
  return stableStringify(filter);
}

export function getExpiration(ttlMs: number): number {
  return Date.now() + ttlMs;
}

export function isExpired(expiresAt?: number | null): boolean {
  return !expiresAt || expiresAt <= Date.now();
}

function stableStringify(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`);

  return `{${entries.join(',')}}`;
}
