import { HttpMethod } from '../models/http-method.model';
import type { RedirectRule } from '../models/redirect-rule.model';
import {
  MAX_LINKS_FETCH_PAGES,
  REDIRECT_RULES_LIST_LIMIT,
  buildRedirectRuleListFilter,
  collectPaginatedRedirectRules,
  isFetchTruncated,
  listRedirectRulePageFilters,
  nextRedirectRulePageFilterToFetch,
  planRedirectRulePages,
} from './redirect-rules-list.util';

describe('redirect-rules-list.util', () => {
  it('uses backend max page size for redirect rule list filters', () => {
    expect(buildRedirectRuleListFilter('group-1')).toEqual({
      domainGroupId: 'group-1',
      limit: REDIRECT_RULES_LIST_LIMIT,
    });
    expect(REDIRECT_RULES_LIST_LIMIT).toBe(100);
  });

  it('includes startAfterId for subsequent pages', () => {
    expect(buildRedirectRuleListFilter('group-1', 'rule-99')).toEqual({
      domainGroupId: 'group-1',
      limit: 100,
      startAfterId: 'rule-99',
    });
  });

  it('dedupes rules across paginated pages', () => {
    const rule: RedirectRule = {
      id: 'r1',
      domainGroupId: 'group-1',
      source: '/a',
      destination: 'https://example.com',
      statusCode: 302,
      matchMethod: [HttpMethod.GET],
      queryMatch: 'ignore',
      pathMatch: 'exact',
      priority: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    expect(
      collectPaginatedRedirectRules([
        [rule],
        [rule, { ...rule, id: 'r2', source: '/b' }],
      ]),
    ).toEqual([rule, { ...rule, id: 'r2', source: '/b' }]);
  });

  it('builds chained filters while moreStartingAfterId is present', () => {
    const filters = listRedirectRulePageFilters('group-1', [
      { data: ['rule-1'], hasMore: true, moreStartingAfterId: 'cursor-1' },
      { data: ['rule-2'], hasMore: true, moreStartingAfterId: 'cursor-2' },
      { data: ['rule-3'], hasMore: false },
    ]);

    expect(filters).toEqual([
      { domainGroupId: 'group-1', limit: 100 },
      { domainGroupId: 'group-1', limit: 100, startAfterId: 'cursor-1' },
      { domainGroupId: 'group-1', limit: 100, startAfterId: 'cursor-2' },
    ]);
  });

  it('caps chained filters at MAX_LINKS_FETCH_PAGES', () => {
    const pageResults = Array.from({ length: 60 }, (_, index) => ({
      data: [`rule-${index + 1}`],
      hasMore: true,
      moreStartingAfterId: `cursor-${index + 1}`,
    }));

    const filters = listRedirectRulePageFilters('group-1', pageResults);

    expect(filters).toHaveLength(MAX_LINKS_FETCH_PAGES);
    expect(filters[0]).toEqual({ domainGroupId: 'group-1', limit: 100 });
    expect(filters[MAX_LINKS_FETCH_PAGES - 1]).toEqual({
      domainGroupId: 'group-1',
      limit: 100,
      startAfterId: `cursor-${MAX_LINKS_FETCH_PAGES - 1}`,
    });
  });

  it('plans cursor pages up to MAX_LINKS_FETCH_PAGES', () => {
    const resultsByFilter: Record<
      string,
      { data: string[]; hasMore: boolean; moreStartingAfterId?: string }
    > = {};

    for (let index = 0; index < MAX_LINKS_FETCH_PAGES; index++) {
      const filter =
        index === 0
          ? { domainGroupId: 'group-1', limit: 100 }
          : {
              domainGroupId: 'group-1',
              limit: 100,
              startAfterId: `cursor-${index}`,
            };
      resultsByFilter[JSON.stringify(filter)] = {
        data: [`rule-${index + 1}`],
        hasMore: true,
        moreStartingAfterId: `cursor-${index + 1}`,
      };
    }

    const plan = planRedirectRulePages('group-1', (filter) => {
      const key = JSON.stringify(filter);
      return resultsByFilter[key] ?? null;
    });

    expect(plan.filters).toHaveLength(MAX_LINKS_FETCH_PAGES);
    expect(plan.results).toHaveLength(MAX_LINKS_FETCH_PAGES);
    expect(plan.results.at(-1)?.moreStartingAfterId).toBe(`cursor-${MAX_LINKS_FETCH_PAGES}`);
  });

  it('detects truncation when the page cap is reached with more pages available', () => {
    expect(
      isFetchTruncated(MAX_LINKS_FETCH_PAGES, {
        data: [],
        hasMore: true,
        moreStartingAfterId: 'cursor-next',
      }),
    ).toBe(true);
    expect(
      isFetchTruncated(MAX_LINKS_FETCH_PAGES, {
        data: [],
        hasMore: false,
      }),
    ).toBe(false);
    expect(
      isFetchTruncated(MAX_LINKS_FETCH_PAGES - 1, {
        data: [],
        hasMore: true,
        moreStartingAfterId: 'cursor-next',
      }),
    ).toBe(false);
  });

  it('returns the first missing page filter to fetch', () => {
    const loaded = new Set<string>();
    const getFilterKey = (filter: { domainGroupId: string; limit?: number; startAfterId?: string }) =>
      JSON.stringify(filter);

    const next = nextRedirectRulePageFilterToFetch(
      'group-1',
      [{ data: ['rule-1'], hasMore: true, moreStartingAfterId: 'cursor-1' }],
      loaded,
      getFilterKey,
    );

    expect(next).toEqual({
      domainGroupId: 'group-1',
      limit: 100,
    });
  });

  it('plans pages from list results', () => {
    const resultsByFilter: Record<string, { data: string[]; hasMore: boolean; moreStartingAfterId?: string }> =
      {
        '{"domainGroupId":"group-1","limit":100}': {
          data: ['rule-1'],
          hasMore: true,
          moreStartingAfterId: 'cursor-1',
        },
        '{"domainGroupId":"group-1","limit":100,"startAfterId":"cursor-1"}': {
          data: ['rule-2'],
          hasMore: false,
        },
      };

    const plan = planRedirectRulePages('group-1', (filter) => {
      const key = JSON.stringify(filter);
      return resultsByFilter[key] ?? null;
    });

    expect(plan.filters).toHaveLength(2);
    expect(plan.results).toHaveLength(2);
  });

  it('returns an expired loaded page filter for refetch', () => {
    const loaded = new Set<string>(['{"domainGroupId":"group-1","limit":100}']);
    const getFilterKey = (filter: { domainGroupId: string; limit?: number; startAfterId?: string }) =>
      JSON.stringify(filter);

    const next = nextRedirectRulePageFilterToFetch(
      'group-1',
      [{ data: ['rule-1'], hasMore: false }],
      loaded,
      getFilterKey,
      () => Date.now() - 1000,
    );

    expect(next).toEqual({
      domainGroupId: 'group-1',
      limit: 100,
    });
  });

  it('skips non-expired loaded page filters', () => {
    const loaded = new Set<string>([
      '{"domainGroupId":"group-1","limit":100}',
      '{"domainGroupId":"group-1","limit":100,"startAfterId":"cursor-1"}',
    ]);
    const getFilterKey = (filter: { domainGroupId: string; limit?: number; startAfterId?: string }) =>
      JSON.stringify(filter);
    const futureExpiration = Date.now() + 60_000;

    const next = nextRedirectRulePageFilterToFetch(
      'group-1',
      [
        { data: ['rule-1'], hasMore: true, moreStartingAfterId: 'cursor-1' },
        { data: ['rule-2'], hasMore: false },
      ],
      loaded,
      getFilterKey,
      () => futureExpiration,
    );

    expect(next).toBeNull();
  });
});
