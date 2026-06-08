import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { mergeMap, pipe, tap } from 'rxjs';
import { RedirectRulesApiService } from '../api/redirect-rules-api.service';
import type {
  RedirectRuleAnalyticsQuery,
  TopRedirectRuleEntry,
} from '../models/redirect-rule.model';
import { extractErrorMessage } from './store-error.utils';
import { getExpiration, getFilterKey, isExpired } from './entity/entity-store.utils';
import { DEFAULT_STORE_TTL_MS } from './store-cache.constants';
import { createStoreLoadGeneration } from './store-load-generation.util';

type RedirectRulesAnalyticsState = {
  results: Record<string, TopRedirectRuleEntry[]>;
  isLoading: Record<string, boolean>;
  errors: Record<string, string | null>;
  expirationDates: Record<string, number | null>;
};

const initialState: RedirectRulesAnalyticsState = {
  results: {},
  isLoading: {},
  errors: {},
  expirationDates: {},
};

const resetState = (): RedirectRulesAnalyticsState => ({
  results: {},
  isLoading: {},
  errors: {},
  expirationDates: {},
});

export const RedirectRulesAnalyticsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasAnyLoading: computed(() => Object.values(store.isLoading()).some(Boolean)),
  })),
  withMethods((store, api = inject(RedirectRulesApiService)) => {
    const loadGeneration = createStoreLoadGeneration();

    const setLoading = (key: string, value: boolean) => {
      patchState(store, (state) => ({
        isLoading: { ...state.isLoading, [key]: value },
      }));
    };

    const setSuccess = (key: string, entries: TopRedirectRuleEntry[]) => {
      patchState(store, (state) => ({
        results: { ...state.results, [key]: entries },
        errors: { ...state.errors, [key]: null },
        expirationDates: { ...state.expirationDates, [key]: getExpiration(DEFAULT_STORE_TTL_MS) },
      }));
    };

    const setFailure = (key: string, error: unknown) => {
      const message = extractErrorMessage(error, "Couldn't load analytics.");
      patchState(store, (state) => ({
        results: { ...state.results, [key]: [] },
        errors: { ...state.errors, [key]: message },
        expirationDates: { ...state.expirationDates, [key]: null },
      }));
    };

    const loadAnalytics = rxMethod<RedirectRuleAnalyticsQuery>(
      pipe(
        tap((query) => setLoading(getFilterKey(query), true)),
        mergeMap((query) => {
          const requestGeneration = loadGeneration.current();
          const key = getFilterKey(query);
          return api.analytics(query).pipe(
            tapResponse({
              next: (response) => {
                if (!loadGeneration.isCurrent(requestGeneration)) {
                  return;
                }
                setSuccess(key, response.data ?? []);
              },
              error: (error) => {
                if (!loadGeneration.isCurrent(requestGeneration)) {
                  return;
                }
                setFailure(key, error);
              },
              finalize: () => {
                if (!loadGeneration.isCurrent(requestGeneration)) {
                  return;
                }
                setLoading(key, false);
              },
            }),
          );
        }),
      ),
    );

    const searchAnalytics = (query: RedirectRuleAnalyticsQuery, force = false) => {
      const key = getFilterKey(query);
      const loading = store.isLoading()[key];
      const expiration = store.expirationDates()[key];
      const hasResult = key in store.results();

      if (loading) {
        return;
      }

      if (force || !hasResult || isExpired(expiration)) {
        loadAnalytics(query);
      }
    };

    const invalidateAnalytics = (query?: RedirectRuleAnalyticsQuery) => {
      if (!query) {
        patchState(store, { expirationDates: {} });
        return;
      }
      const key = getFilterKey(query);
      patchState(store, (state) => ({
        expirationDates: { ...state.expirationDates, [key]: null },
      }));
    };

    const selectAnalytics = (query: RedirectRuleAnalyticsQuery) => {
      const key = getFilterKey(query);
      return computed(() => store.results()[key] ?? []);
    };

    const selectLoading = (query: RedirectRuleAnalyticsQuery) => {
      const key = getFilterKey(query);
      return computed(() => !!store.isLoading()[key]);
    };

    const selectError = (query: RedirectRuleAnalyticsQuery) => {
      const key = getFilterKey(query);
      return computed(() => store.errors()[key] ?? null);
    };

    return {
      searchAnalytics,
      invalidateAnalytics,
      selectAnalytics,
      selectLoading,
      selectError,
      resetStore: () => {
        loadGeneration.bump();
        patchState(store, resetState());
      },
    };
  }),
);
