import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  beginPendingCursorDelete,
  buildCursorPageFilter,
  createPendingCursorDeleteRefs,
  evaluatePendingCursorDeleteStep,
  needsCursorListFetch,
  refreshCursorListAfterDelete,
  type CursorListStore,
} from './cursor-list-pagination.util';

type TestBaseFilter = {
  domainGroupId: string;
  search?: string;
};

type TestListFilter = TestBaseFilter & {
  limit: number;
  startAfterId?: string;
};

describe('cursor-list-pagination.util', () => {
  describe('needsCursorListFetch', () => {
    it('returns true when list result is missing', () => {
      expect(needsCursorListFetch(null, Date.now() + 60_000)).toBe(true);
      expect(needsCursorListFetch(undefined, Date.now() + 60_000)).toBe(true);
    });

    it('returns true when list exists but expiration is missing or expired', () => {
      const listResult = { data: ['1'], hasMore: false };

      expect(needsCursorListFetch(listResult, null)).toBe(true);
      expect(needsCursorListFetch(listResult, undefined)).toBe(true);
      expect(needsCursorListFetch(listResult, Date.now() - 1)).toBe(true);
    });

    it('returns false when list exists and expiration is still valid', () => {
      const listResult = { data: ['1'], hasMore: false };

      expect(needsCursorListFetch(listResult, Date.now() + 60_000)).toBe(false);
    });
  });

  describe('buildCursorPageFilter', () => {
    it('builds first-page filter without startAfterId', () => {
      const filter = buildCursorPageFilter(
        { domainGroupId: 'group-1', search: 'foo' },
        1,
        20,
        { 1: null },
      );

      expect(filter).toEqual({
        domainGroupId: 'group-1',
        search: 'foo',
        limit: 20,
      });
    });

    it('includes startAfterId when page cursor exists', () => {
      const filter = buildCursorPageFilter(
        { domainGroupId: 'group-1' },
        3,
        50,
        { 1: null, 2: 'cursor-1', 3: 'cursor-2' },
      );

      expect(filter).toEqual({
        domainGroupId: 'group-1',
        limit: 50,
        startAfterId: 'cursor-2',
      });
    });
  });

  describe('refreshCursorListAfterDelete', () => {
    let store: CursorListStore<TestListFilter>;

    beforeEach(() => {
      store = {
        invalidateList: vi.fn(),
        searchList: vi.fn(),
      };
    });

    it('stays on page 1 after delete', () => {
      const page = signal(1);
      const pageCursors = signal({ 1: null });

      refreshCursorListAfterDelete<TestBaseFilter, TestListFilter>({
        baseFilter: { domainGroupId: 'group-1' },
        page,
        pageLimit: 20,
        pageCursors,
        currentPageItemCount: 5,
        store,
      });

      expect(page()).toBe(1);
      expect(store.invalidateList).toHaveBeenCalledTimes(1);
      expect(store.searchList).toHaveBeenCalledWith(
        { domainGroupId: 'group-1', limit: 20 },
        true,
      );
    });

    it('steps back when deleting the last item on page 3', () => {
      const page = signal(3);
      const pageCursors = signal({ 1: null, 2: 'cursor-1', 3: 'cursor-2' });

      refreshCursorListAfterDelete<TestBaseFilter, TestListFilter>({
        baseFilter: { domainGroupId: 'group-1' },
        page,
        pageLimit: 20,
        pageCursors,
        currentPageItemCount: 1,
        store,
      });

      expect(page()).toBe(2);
      expect(store.invalidateList).toHaveBeenCalledTimes(1);
      expect(store.searchList).toHaveBeenCalledWith(
        {
          domainGroupId: 'group-1',
          limit: 20,
          startAfterId: 'cursor-1',
        },
        true,
      );
    });

    it('invalidates and force-refetches the current page', () => {
      const page = signal(2);
      const pageCursors = signal({ 1: null, 2: 'cursor-1' });

      refreshCursorListAfterDelete<TestBaseFilter, TestListFilter>({
        baseFilter: { domainGroupId: 'group-1' },
        page,
        pageLimit: 20,
        pageCursors,
        currentPageItemCount: 4,
        store,
      });

      expect(page()).toBe(2);
      expect(store.invalidateList).toHaveBeenCalledTimes(1);
      expect(store.searchList).toHaveBeenCalledTimes(1);
      expect(store.searchList).toHaveBeenCalledWith(
        {
          domainGroupId: 'group-1',
          limit: 20,
          startAfterId: 'cursor-1',
        },
        true,
      );
    });

    it('does nothing when baseFilter is null', () => {
      const page = signal(2);
      const pageCursors = signal({ 1: null, 2: 'cursor-1' });

      refreshCursorListAfterDelete<TestBaseFilter, TestListFilter>({
        baseFilter: null,
        page,
        pageLimit: 20,
        pageCursors,
        currentPageItemCount: 1,
        store,
      });

      expect(store.invalidateList).not.toHaveBeenCalled();
      expect(store.searchList).not.toHaveBeenCalled();
    });
  });

  describe('evaluatePendingCursorDeleteStep', () => {
    it('does nothing when no delete is pending', () => {
      expect(
        evaluatePendingCursorDeleteStep({
          pendingId: null,
          deleteLoadingSeen: false,
          pendingPageItemCount: null,
          entityLoading: false,
        }),
      ).toEqual({
        nextDeleteLoadingSeen: false,
        shouldRefresh: false,
        pageItemCount: null,
        shouldClearPending: false,
      });
    });

    it('marks loading seen while entity delete is in flight', () => {
      expect(
        evaluatePendingCursorDeleteStep({
          pendingId: 'rule-1',
          deleteLoadingSeen: false,
          pendingPageItemCount: 3,
          entityLoading: true,
        }),
      ).toEqual({
        nextDeleteLoadingSeen: true,
        shouldRefresh: false,
        pageItemCount: null,
        shouldClearPending: false,
      });
    });

    it('waits for loading to start before refreshing', () => {
      expect(
        evaluatePendingCursorDeleteStep({
          pendingId: 'rule-1',
          deleteLoadingSeen: false,
          pendingPageItemCount: 3,
          entityLoading: false,
        }),
      ).toEqual({
        nextDeleteLoadingSeen: false,
        shouldRefresh: false,
        pageItemCount: null,
        shouldClearPending: false,
      });
    });

    it('refreshes after loading completes', () => {
      expect(
        evaluatePendingCursorDeleteStep({
          pendingId: 'rule-1',
          deleteLoadingSeen: true,
          pendingPageItemCount: 3,
          entityLoading: false,
        }),
      ).toEqual({
        nextDeleteLoadingSeen: false,
        shouldRefresh: true,
        pageItemCount: 3,
        shouldClearPending: true,
      });
    });
  });

  describe('beginPendingCursorDelete', () => {
    it('captures page item count and resets loading seen', () => {
      const refs = createPendingCursorDeleteRefs();
      refs.deleteLoadingSeen.set(true);

      beginPendingCursorDelete(refs, 'rule-1', 5);

      expect(refs.pendingDeleteId()).toBe('rule-1');
      expect(refs.pendingDeletePageItemCount()).toBe(5);
      expect(refs.deleteLoadingSeen()).toBe(false);
    });
  });
});
