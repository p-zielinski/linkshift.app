import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { mergeMap, pipe, tap } from 'rxjs';
import type { OrganizationUsage } from '../models/organization-usage.model';
import { OrganizationApiService } from '../api/organization-api.service';

type OrganizationUsageState = {
  usage: OrganizationUsage | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: OrganizationUsageState = {
  usage: null,
  isLoading: false,
  error: null,
};

export const OrganizationUsageStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasUsage: computed(() => !!store.usage()),
  })),
  withMethods((store, api = inject(OrganizationApiService)) => {
    const setError = (error: unknown, fallback: string) => {
      const message =
        error instanceof HttpErrorResponse
          ? error.error?.details || error.error?.message || error.message
          : fallback;
      patchState(store, { error: message });
    };

    const loadUsage = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        mergeMap(() =>
          api.getUsage().pipe(
            tapResponse({
              next: (usage) => patchState(store, { usage }),
              error: (error) => setError(error, 'Usage request failed.'),
              finalize: () => patchState(store, { isLoading: false }),
            }),
          ),
        ),
      ),
    );

    return {
      loadUsage,
    };
  }),
);
