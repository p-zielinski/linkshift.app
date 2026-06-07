import type { RedirectRuleListQuery } from '../../core/models/redirect-rule.model';
import type { QueryResult } from '../../core/models/query-result.model';
import { planRedirectRulePages } from '../../core/utils/redirect-rules-list.util';

export function refetchLoadedRedirectRulePagesForGroup(
  domainGroupId: string,
  getListResult: (filter: RedirectRuleListQuery) => QueryResult<string> | null | undefined,
  searchList: (filter: RedirectRuleListQuery, force?: boolean) => void,
): void {
  const { filters, results } = planRedirectRulePages(domainGroupId, getListResult);

  for (let index = 0; index < filters.length; index++) {
    if (results[index] != null) {
      searchList(filters[index]!, true);
    }
  }
}
