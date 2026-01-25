import type { Type } from '@angular/core';
import type { Observable } from 'rxjs';
import type { QueryResult } from '../../models/query-result.model';
import type { QueryParams } from '../../models/query-params.model';

export type EntityListFilter = QueryParams | string | undefined;

export interface EntityApi<T, TCreate, TUpdate, TFilter extends EntityListFilter> {
  list(filter?: TFilter): Observable<QueryResult<T>>;
  get(id: string): Observable<T>;
  create(payload: TCreate): Observable<T>;
  update(id: string, payload: TUpdate): Observable<T>;
  delete(id: string): Observable<void>;
}

export type EntityStoreConfig<
  T,
  TCreate,
  TUpdate,
  TFilter extends EntityListFilter
> = {
  identifier: keyof T;
  api: Type<EntityApi<T, TCreate, TUpdate, TFilter>>;
  listTtlMs?: number;
};
