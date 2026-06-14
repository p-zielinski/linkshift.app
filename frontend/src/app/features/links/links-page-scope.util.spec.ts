import type { DomainGroup } from '../../core/models/domain-group.model';
import type { LinkMap } from '../../core/models/link-map.model';
import {
  resolveLinksOpenCreateQueryAction,
  resolveLinksWaitingForDomainGroups,
  resolveLinksPageActiveGroupId,
  resolveLinksSyncFromDashboardContext,
  resolveLinksDataScopeGroupIds,
  isLinksAllSitesScope,
  collectLinkMapsForGroupIds,
  areAggregatedLinkRowsEqual,
} from './links-page-scope.util';

const groups: DomainGroup[] = [
  {
    id: 'g1',
    name: 'Site A',
    organizationId: 'org',
    robotsPolicy: 'NONE',
    redirectDeliveryMode: 'INSTANT',
    customRobotsContent: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'g2',
    name: 'Site B',
    organizationId: 'org',
    robotsPolicy: 'NONE',
    redirectDeliveryMode: 'INSTANT',
    customRobotsContent: null,
    createdAt: '',
    updatedAt: '',
  },
];

const linkMap = (id: string, domainGroupId: string, updatedAt = '2026-06-01T00:00:00.000Z'): LinkMap => ({
  id,
  name: id,
  domainGroupId,
  caseSensitive: false,
  queryMatch: 'ignore',
  entriesCount: 0,
  createdAt: updatedAt,
  updatedAt,
});

describe('links-page-scope.util', () => {
  it('uses page filter in campaign mode and shell selection in advanced mode', () => {
    expect(
      resolveLinksPageActiveGroupId({
        isCampaignMode: true,
        pageFilterGroupId: 'g1',
        shellSelectedGroupId: 'g2',
      }),
    ).toBe('g1');

    expect(
      resolveLinksPageActiveGroupId({
        isCampaignMode: false,
        pageFilterGroupId: 'g1',
        shellSelectedGroupId: 'g2',
      }),
    ).toBe('g2');
  });

  describe('resolveLinksSyncFromDashboardContext', () => {
    it('syncs from shell in advanced mode only when a site is selected', () => {
      expect(
        resolveLinksSyncFromDashboardContext({
          isAdvancedMode: true,
          pageFilterGroupId: 'g1',
          shellSelectedGroupId: 'g2',
        }),
      ).toBe(true);

      expect(
        resolveLinksSyncFromDashboardContext({
          isAdvancedMode: true,
          pageFilterGroupId: '',
          shellSelectedGroupId: 'g2',
        }),
      ).toBe(false);

      expect(
        resolveLinksSyncFromDashboardContext({
          isAdvancedMode: true,
          pageFilterGroupId: '',
          shellSelectedGroupId: '',
        }),
      ).toBe(false);
    });

    it('syncs from shell in campaign when page filter is empty and shell has a site', () => {
      expect(
        resolveLinksSyncFromDashboardContext({
          isAdvancedMode: false,
          pageFilterGroupId: '',
          shellSelectedGroupId: 'g2',
        }),
      ).toBe(true);
    });

    it('does not sync in campaign when page filter already selects a site', () => {
      expect(
        resolveLinksSyncFromDashboardContext({
          isAdvancedMode: false,
          pageFilterGroupId: 'g1',
          shellSelectedGroupId: 'g2',
        }),
      ).toBe(false);
    });

    it('does not sync in campaign when user chose all sites (empty page and shell)', () => {
      expect(
        resolveLinksSyncFromDashboardContext({
          isAdvancedMode: false,
          pageFilterGroupId: '',
          shellSelectedGroupId: '',
        }),
      ).toBe(false);
    });
  });

  it('builds stable sorted scope ids for all sites and single-site selection', () => {
    expect(resolveLinksDataScopeGroupIds(groups, '')).toEqual(['g1', 'g2']);
    expect(resolveLinksDataScopeGroupIds(groups, 'g2')).toEqual(['g2']);
  });

  it('detects all-sites scope from empty active group id', () => {
    expect(isLinksAllSitesScope('')).toBe(true);
    expect(isLinksAllSitesScope('g1')).toBe(false);
  });

  it('collects link maps only for scoped group ids', () => {
    const readMapsForGroup = (groupId: string) =>
      groupId === 'g1' ? [linkMap('m1', 'g1')] : [linkMap('m2', 'g2'), linkMap('m3', 'g2')];

    expect(collectLinkMapsForGroupIds(['g2'], readMapsForGroup)).toEqual([
      linkMap('m2', 'g2'),
      linkMap('m3', 'g2'),
    ]);
    expect(collectLinkMapsForGroupIds(['g1', 'g2'], readMapsForGroup)).toHaveLength(3);
  });

  it('resolves openCreate query action from domain groups and hosts', () => {
    expect(resolveLinksOpenCreateQueryAction(false, 1, 1)).toBe('none');
    expect(resolveLinksOpenCreateQueryAction(true, 0, 0)).toBe('pending-groups');
    expect(resolveLinksOpenCreateQueryAction(true, 1, 0)).toBe('open-connect-domain');
    expect(resolveLinksOpenCreateQueryAction(true, 1, 1)).toBe('open-create');
  });

  it('waits for domain groups when openCreate is pending and groups are not loaded', () => {
    const base = {
      openCreateRequested: true,
      authLoaded: true,
      domainGroupsLoading: false,
      domainGroupsListLoaded: false,
    };

    expect(resolveLinksWaitingForDomainGroups(base)).toBe(true);
    expect(
      resolveLinksWaitingForDomainGroups({ ...base, domainGroupsLoading: true }),
    ).toBe(true);
    expect(
      resolveLinksWaitingForDomainGroups({ ...base, domainGroupsListLoaded: true }),
    ).toBe(false);
    expect(
      resolveLinksWaitingForDomainGroups({ ...base, openCreateRequested: false }),
    ).toBe(false);
    expect(resolveLinksWaitingForDomainGroups({ ...base, authLoaded: false })).toBe(false);
  });

  it('compares aggregated link rows by stable fields', () => {
    const row = {
      id: '1',
      shortUrls: ['https://go.example/a', 'https://links.example/a'],
      destination: 'https://example.com',
      updatedAt: '2026-06-01T00:00:00.000Z',
    };

    expect(areAggregatedLinkRowsEqual([row], [{ ...row }])).toBe(true);
    expect(
      areAggregatedLinkRowsEqual([row], [{ ...row, shortUrls: ['https://changed.example/a'] }]),
    ).toBe(false);
  });
});
