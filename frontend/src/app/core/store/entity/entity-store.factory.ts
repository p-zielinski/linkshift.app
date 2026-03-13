import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { mergeMap, pipe, tap } from 'rxjs';
import { BaseEntityState } from './base-entity.state';
import type { EntityListFilter, EntityStoreConfig } from './entity-store.types';
import {
  CREATE_ENTITY_ID,
  DEFAULT_LIST_KEY,
  getExpiration,
  getFilterKey,
  isExpired
} from './entity-store.utils';
import type { QueryResult } from '../../models/query-result.model';
import { extractErrorMessage } from '../store-error.utils';
import { OrganizationUsageStore } from '../organization-usage.store';
import { DEFAULT_STORE_TTL_MS } from '../store-cache.constants';

export function createEntityStore<
  T extends Record<string, unknown>,
  TCreate,
  TUpdate,
  TFilter extends EntityListFilter
>(config: EntityStoreConfig<T, TCreate, TUpdate, TFilter>) {
  const ttlMs = config.listTtlMs ?? DEFAULT_STORE_TTL_MS;
  const identifier = config.identifier;
  const entityLabel = config.entityLabel ?? 'Entry';

  return signalStore(
    { providedIn: 'root' },
    withState(new BaseEntityState<T>(identifier)),
    withComputed((store) => ({
      hasAnyLoading: computed(() => Object.values(store.isLoading()).some(Boolean))
    })),
    withMethods((store, api = inject(config.api)) => {
      const usageStore = config.invalidateUsageOnMutations
        ? inject(OrganizationUsageStore)
        : null;

      const getEntityId = (entity: T): string => {
        return String(entity[identifier]);
      };

      const setLoading = (key: string, value: boolean) => {
        patchState(store, (state) => ({
          isLoading: { ...state.isLoading, [key]: value }
        }));
      };

      const mergeDetails = (items: T[], stateDetails: Record<string, T | null>) => {
        const nextDetails = { ...stateDetails };
        items.forEach((item) => {
          const id = getEntityId(item);
          const existing = nextDetails[id] ?? {};
          nextDetails[id] = { ...existing, ...item };
        });
        return nextDetails;
      };

      const setListSuccess = (filterKey: string, result: QueryResult<T>) => {
        patchState(store, (state) => {
          const ids = result.data.map((item) => getEntityId(item));
          const nextList: QueryResult<string> = {
            ...result,
            data: ids
          };

          return {
            list: { ...state.list, [filterKey]: nextList },
            details: mergeDetails(result.data, state.details),
            expirationDates: {
              ...state.expirationDates,
              [filterKey]: getExpiration(ttlMs)
            }
          };
        });
        clearError();
      };

      const setListFailure = (filterKey: string) => {
        patchState(store, (state) => ({
          list: {
            ...state.list,
            [filterKey]: { data: [], hasMore: false }
          },
          expirationDates: { ...state.expirationDates, [filterKey]: null }
        }));
      };

      const setDetailsSuccess = (id: string, item: T) => {
        patchState(store, (state) => ({
          details: { ...state.details, [id]: { ...(state.details[id] ?? {}), ...item } },
          expirationDates: { ...state.expirationDates, [id]: getExpiration(ttlMs) }
        }));
        clearError();
      };

      const setDetailsFailure = (id: string) => {
        patchState(store, (state) => ({
          details: { ...state.details, [id]: null },
          expirationDates: { ...state.expirationDates, [id]: null }
        }));
      };

      const markListKeysExpired = (exclude: string[] = []) => {
        patchState(store, (state) => {
          const nextExpirations = { ...state.expirationDates };
          Object.keys(state.list).forEach((key) => {
            if (!exclude.includes(key)) {
              nextExpirations[key] = null;
            }
          });
          return { expirationDates: nextExpirations };
        });
      };

      const addToDefaultList = (id: string) => {
        let updated = false;
        patchState(store, (state) => {
          const list = state.list[DEFAULT_LIST_KEY];
          if (!list || list.data.includes(id)) {
            return {};
          }
          updated = true;
          return {
            list: {
              ...state.list,
              [DEFAULT_LIST_KEY]: { ...list, data: [...list.data, id] }
            },
            expirationDates: {
              ...state.expirationDates,
              [DEFAULT_LIST_KEY]: getExpiration(ttlMs)
            }
          };
        });
        return updated;
      };

      const removeFromLists = (id: string) => {
        patchState(store, (state) => {
          const nextList: Record<string, QueryResult<string>> = {};

          Object.entries(state.list).forEach(([key, result]) => {
            const nextData = result.data.filter((entryId) => entryId !== id);
            nextList[key] = nextData.length === result.data.length
              ? result
              : { ...result, data: nextData };
          });

          return { list: nextList };
        });
      };

      const loadList = rxMethod<TFilter | undefined>(
        pipe(
          tap((filter) => setLoading(getFilterKey(filter), true)),
          mergeMap((filter) => {
            const filterKey = getFilterKey(filter);
            return api.list(filter).pipe(
              tapResponse({
                next: (result) => setListSuccess(filterKey, result),
                error: (error) => {
                  setListFailure(filterKey);
                  setError(error, `${entityLabel} list request failed.`);
                },
                finalize: () => setLoading(filterKey, false)
              })
            );
          })
        )
      );

      const loadDetails = rxMethod<string>(
        pipe(
          tap((id) => setLoading(id, true)),
          mergeMap((id) =>
            api.get(id).pipe(
              tapResponse({
                next: (result) => setDetailsSuccess(id, result),
                error: (error) => {
                  setDetailsFailure(id);
                  setError(error, `${entityLabel} details request failed.`);
                },
                finalize: () => setLoading(id, false)
              })
            )
          )
        )
      );

      const upsert = rxMethod<{ id?: string; entity: TCreate | TUpdate }>(
        pipe(
          tap(({ id }) => setLoading(id ?? CREATE_ENTITY_ID, true)),
          mergeMap(({ id, entity }) => {
            const request$ = id
              ? api.update(id, entity as TUpdate)
              : api.create(entity as TCreate);

            return request$.pipe(
              tapResponse({
                next: (result) => {
                  const entityId = getEntityId(result);
                  setDetailsSuccess(entityId, result);
                  setLoading(entityId, false);
                  if (!id) {
                    const updatedDefault = addToDefaultList(entityId);
                    markListKeysExpired(updatedDefault ? [DEFAULT_LIST_KEY] : []);
                    usageStore?.invalidateUsage();
                  } else {
                    markListKeysExpired();
                  }
                },
                error: (error) => setError(error, `${entityLabel} save failed.`),
                finalize: () => setLoading(id ?? CREATE_ENTITY_ID, false)
              })
            );
          })
        )
      );

      const remove = rxMethod<string>(
        pipe(
          tap((id) => setLoading(id, true)),
          mergeMap((id) =>
            api.delete(id).pipe(
              tapResponse({
                next: () => {
                  setDetailsFailure(id);
                  removeFromLists(id);
                  markListKeysExpired();
                  usageStore?.invalidateUsage();
                },
                error: (error) => setError(error, `${entityLabel} delete failed.`),
                finalize: () => setLoading(id, false)
              })
            )
          )
        )
      );

      const searchList = (filter?: TFilter, force = false) => {
        const filterKey = getFilterKey(filter);
        const list = store.list()[filterKey];
        const expiration = store.expirationDates()[filterKey];
        const loading = store.isLoading()[filterKey];

        if (loading) {
          return;
        }

        if (force || !list || isExpired(expiration)) {
          loadList(filter);
        }
      };

      const searchDetails = (id: string, force = false) => {
        const existing = store.details()[id];
        const expiration = store.expirationDates()[id];
        const loading = store.isLoading()[id];

        if (loading) {
          return;
        }

        if (force || !existing || isExpired(expiration)) {
          loadDetails(id);
        }
      };

      const invalidateStore = () => {
        patchState(store, { expirationDates: {} });
      };

      const invalidateList = () => {
        patchState(store, (state) => {
          const nextExpirations = { ...state.expirationDates };
          const nextLoading = { ...state.isLoading };

          Object.keys(state.list).forEach((key) => {
            delete nextExpirations[key];
            delete nextLoading[key];
          });

          return {
            list: {},
            expirationDates: nextExpirations,
            isLoading: nextLoading
          };
        });
      };

      const resetStore = () => {
        patchState(store, new BaseEntityState<T>(identifier));
      };

      const selectById = (id: string) =>
        computed(() => store.details()[id] ?? null);

      const selectList = (filter?: TFilter | string) => {
        const filterKey = getFilterKey(filter);
        return computed(() => {
          const result = store.list()[filterKey];
          if (!result) {
            return [] as T[];
          }
          return result.data
            .map((entityId) => store.details()[entityId])
            .filter((item): item is T => !!item);
        });
      };

      const selectListResult = (filter?: TFilter | string) => {
        const filterKey = getFilterKey(filter);
        return computed(() => store.list()[filterKey] ?? null);
      };

      const clearError = () => {
        patchState(store, { lastError: null });
      };

      const setError = (error: unknown, fallback: string) => {
      const message = extractErrorMessage(error, fallback);
      patchState(store, (state) => ({
        lastError: message,
        errorSequence: state.errorSequence + 1
      }));
      };

      return {
        loadList,
        searchList,
        loadDetails,
        searchDetails,
        upsert,
        remove,
        invalidateStore,
        invalidateList,
        resetStore,
        selectById,
        selectList,
        selectListResult,
        clearError
      };
    })
  );
}
