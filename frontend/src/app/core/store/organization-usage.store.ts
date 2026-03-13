import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { mergeMap, pipe, tap } from 'rxjs';
import type { OrganizationUsage } from '../models/organization-usage.model';
import { OrganizationApiService } from '../api/organization-api.service';
import { extractErrorMessage } from './store-error.utils';
import { getExpiration, isExpired } from './entity/entity-store.utils';
import { DEFAULT_STORE_TTL_MS } from './store-cache.constants';

type OrganizationUsageState = {
  usage: OrganizationUsage | null;
  isLoading: boolean;
  error: string | null;
  expiresAt: number | null;
};

const initialState: OrganizationUsageState = {
  usage: null,
  isLoading: false,
  error: null,
  expiresAt: null,
};

const resetState = (): OrganizationUsageState => ({
  usage: null,
  isLoading: false,
  error: null,
  expiresAt: null,
});

export const OrganizationUsageStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasUsage: computed(() => !!store.usage()),
  })),
  withMethods((store, api = inject(OrganizationApiService)) => {
    const setError = (error: unknown, fallback: string) => {
      const message = extractErrorMessage(error, fallback);
      patchState(store, { error: message });
    };

    const fetchUsage = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        mergeMap(() =>
          api.getUsage().pipe(
            tapResponse({
              next: (usage) =>
                patchState(store, { usage, expiresAt: getExpiration(DEFAULT_STORE_TTL_MS) }),
              error: (error) => {
                setError(error, 'Usage request failed.');
                patchState(store, { expiresAt: null });
              },
              finalize: () => patchState(store, { isLoading: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadUsage: (force = false) => {
        if (store.isLoading()) {
          return;
        }
        if (force || !store.usage() || isExpired(store.expiresAt())) {
          fetchUsage();
        }
      },
      invalidateUsage: () =>
        patchState(store, { expiresAt: null, error: null }),
      resetStore: () => patchState(store, resetState()),
    };
  }),
);
