import {
  appendQueryAndFragment,
  LINK_MAP_ID_QUERY_PARAM,
  mergeQueryString,
  resolveAdvancedToCampaignRedirectPath,
  resolveDashboardAnalyticsPath,
  resolveDashboardModeToggleNavigation,
  SHARED_DASHBOARD_MODE_ROUTES,
} from './dashboard-mode-toggle-navigation.util';

describe('resolveDashboardAnalyticsPath', () => {
  it('returns campaign analytics route in campaign mode', () => {
    expect(resolveDashboardAnalyticsPath('campaign')).toBe('/analytics');
  });

  it('returns redirect-rules-analytics route in advanced mode', () => {
    expect(resolveDashboardAnalyticsPath('advanced')).toBe('/redirect-rules-analytics');
  });
});

describe('resolveDashboardModeToggleNavigation', () => {
  it('keeps shared routes unchanged when switching to advanced', () => {
    for (const path of SHARED_DASHBOARD_MODE_ROUTES) {
      expect(resolveDashboardModeToggleNavigation(`${path}?workspace=x`, 'advanced')).toBe(
        `${path}?workspace=x`,
      );
    }
  });

  it('keeps shared routes unchanged when switching to campaign', () => {
    expect(resolveDashboardModeToggleNavigation('/links?workspace=x', 'campaign')).toBe(
      '/links?workspace=x',
    );
    expect(resolveDashboardModeToggleNavigation('/organization/api-keys', 'campaign')).toBe(
      '/organization/api-keys',
    );
  });

  it('maps campaign overview to advanced dashboard', () => {
    expect(resolveDashboardModeToggleNavigation('/overview', 'advanced')).toBe('/dashboard');
  });

  it('maps advanced dashboard to campaign overview', () => {
    expect(resolveDashboardModeToggleNavigation('/dashboard', 'campaign')).toBe('/overview');
  });

  it('maps campaign analytics to redirect-rules-analytics with query params', () => {
    expect(resolveDashboardModeToggleNavigation('/analytics?ruleId=1&workspace=g', 'advanced')).toBe(
      '/redirect-rules-analytics?ruleId=1&workspace=g',
    );
  });

  it('maps redirect-rules-analytics to campaign analytics with query params', () => {
    expect(
      resolveDashboardModeToggleNavigation(
        '/redirect-rules-analytics?ruleId=1&workspace=g',
        'campaign',
      ),
    ).toBe('/analytics?ruleId=1&workspace=g');
  });

  it('preserves fragment when mapping analytics routes', () => {
    expect(resolveDashboardModeToggleNavigation('/analytics#filters', 'advanced')).toBe(
      '/redirect-rules-analytics#filters',
    );
    expect(
      resolveDashboardModeToggleNavigation('/redirect-rules-analytics?x=1#filters', 'campaign'),
    ).toBe('/analytics?x=1#filters');
  });

  it('falls back to mode landing for mode-specific routes without a mapping', () => {
    expect(resolveDashboardModeToggleNavigation('/domains', 'campaign')).toBe('/settings#hosts');
    expect(resolveDashboardModeToggleNavigation('/redirect-rules', 'campaign')).toBe('/links');
    expect(resolveDashboardModeToggleNavigation('/link-maps/abc', 'campaign')).toBe(
      '/links?linkMapId=abc',
    );
    expect(resolveDashboardModeToggleNavigation('/tests', 'campaign')).toBe('/tools/redirect-tester');
    expect(resolveDashboardModeToggleNavigation('/settings', 'advanced')).toBe('/settings');
  });

  it('preserves query params when mapping link map detail to links', () => {
    expect(resolveDashboardModeToggleNavigation('/link-maps/abc?workspace=x', 'campaign')).toBe(
      '/links?workspace=x&linkMapId=abc',
    );
    expect(
      resolveDashboardModeToggleNavigation('/link-maps/abc?workspace=x#details', 'campaign'),
    ).toBe('/links?workspace=x&linkMapId=abc#details');
  });

  it('maps unknown advanced infra routes to campaign settings hosts section', () => {
    expect(resolveDashboardModeToggleNavigation('/domain-groups', 'campaign')).toBe('/settings#hosts');
    expect(resolveDashboardModeToggleNavigation('/subdomains', 'campaign')).toBe('/settings#hosts');
    expect(resolveDashboardModeToggleNavigation('/domains?workspace=x', 'campaign')).toBe(
      '/settings?workspace=x#hosts',
    );
  });

  it('preserves source fragment over mapped hosts fragment when both exist', () => {
    expect(resolveDashboardModeToggleNavigation('/domains#plan-usage', 'campaign')).toBe(
      '/settings#plan-usage',
    );
  });
});

describe('resolveAdvancedToCampaignRedirectPath', () => {
  it('maps domain infra routes to settings hosts fragment', () => {
    expect(resolveAdvancedToCampaignRedirectPath('/domains')).toBe('/settings#hosts');
    expect(resolveAdvancedToCampaignRedirectPath('/domain-groups')).toBe('/settings#hosts');
    expect(resolveAdvancedToCampaignRedirectPath('/subdomains')).toBe('/settings#hosts');
  });

  it('maps link map detail routes to links with linkMapId query param', () => {
    expect(resolveAdvancedToCampaignRedirectPath('/link-maps/abc')).toBe('/links?linkMapId=abc');
    expect(resolveAdvancedToCampaignRedirectPath('/link-maps')).toBe('/links');
  });
});

describe('mergeQueryString', () => {
  it('merges additional params into an existing query string', () => {
    expect(mergeQueryString('workspace=x', { [LINK_MAP_ID_QUERY_PARAM]: 'abc' })).toBe(
      'workspace=x&linkMapId=abc',
    );
  });

  it('overrides duplicate keys with additions', () => {
    expect(mergeQueryString('linkMapId=old', { linkMapId: 'new' })).toBe('linkMapId=new');
  });
});

describe('appendQueryAndFragment', () => {
  it('appends query before mapped fragment', () => {
    expect(appendQueryAndFragment('/settings#hosts', 'workspace=x', null)).toBe(
      '/settings?workspace=x#hosts',
    );
  });

  it('prefers source fragment over mapped fragment', () => {
    expect(appendQueryAndFragment('/settings#hosts', '', 'plan-usage')).toBe('/settings#plan-usage');
  });
});
