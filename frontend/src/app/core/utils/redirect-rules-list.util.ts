import type { RedirectRule, RedirectRuleListQuery } from '../models/redirect-rule.model';
import type { QueryResult } from '../models/query-result.model';
import { isExpired } from '../store/entity/entity-store.utils';

/** Backend max page size for `GET /api/v1/redirect-rules`. */
export const REDIRECT_RULES_LIST_LIMIT = 100;

/** Max cursor pages to fetch per domain group (50 × 100 = 5,000 rules). */
export const MAX_LINKS_FETCH_PAGES = 50;

export function isFetchTruncated(
  pageCount: number,
  lastPageResult: QueryResult<string> | null | undefined,
): boolean {
  return pageCount >= MAX_LINKS_FETCH_PAGES && !!lastPageResult?.moreStartingAfterId;
}

export function buildRedirectRuleListFilter(
  domainGroupId: string,
  startAfterId?: string,
): RedirectRuleListQuery {
  return {
    domainGroupId,
    limit: REDIRECT_RULES_LIST_LIMIT,
    ...(startAfterId ? { startAfterId } : {}),
  };
}

export function collectPaginatedRedirectRules(
  pages: ReadonlyArray<readonly RedirectRule[]>,
): RedirectRule[] {
  const byId = new Map<string, RedirectRule>();
  for (const page of pages) {
    for (const rule of page) {
      byId.set(rule.id, rule);
    }
  }
  return Array.from(byId.values());
}

export function listRedirectRulePageFilters(
  domainGroupId: string,
  pageResults: ReadonlyArray<QueryResult<string> | null | undefined>,
): RedirectRuleListQuery[] {
  const filters: RedirectRuleListQuery[] = [buildRedirectRuleListFilter(domainGroupId)];

  for (let index = 0; index < pageResults.length && filters.length < MAX_LINKS_FETCH_PAGES; index++) {
    const result = pageResults[index];
    const cursor = result?.moreStartingAfterId;
    if (!cursor) {
      break;
    }
    filters.push(buildRedirectRuleListFilter(domainGroupId, cursor));
  }

  return filters;
}

export function planRedirectRulePages(
  domainGroupId: string,
  getListResult: (filter: RedirectRuleListQuery) => QueryResult<string> | null | undefined,
): {
  filters: RedirectRuleListQuery[];
  results: (QueryResult<string> | null | undefined)[];
} {
  const results: (QueryResult<string> | null | undefined)[] = [];
  const filters: RedirectRuleListQuery[] = [buildRedirectRuleListFilter(domainGroupId)];

  let index = 0;
  while (index < filters.length) {
    const filter = filters[index];
    if (!filter) {
      break;
    }

    const result = getListResult(filter);
    results.push(result);
    const cursor = result?.moreStartingAfterId;
    if (!cursor || filters.length >= MAX_LINKS_FETCH_PAGES) {
      break;
    }
    filters.push(buildRedirectRuleListFilter(domainGroupId, cursor));
    index++;
  }

  return { filters, results };
}

export function nextRedirectRulePageFilterToFetch(
  domainGroupId: string,
  pageResults: ReadonlyArray<QueryResult<string> | null | undefined>,
  loadedFilterKeys: ReadonlySet<string>,
  getFilterKey: (filter: RedirectRuleListQuery) => string,
  getExpiration?: (filter: RedirectRuleListQuery) => number | null | undefined,
): RedirectRuleListQuery | null {
  for (const filter of listRedirectRulePageFilters(domainGroupId, pageResults)) {
    const key = getFilterKey(filter);
    const needsFetch =
      !loadedFilterKeys.has(key) ||
      (getExpiration !== undefined && isExpired(getExpiration(filter)));

    if (needsFetch) {
      return filter;
    }
  }

  return null;
}
