import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { mergeMap, pipe, tap } from 'rxjs';
import type { CustomPlanCatalog } from '../api/billing-api.service';
import { BillingApiService } from '../api/billing-api.service';
import { extractErrorMessage } from './store-error.utils';

export type CustomPlansState = {
  catalog: CustomPlanCatalog | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: CustomPlansState = {
  catalog: null,
  isLoading: false,
  error: null,
};

export const CustomPlansStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    plans: computed(() => store.catalog()?.plans ?? []),
    hasPlans: computed(() => (store.catalog()?.plans?.length ?? 0) > 0),
  })),
  withMethods((store, api = inject(BillingApiService)) => {
    const setError = (error: unknown, fallback: string) => {
      const message = extractErrorMessage(error, fallback);
      patchState(store, { error: message });
    };

    const loadPlans = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        mergeMap(() =>
          api.getCustomPlans().pipe(
            tapResponse({
              next: (catalog) => patchState(store, { catalog }),
              error: (error) => setError(error, 'Custom plans request failed.'),
              finalize: () => patchState(store, { isLoading: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadPlans,
    };
  }),
);
