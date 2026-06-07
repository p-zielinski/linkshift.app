import type { RedirectRuleListQuery } from '../../core/models/redirect-rule.model';
import type { QueryResult } from '../../core/models/query-result.model';
import { refetchLoadedRedirectRulePagesForGroup } from './links-list-refresh.util';

describe('links-list-refresh.util', () => {
  it('refetches every loaded redirect rule page for a domain group', () => {
    const resultsByFilter: Record<string, QueryResult<string> | null> = {
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

    const getListResult = (filter: RedirectRuleListQuery) =>
      resultsByFilter[JSON.stringify(filter)] ?? null;

    const calls: Array<{ filter: RedirectRuleListQuery; force?: boolean }> = [];
    const searchList = (filter: RedirectRuleListQuery, force?: boolean) => {
      calls.push({ filter, force });
    };

    refetchLoadedRedirectRulePagesForGroup('group-1', getListResult, searchList);

    expect(calls).toEqual([
      { filter: { domainGroupId: 'group-1', limit: 100 }, force: true },
      {
        filter: { domainGroupId: 'group-1', limit: 100, startAfterId: 'cursor-1' },
        force: true,
      },
    ]);
  });
});
