import type { QueryResult } from '../../core/models/query-result.model';
import { needsCursorListFetch } from '../../core/utils/cursor-list-pagination.util';

export type CampaignHomeRecentLinksLoadingParams = {
  usageLoading: boolean;
  domainGroupsLoading: boolean;
  linkMapEntryCount: number;
  linksListLoaded: boolean;
};

export type CampaignHomeRecentLinksFetchParams = {
  hasLinkMapEntries: boolean;
  listResult: QueryResult<unknown> | null | undefined;
  expiration: number | null | undefined;
};

export type CampaignHomeRecentLinksDisplayParams = {
  recentLinksLoading: boolean;
  hasLinkMapEntries: boolean;
  linksListLoaded: boolean;
  linksListEmpty: boolean;
  fetchFailed: boolean;
};

/**
 * Recent links should wait only for initial list loads, not background refreshes.
 * If cached list data exists, keep showing it even when `isLoading` is still true.
 */
export function resolveCampaignHomeRecentLinksLoading(
  params: CampaignHomeRecentLinksLoadingParams,
): boolean {
  if (params.usageLoading || params.domainGroupsLoading) {
    return true;
  }

  if (params.linkMapEntryCount <= 0) {
    return false;
  }

  return !params.linksListLoaded;
}

/** Respects entity-store cache; skips fetch when a valid cached list exists. */
export function shouldFetchCampaignHomeRecentLinks(
  params: CampaignHomeRecentLinksFetchParams,
): boolean {
  if (!params.hasLinkMapEntries) {
    return false;
  }

  return needsCursorListFetch(params.listResult, params.expiration);
}

export function shouldShowCampaignHomeRecentLinksLoadFailed(
  params: Pick<
    CampaignHomeRecentLinksDisplayParams,
    'hasLinkMapEntries' | 'linksListLoaded' | 'linksListEmpty' | 'fetchFailed'
  >,
): boolean {
  return (
    params.hasLinkMapEntries &&
    params.linksListLoaded &&
    params.linksListEmpty &&
    params.fetchFailed
  );
}

export function shouldShowCampaignHomeRecentLinksEmpty(
  params: Pick<
    CampaignHomeRecentLinksDisplayParams,
    'recentLinksLoading' | 'linksListEmpty' | 'fetchFailed'
  >,
): boolean {
  return !params.recentLinksLoading && params.linksListEmpty && !params.fetchFailed;
}
