import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { createEntityStore } from './entity-store.factory';
import type { QueryResult } from '../../models/query-result.model';
import { DEFAULT_LIST_KEY } from './entity-store.utils';

type TestEntity = { id: string; name: string };
type TestCreate = { name: string };
type TestUpdate = { name?: string };
type TestFilter = { search?: string };

@Injectable()
class TestApiService {
  listCalls = 0;
  createCalls = 0;
  lastCreatePayload: TestCreate | null = null;
  listResult: QueryResult<TestEntity> = { data: [], hasMore: false };
  createResult: TestEntity = { id: '0', name: 'default' };

  list(filter?: TestFilter) {
    this.listCalls += 1;
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
});
