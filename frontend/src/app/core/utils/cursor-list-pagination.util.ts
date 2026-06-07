import { effect, signal, type Signal, type WritableSignal } from '@angular/core';
import type { QueryResult } from '../models/query-result.model';
import { isExpired } from '../store/entity/entity-store.utils';

export type CursorPageCursors = Record<number, string | null>;

export type CursorListStore<TFilter> = {
  invalidateList(): void;
  searchList(filter?: TFilter, force?: boolean): void;
};

export type RefreshCursorListAfterDeleteOptions<TBaseFilter, TListFilter> = {
  baseFilter: TBaseFilter | null;
  page: WritableSignal<number>;
  pageLimit: number;
  pageCursors: WritableSignal<CursorPageCursors>;
  currentPageItemCount: number;
  store: CursorListStore<TListFilter>;
};

export function needsCursorListFetch(
  listResult: QueryResult<unknown> | null | undefined,
  expiration: number | null | undefined,
): boolean {
  return !listResult || isExpired(expiration);
}

export function buildCursorPageFilter<TFilter>(
  baseFilter: TFilter,
  page: number,
  pageLimit: number,
  pageCursors: CursorPageCursors,
): TFilter & { limit: number; startAfterId?: string } {
  const cursor = pageCursors[page];
  return {
    ...baseFilter,
    limit: pageLimit,
    ...(cursor ? { startAfterId: cursor } : {}),
  };
}

export function refreshCursorListAfterDelete<TBaseFilter, TListFilter>(
  options: RefreshCursorListAfterDeleteOptions<TBaseFilter, TListFilter>,
): void {
  const { baseFilter, page, pageLimit, pageCursors, currentPageItemCount, store } = options;

  if (!baseFilter) {
    return;
  }

  const currentPage = page();
  if (currentPageItemCount === 1 && currentPage > 1) {
    page.set(currentPage - 1);
  }

  store.invalidateList();
  store.searchList(
    buildCursorPageFilter(baseFilter, page(), pageLimit, pageCursors()) as TListFilter,
    true,
  );
}

/**
 * Tracks a cursor-paginated delete until the entity store's per-id `isLoading` flag
 * completes. Pair with `registerRefreshCursorListAfterDeleteEffect` so list refresh runs
 * only after the DELETE API finishes (not immediately after `store.remove(id)`).
 */
export type PendingCursorDeleteRefs = {
  pendingDeleteId: WritableSignal<string | null>;
  deleteLoadingSeen: WritableSignal<boolean>;
  pendingDeletePageItemCount: WritableSignal<number | null>;
};

export function createPendingCursorDeleteRefs(): PendingCursorDeleteRefs {
  return {
    pendingDeleteId: signal<string | null>(null),
    deleteLoadingSeen: signal(false),
    pendingDeletePageItemCount: signal<number | null>(null),
  };
}

export function beginPendingCursorDelete(
  refs: PendingCursorDeleteRefs,
  entityId: string,
  currentPageItemCount: number,
): void {
  refs.pendingDeletePageItemCount.set(currentPageItemCount);
  refs.pendingDeleteId.set(entityId);
  refs.deleteLoadingSeen.set(false);
}

export type PendingCursorDeleteStepInput = {
  pendingId: string | null;
  deleteLoadingSeen: boolean;
  pendingPageItemCount: number | null;
  entityLoading: boolean;
};

export type PendingCursorDeleteStepResult = {
  nextDeleteLoadingSeen: boolean;
  shouldRefresh: boolean;
  pageItemCount: number | null;
  shouldClearPending: boolean;
};

export function evaluatePendingCursorDeleteStep(
  input: PendingCursorDeleteStepInput,
): PendingCursorDeleteStepResult {
  if (!input.pendingId) {
    return {
      nextDeleteLoadingSeen: input.deleteLoadingSeen,
      shouldRefresh: false,
      pageItemCount: null,
      shouldClearPending: false,
    };
  }

  if (input.entityLoading) {
    return {
      nextDeleteLoadingSeen: true,
      shouldRefresh: false,
      pageItemCount: null,
      shouldClearPending: false,
    };
  }

  if (!input.deleteLoadingSeen) {
    return {
      nextDeleteLoadingSeen: input.deleteLoadingSeen,
      shouldRefresh: false,
      pageItemCount: null,
      shouldClearPending: false,
    };
  }

  return {
    nextDeleteLoadingSeen: false,
    shouldRefresh: true,
    pageItemCount: input.pendingPageItemCount,
    shouldClearPending: true,
  };
}

export function registerRefreshCursorListAfterDeleteEffect(
  refs: PendingCursorDeleteRefs,
  isLoadingById: Signal<Record<string, boolean | undefined>>,
  onDeleteComplete: (currentPageItemCount: number) => void,
): void {
  effect(() => {
    const pendingId = refs.pendingDeleteId();
    const step = evaluatePendingCursorDeleteStep({
      pendingId,
      deleteLoadingSeen: refs.deleteLoadingSeen(),
      pendingPageItemCount: refs.pendingDeletePageItemCount(),
      entityLoading: pendingId ? (isLoadingById()[pendingId] ?? false) : false,
    });

    if (step.nextDeleteLoadingSeen !== refs.deleteLoadingSeen()) {
      refs.deleteLoadingSeen.set(step.nextDeleteLoadingSeen);
    }

    if (step.shouldClearPending) {
      refs.pendingDeleteId.set(null);
      refs.deleteLoadingSeen.set(false);
      refs.pendingDeletePageItemCount.set(null);
    }

    if (step.shouldRefresh && step.pageItemCount !== null) {
      onDeleteComplete(step.pageItemCount);
    }
  });
}
