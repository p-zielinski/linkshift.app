import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import type { RedirectTestResult } from '../models/redirect-test.model';

export type RedirectTestRunState = {
  lastResult: RedirectTestResult | null;
  lastError: string | null;
  lastRunAt: string | null;
};

type RedirectTestResultsState = {
  results: Record<string, RedirectTestRunState>;
};

const initialState: RedirectTestResultsState = {
  results: {}
};

export const RedirectTestResultsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const setResult = (
      id: string,
      lastResult: RedirectTestResult | null,
      lastError: string | null,
      lastRunAt: string | null
    ) => {
      patchState(store, (state) => ({
        results: {
          ...state.results,
          [id]: { lastResult, lastError, lastRunAt }
        }
      }));
    };

    const setSuccess = (id: string, result: RedirectTestResult) => {
      setResult(id, result, null, new Date().toISOString());
    };

    const setFailure = (id: string, error: string) => {
      setResult(id, null, error, new Date().toISOString());
    };

    const clearAll = () => {
      patchState(store, { results: {} });
    };

    const clearByIds = (ids: string[]) => {
      if (ids.length === 0) {
        return;
      }
      patchState(store, (state) => {
        const next = { ...state.results };
        ids.forEach((id) => {
          delete next[id];
        });
        return { results: next };
      });
    };

    return {
      setSuccess,
      setFailure,
      setResult,
      clearAll,
      clearByIds
    };
  })
);
