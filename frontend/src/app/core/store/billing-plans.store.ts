import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { mergeMap, pipe, tap } from 'rxjs';
import {
  BillingApiService,
  BillingPlanCatalog,
} from '../api/billing-api.service';
import { extractErrorMessage } from './store-error.utils';
import { createStoreLoadGeneration } from './store-load-generation.util';

export type BillingPlansState = {
  catalog: BillingPlanCatalog | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: BillingPlansState = {
  catalog: null,
  isLoading: false,
  error: null,
};

const resetState = (): BillingPlansState => ({
  catalog: null,
  isLoading: false,
  error: null,
});

export const BillingPlansStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    plans: computed(() => store.catalog()?.plans ?? []),
    limits: computed(() => store.catalog()?.limits ?? null),
    hasCatalog: computed(() => !!store.catalog()),
  })),
  withMethods((store, api = inject(BillingApiService)) => {
    const loadGeneration = createStoreLoadGeneration();

    const setError = (error: unknown, fallback: string) => {
      const message = extractErrorMessage(error, fallback);
      patchState(store, { error: message });
    };

    const loadPlans = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        mergeMap(() => {
          const requestGeneration = loadGeneration.current();
          return api.getPlans().pipe(
            tapResponse({
              next: (catalog) => {
                if (!loadGeneration.isCurrent(requestGeneration)) {
                  return;
                }
                patchState(store, { catalog });
              },
              error: (error) => {
                if (!loadGeneration.isCurrent(requestGeneration)) {
                  return;
                }
                setError(error, 'Billing plans request failed.');
              },
              finalize: () => {
                if (!loadGeneration.isCurrent(requestGeneration)) {
                  return;
                }
                patchState(store, { isLoading: false });
              },
            }),
          );
        }),
      ),
    );

    return {
      loadPlans,
      resetStore: () => {
        loadGeneration.bump();
        patchState(store, resetState());
      },
    };
  }),
);
