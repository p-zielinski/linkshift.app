export type RedirectRulesAnalyticsOnboardingTier = 'connect-domain' | 'add-host' | 'ready';

export function resolveRedirectRulesAnalyticsOnboardingTier(
  domainGroupCount: number,
  hostCount: number,
): RedirectRulesAnalyticsOnboardingTier {
  if (domainGroupCount === 0) {
    return 'connect-domain';
  }

  if (hostCount === 0) {
    return 'add-host';
  }

  return 'ready';
}

export function resolveAdvancedAnalyticsOnboardingPath(
  tier: Exclude<RedirectRulesAnalyticsOnboardingTier, 'ready'>,
): string {
  return tier === 'connect-domain' ? '/domain-groups' : '/domains';
}
