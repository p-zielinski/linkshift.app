import {
  resolveAdvancedAnalyticsOnboardingPath,
  resolveRedirectRulesAnalyticsOnboardingTier,
} from './redirect-rules-analytics-onboarding.util';

describe('redirect-rules-analytics-onboarding.util', () => {
  it('splits zero domain groups from zero hosts', () => {
    expect(resolveRedirectRulesAnalyticsOnboardingTier(0, 0)).toBe('connect-domain');
    expect(resolveRedirectRulesAnalyticsOnboardingTier(1, 0)).toBe('add-host');
    expect(resolveRedirectRulesAnalyticsOnboardingTier(1, 2)).toBe('ready');
  });

  it('routes advanced onboarding to infra pages, not campaign connect wizard (UX-089)', () => {
    expect(resolveAdvancedAnalyticsOnboardingPath('connect-domain')).toBe('/domain-groups');
    expect(resolveAdvancedAnalyticsOnboardingPath('add-host')).toBe('/domains');
  });
});
