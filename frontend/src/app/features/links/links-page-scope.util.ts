import type { DomainGroup } from '../../core/models/domain-group.model';
import type { LinkMap } from '../../core/models/link-map.model';
import type { LinksListQuery } from '../../core/models/links-list.model';
import { organizationHasConnectedHosts } from '../../shared/components/setup-checklist/setup-checklist.auto-complete.util';

export type LinksOpenCreateQueryResolution =
  | 'none'
  | 'pending-groups'
  | 'open-connect-domain'
  | 'open-create';

export function resolveLinksWaitingForDomainGroups(params: {
  openCreateRequested: boolean;
  authLoaded: boolean;
  domainGroupsLoading: boolean;
  domainGroupsListLoaded: boolean;
}): boolean {
  if (!params.openCreateRequested || !params.authLoaded) {
    return false;
  }

  return params.domainGroupsLoading || !params.domainGroupsListLoaded;
}

export function resolveLinksOpenCreateQueryAction(
  openCreateRequested: boolean,
  domainGroupCount: number,
  hostCount: number,
): LinksOpenCreateQueryResolution {
  if (!openCreateRequested) {
    return 'none';
  }

  if (domainGroupCount === 0) {
    return 'pending-groups';
  }

  if (!organizationHasConnectedHosts(domainGroupCount, hostCount)) {
    return 'open-connect-domain';
  }

  return 'open-create';
}

export function resolveLinksPageActiveGroupId(params: {
  isCampaignMode: boolean;
  pageFilterGroupId: string;
  shellSelectedGroupId: string;
}): string {
  if (params.isCampaignMode) {
    return params.pageFilterGroupId;
  }

  return params.shellSelectedGroupId;
}

/**
 * Campaign: follow shell context only while the page filter is empty (e.g. after
 * Overview analytics). Advanced: sync from shell when a site is selected; an empty
 * page filter is "All sites" on /links and must not be overwritten from shell.
 */
export function resolveLinksSyncFromDashboardContext(params: {
  isAdvancedMode: boolean;
  pageFilterGroupId: string;
  shellSelectedGroupId: string;
}): boolean {
  if (params.isAdvancedMode) {
    return !!params.pageFilterGroupId;
  }

  return !params.pageFilterGroupId && !!params.shellSelectedGroupId;
}

/** True when advanced/campaign scope aggregates every site (empty active group id). */
export function isLinksAllSitesScope(activeGroupId: string): boolean {
  return !activeGroupId;
}

/** Stable sorted ids for store fetch effects — avoids re-running when list array references change. */
export function resolveLinksDataScopeGroupIds(
  groups: readonly DomainGroup[],
  activeGroupId: string,
): string[] {
  if (activeGroupId) {
    return [activeGroupId];
  }

  return groups.map((group) => group.id).sort();
}

/** Read link maps only for the current aggregation scope (single site or all sites). */
export function collectLinkMapsForGroupIds(
  groupIds: readonly string[],
  readMapsForGroup: (domainGroupId: string) => readonly LinkMap[],
): LinkMap[] {
  const maps: LinkMap[] = [];
  for (const groupId of groupIds) {
    maps.push(...readMapsForGroup(groupId));
  }
  return maps;
}

export function buildLinksListBaseFilter(params: {
  activeGroupId: string;
  linkMapId: string;
  search: string;
}): Omit<LinksListQuery, 'limit' | 'startAfterId'> {
  const trimmedSearch = params.search.trim();

  return {
    ...(params.activeGroupId ? { domainGroupId: params.activeGroupId } : {}),
    ...(params.linkMapId ? { linkMapId: params.linkMapId } : {}),
    ...(trimmedSearch.length >= 2 ? { search: trimmedSearch } : {}),
  };
}

export function resolveLinksListStartAfterId(
  page: number,
  pageCursors: readonly (string | undefined)[],
): string | undefined {
  if (page <= 1) {
    return undefined;
  }

  return pageCursors[page - 1];
}

export function areAggregatedLinkRowsEqual(
  left: readonly { id: string; shortUrls: readonly string[]; destination: string; updatedAt: string }[],
  right: readonly { id: string; shortUrls: readonly string[]; destination: string; updatedAt: string }[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((row, index) => {
    const next = right[index];
    return (
      !!next &&
      row.id === next.id &&
      row.shortUrls.length === next.shortUrls.length &&
      row.shortUrls.every((url, urlIndex) => url === next.shortUrls[urlIndex]) &&
      row.destination === next.destination &&
      row.updatedAt === next.updatedAt
    );
  });
}
