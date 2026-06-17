import type { LinkMapListQuery } from '../models/link-map.model';
import type { RedirectRuleListQuery } from '../models/redirect-rule.model';
import { buildRedirectRuleListFilter } from '../utils/redirect-rules-list.util';

export type DomainGroupScopedListStore<TFilter extends { domainGroupId: string }> = {
  searchList: (filter: TFilter, force?: boolean) => void;
};

export function prefetchDomainGroupScopedLists(
  domainGroupIds: readonly string[],
  stores: {
    linkMapStore: DomainGroupScopedListStore<LinkMapListQuery>;
    redirectRuleStore: DomainGroupScopedListStore<RedirectRuleListQuery>;
  },
  force = false,
): void {
  for (const domainGroupId of domainGroupIds) {
    stores.linkMapStore.searchList({ domainGroupId }, force);
    stores.redirectRuleStore.searchList(buildRedirectRuleListFilter(domainGroupId), force);
  }
}

export function selectEntitiesForDomainGroups<T>(
  domainGroups: readonly { id: string }[],
  selectForGroup: (domainGroupId: string) => readonly T[],
): T[] {
  return domainGroups.flatMap((group) => selectForGroup(group.id));
}
