import {
  prefetchDomainGroupScopedLists,
  selectEntitiesForDomainGroups,
} from './prefetch-domain-group-scoped-lists.util';
import { buildRedirectRuleListFilter } from '../utils/redirect-rules-list.util';

describe('prefetch-domain-group-scoped-lists.util', () => {
  it('prefetches link maps and redirect rules per domain group', () => {
    const linkMapStore = { searchList: vi.fn() };
    const redirectRuleStore = { searchList: vi.fn() };

    prefetchDomainGroupScopedLists(
      ['group-1', 'group-2'],
      { linkMapStore, redirectRuleStore },
      true,
    );

    expect(linkMapStore.searchList).toHaveBeenCalledWith({ domainGroupId: 'group-1' }, true);
    expect(linkMapStore.searchList).toHaveBeenCalledWith({ domainGroupId: 'group-2' }, true);
    expect(redirectRuleStore.searchList).toHaveBeenCalledWith(
      buildRedirectRuleListFilter('group-1'),
      true,
    );
    expect(redirectRuleStore.searchList).toHaveBeenCalledWith(
      buildRedirectRuleListFilter('group-2'),
      true,
    );
  });

  it('aggregates scoped list selections across domain groups', () => {
    const items = selectEntitiesForDomainGroups(
      [{ id: 'group-1' }, { id: 'group-2' }],
      (domainGroupId) => (domainGroupId === 'group-1' ? [{ id: 'a' }] : [{ id: 'b' }, { id: 'c' }]),
    );

    expect(items).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  });
});
