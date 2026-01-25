import type { QueryResult } from '../../models/query-result.model';

export class BaseEntityState<T extends Record<string, unknown>> {
  identifier: keyof T;
  list: Record<string, QueryResult<string>> = {};
  details: Record<string, T | null> = {};
  isLoading: Record<string, boolean> = {};
  expirationDates: Record<string, number | null> = {};
  lastError: string | null = null;

  constructor(identifier: keyof T) {
    this.identifier = identifier;
  }
}
