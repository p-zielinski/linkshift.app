import {
  normalizeRoutePath,
  resolveShellReconcileAllowEmptySelection,
  routeUsesWorkspaceContext,
  WORKSPACE_CONTEXT_EXACT_ROUTES,
  WORKSPACE_CONTEXT_ROUTE_PREFIXES,
} from './dashboard-workspace-context.util';

describe('dashboard-workspace-context.util', () => {
  describe('normalizeRoutePath', () => {
    it('strips query strings and hashes', () => {
      expect(normalizeRoutePath('/domains?group=abc')).toBe('/domains');
      expect(normalizeRoutePath('/domains#section')).toBe('/domains');
      expect(normalizeRoutePath('/domains?x=1#section')).toBe('/domains');
    });

    it('trims trailing slashes', () => {
      expect(normalizeRoutePath('/domains/')).toBe('/domains');
      expect(normalizeRoutePath('/redirect-rules/')).toBe('/redirect-rules');
    });

    it('preserves root path', () => {
      expect(normalizeRoutePath('/')).toBe('/');
    });
  });

  describe('routeUsesWorkspaceContext', () => {
    it.each(WORKSPACE_CONTEXT_EXACT_ROUTES)(
      'returns true for workspace exact route %s',
      (route) => {
        expect(routeUsesWorkspaceContext(route)).toBe(true);
      },
    );

    it.each(WORKSPACE_CONTEXT_ROUTE_PREFIXES)(
      'returns true for workspace prefix route %s',
      (route) => {
        expect(routeUsesWorkspaceContext(route)).toBe(true);
      },
    );

    it('returns true for redirect-rules subpaths', () => {
      expect(routeUsesWorkspaceContext('/redirect-rules/edit/abc')).toBe(true);
    });

    it('returns true when path has query string or trailing slash', () => {
      expect(routeUsesWorkspaceContext('/domains?group=abc')).toBe(true);
      expect(routeUsesWorkspaceContext('/link-maps#top')).toBe(true);
    });

    it('returns true for subdomains', () => {
      expect(routeUsesWorkspaceContext('/subdomains')).toBe(true);
      expect(routeUsesWorkspaceContext('/subdomains/')).toBe(true);
    });

    it('returns false for link-maps detail routes', () => {
      expect(routeUsesWorkspaceContext('/link-maps/some-uuid')).toBe(false);
      expect(
        routeUsesWorkspaceContext('/link-maps/00000000-0000-0000-0000-000000000000'),
      ).toBe(false);
    });

    it.each([
      '/dashboard',
      '/organization',
      '/organization/api-keys',
      '/profile',
      '/tools',
      '/tools/qr-code-generator',
      '/tools/redirect-tester',
      '/domain-groups',
      '/legal/consent',
      '/overview',
      '/settings',
      '/analytics',
      '/home',
    ])('returns false for non-workspace route %s', (route) => {
      expect(routeUsesWorkspaceContext(route)).toBe(false);
    });
  });

  describe('resolveShellReconcileAllowEmptySelection', () => {
    it('allows empty selection in campaign mode by default', () => {
      expect(
        resolveShellReconcileAllowEmptySelection({
          groupCount: 2,
          isCampaignMode: true,
          currentRoutePath: '/domains',
        }),
      ).toBe(true);
    });

    it('allows empty selection on /links in advanced mode when multiple groups exist', () => {
      expect(
        resolveShellReconcileAllowEmptySelection({
          groupCount: 2,
          isCampaignMode: false,
          currentRoutePath: '/links',
        }),
      ).toBe(true);
    });

    it('normalizes /links path variants in advanced mode', () => {
      expect(
        resolveShellReconcileAllowEmptySelection({
          groupCount: 2,
          isCampaignMode: false,
          currentRoutePath: '/links?workspace=g',
        }),
      ).toBe(true);
    });

    it('does not allow empty selection on other advanced workspace routes', () => {
      expect(
        resolveShellReconcileAllowEmptySelection({
          groupCount: 2,
          isCampaignMode: false,
          currentRoutePath: '/domains',
        }),
      ).toBe(false);
    });

    it('does not allow empty selection when only one group exists', () => {
      expect(
        resolveShellReconcileAllowEmptySelection({
          groupCount: 1,
          isCampaignMode: false,
          currentRoutePath: '/links',
        }),
      ).toBe(false);
    });

    it('allows empty selection on non-workspace routes in campaign mode', () => {
      expect(
        resolveShellReconcileAllowEmptySelection({
          groupCount: 2,
          isCampaignMode: true,
          currentRoutePath: '/dashboard',
        }),
      ).toBe(true);
    });

    it('does not allow empty selection on non-workspace routes in advanced mode', () => {
      expect(
        resolveShellReconcileAllowEmptySelection({
          groupCount: 2,
          isCampaignMode: false,
          currentRoutePath: '/dashboard',
        }),
      ).toBe(false);
    });
  });
});
