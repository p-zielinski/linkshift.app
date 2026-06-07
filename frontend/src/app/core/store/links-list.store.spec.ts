import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { LinksListApiService } from '../api/links-list-api.service';
import type { AggregatedLinkRow, LinksListQuery } from '../models/links-list.model';
import type { QueryResult } from '../models/query-result.model';
import { needsCursorListFetch } from '../utils/cursor-list-pagination.util';
import { getFilterKey } from './entity/entity-store.utils';
import { LinksListStore } from './links-list.store';

@Injectable()
class MockLinksListApiService {
  listCalls = 0;
  lastQuery: LinksListQuery | undefined;

  list(query?: LinksListQuery) {
    this.listCalls += 1;
    this.lastQuery = query;
    const result: QueryResult<AggregatedLinkRow> = {
      data: [
        {
          id: 'entry-1',
          domainGroupId: 'group-1',
          linkMapId: 'map-1',
          linkMapName: 'Default links',
          redirectRuleId: null,
          host: '',
          shortPath: '/go/launch',
          shortUrls: [],
          shortUrl: '/go/launch',
          key: 'launch',
          destination: 'https://example.com',
          updatedAt: '2026-06-05T10:00:00.000Z',
        },
      ],
      hasMore: false,
    };
    return of(result);
  }

  get() {
    return of({} as AggregatedLinkRow);
  }

  create() {
    return of({} as AggregatedLinkRow);
  }

  update() {
    return of({} as AggregatedLinkRow);
  }

  delete() {
    return of(void 0);
  }
}

describe('LinksListStore', () => {
  let store: InstanceType<typeof LinksListStore>;
  let api: MockLinksListApiService;

  const query: LinksListQuery = {
    limit: 5,
    domainGroupId: 'group-1',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockLinksListApiService,
        { provide: LinksListApiService, useExisting: MockLinksListApiService },
        LinksListStore,
      ],
    });
    store = TestBed.inject(LinksListStore);
    api = TestBed.inject(MockLinksListApiService);
  });

  it('loads once and reuses cache for the same filter key', () => {
    store.searchList(query);
    store.searchList({ domainGroupId: 'group-1', limit: 5 });

    expect(api.listCalls).toBe(1);
    expect(store.selectList(query)()).toHaveLength(1);
    expect(
      needsCursorListFetch(store.selectListResult(query)(), store.selectListExpiration(query)()),
    ).toBe(false);
  });

  it('uses a distinct cache key per query shape', () => {
    store.searchList(query);
    store.searchList({ limit: 20 });

    expect(api.listCalls).toBe(2);
    expect(getFilterKey(query)).not.toBe(getFilterKey({ limit: 20 }));
  });
});
