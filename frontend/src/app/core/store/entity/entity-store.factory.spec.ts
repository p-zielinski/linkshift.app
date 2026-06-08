import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { createEntityStore } from './entity-store.factory';
import type { QueryResult } from '../../models/query-result.model';
import { needsCursorListFetch } from '../../utils/cursor-list-pagination.util';
import { DEFAULT_LIST_KEY } from './entity-store.utils';

type TestEntity = { id: string; name: string };
type TestCreate = { name: string };
type TestUpdate = { name?: string };
type TestFilter = { search?: string; limit?: number };

@Injectable()
class TestApiService {
  listCalls = 0;
  createCalls = 0;
  lastCreatePayload: TestCreate | null = null;
  listResult: QueryResult<TestEntity> = { data: [], hasMore: false };
  createResult: TestEntity = { id: '0', name: 'default' };
  listShouldFail = false;
  listUseSubject = false;
  listSubject = new Subject<QueryResult<TestEntity>>();

  list(filter?: TestFilter) {
    this.listCalls += 1;
    if (this.listShouldFail) {
      return throwError(() => new Error('list failed'));
    }
    if (this.listUseSubject) {
      return this.listSubject.asObservable();
    }
    return of(this.listResult);
  }

  get(id: string) {
    return of({ id, name: 'detail' });
  }

  create(payload: TestCreate) {
    this.createCalls += 1;
    this.lastCreatePayload = payload;
    return of(this.createResult);
  }

  update(id: string, payload: TestUpdate) {
    return of({ id, name: payload.name ?? 'updated' });
  }

  delete(id: string) {
    return of(void 0);
  }
}

const TestStore = createEntityStore<TestEntity, TestCreate, TestUpdate, TestFilter>({
  identifier: 'id',
  api: TestApiService,
  entityLabel: 'Test entity',
  listTtlMs: 60_000,
});

describe('createEntityStore', () => {
  let store: InstanceType<typeof TestStore>;
  let api: TestApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestApiService, TestStore],
    });
    store = TestBed.inject(TestStore);
    api = TestBed.inject(TestApiService);
    api.listUseSubject = false;
    api.listSubject = new Subject<QueryResult<TestEntity>>();
  });

  it('loads a list once and reuses cache', () => {
    api.listResult = {
      data: [{ id: '1', name: 'First' }],
      hasMore: false,
    };

    store.searchList();
    store.searchList();

    expect(api.listCalls).toBe(1);
    expect(store.list()[DEFAULT_LIST_KEY]?.data).toEqual(['1']);
  });

  it('adds newly created entities to the default list', () => {
    api.listResult = {
      data: [{ id: '1', name: 'First' }],
      hasMore: false,
    };
    store.searchList();

    api.createResult = { id: '2', name: 'Second' };
    store.upsert({ entity: { name: 'Second' } });

    const list = store.list()[DEFAULT_LIST_KEY]?.data ?? [];
    expect(api.createCalls).toBe(1);
    expect(api.lastCreatePayload).toEqual({ name: 'Second' });
    expect(list).toEqual(['1', '2']);
  });

  it('exposes list expiration for a filter key', () => {
    api.listResult = {
      data: [{ id: '1', name: 'First' }],
      hasMore: false,
    };

    expect(store.selectListExpiration()()).toBeNull();

    store.searchList();

    expect(store.selectListExpiration()()).toBeGreaterThan(Date.now());
  });

  it('reuses cache when filter objects differ only by key order', () => {
    api.listResult = {
      data: [{ id: '1', name: 'First' }],
      hasMore: false,
    };

    store.searchList({ search: 'summer', limit: 20 });
    store.searchList({ limit: 20, search: 'summer' });

    expect(api.listCalls).toBe(1);
  });

  it('does not cache list failures and retries on next searchList', () => {
    api.listShouldFail = true;

    store.searchList();
    store.searchList();

    expect(api.listCalls).toBe(2);
    expect(store.selectListResult()()).toEqual({ data: [], hasMore: false });
    expect(needsCursorListFetch(store.selectListResult()(), store.selectListExpiration()())).toBe(
      true,
    );
  });

  it('ignores stale list responses after resetStore', () => {
    api.listResult = {
      data: [{ id: '1', name: 'First' }],
      hasMore: false,
    };

    store.searchList();
    expect(store.list()[DEFAULT_LIST_KEY]?.data).toEqual(['1']);

    api.listUseSubject = true;
    store.searchList(undefined, true);

    store.resetStore();
    expect(store.list()[DEFAULT_LIST_KEY]).toBeUndefined();
    expect(store.selectListResult()()).toBeNull();

    api.listSubject.next({
      data: [{ id: '2', name: 'Stale' }],
      hasMore: false,
    });

    expect(store.list()[DEFAULT_LIST_KEY]).toBeUndefined();
    expect(store.selectListResult()()).toBeNull();
    expect(store.isLoading()[DEFAULT_LIST_KEY]).toBeUndefined();
  });

  it('sets expiration to null on list failure', () => {
    api.listShouldFail = true;

    store.searchList();

    expect(store.expirationDates()[DEFAULT_LIST_KEY]).toBeNull();
  });
});
