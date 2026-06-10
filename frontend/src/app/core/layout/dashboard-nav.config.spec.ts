import {
  ADVANCED_NAV_SECTIONS,
  CAMPAIGN_NAV_ITEMS,
  sidebarNavLinkActiveOptions,
} from './dashboard-nav.config';

describe('dashboard-nav.config', () => {
  describe('sidebarNavLinkActiveOptions', () => {
    it('matches exact paths while ignoring query params', () => {
      expect(sidebarNavLinkActiveOptions()).toEqual({
        paths: 'exact',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      });
    });

    it('matches sub-routes while ignoring query params', () => {
      expect(sidebarNavLinkActiveOptions(true)).toEqual({
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      });
    });
  });

  describe('CAMPAIGN_NAV_ITEMS', () => {
    it('includes Settings in campaign sidebar nav', () => {
      const settings = CAMPAIGN_NAV_ITEMS.find((item) => item.route === '/settings');

      expect(settings).toEqual({
        label: 'Settings',
        route: '/settings',
        icon: 'settings',
      });
    });
  });

  describe('ADVANCED_NAV_SECTIONS', () => {
    it('includes Plan and account in Workspace after Organization', () => {
      const workspace = ADVANCED_NAV_SECTIONS.find((section) => section.label === 'Workspace');

      expect(workspace?.items).toEqual([
        { label: 'Organization', route: '/organization', icon: 'groups', matchSubRoutes: true },
        { label: 'Plan and account', route: '/settings', icon: 'settings' },
      ]);
    });

    it('includes Docs in Help with sub-route matching', () => {
      const help = ADVANCED_NAV_SECTIONS.find((section) => section.label === 'Help');
      const docs = help?.items.find((item) => item.route === '/docs');

      expect(docs).toEqual({
        label: 'Docs',
        route: '/docs',
        icon: 'description',
        matchSubRoutes: true,
      });
    });

    it('requires domain groups for advanced Analytics', () => {
      const overview = ADVANCED_NAV_SECTIONS.find((section) => section.label === 'Overview');
      const analytics = overview?.items.find((item) => item.route === '/redirect-rules-analytics');

      expect(analytics).toEqual({
        label: 'Analytics',
        route: '/redirect-rules-analytics',
        icon: 'analytics',
        requiresDomainGroups: true,
      });
    });
  });
});
