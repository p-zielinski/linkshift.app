import {
  CAMPAIGN_HOME_QR_GENERATOR_NO_DOMAIN_SUBTITLE,
  CAMPAIGN_HOME_QR_GENERATOR_NO_HOST_SUBTITLE,
  CAMPAIGN_HOME_QR_GENERATOR_SUBTITLE,
  CAMPAIGN_HOME_RECENT_LINKS_SUBTITLE,
  resolveCampaignHomePrimaryQuickAction,
  resolveCampaignHomeRecentLinksEmptyCta,
} from './campaign-home-page.util';

describe('campaign-home-page.util', () => {
  it('routes primary quick action based on domain groups and hosts', () => {
    expect(resolveCampaignHomePrimaryQuickAction(0, 0)).toBe('connect-domain');
    expect(resolveCampaignHomePrimaryQuickAction(1, 0)).toBe('add-host');
    expect(resolveCampaignHomePrimaryQuickAction(1, 1)).toBe('create-link');
  });

  it('routes recent links empty CTA based on domain groups and hosts', () => {
    expect(resolveCampaignHomeRecentLinksEmptyCta(0, 0)).toBe('connect-domain');
    expect(resolveCampaignHomeRecentLinksEmptyCta(1, 0)).toBe('add-host');
    expect(resolveCampaignHomeRecentLinksEmptyCta(1, 2)).toBe('create-link');
  });

  it('states recent links scope from recently updated sites', () => {
    expect(CAMPAIGN_HOME_RECENT_LINKS_SUBTITLE).toBe(
      'Latest short links from your recently updated sites',
    );
    expect(CAMPAIGN_HOME_RECENT_LINKS_SUBTITLE.toLowerCase()).not.toMatch(/\b(we|our|us)\b/);
  });

  it('states QR generator subtitle when domain groups exist', () => {
    expect(CAMPAIGN_HOME_QR_GENERATOR_SUBTITLE).toBe(
      'Build share-ready QR assets from any URL',
    );
    expect(CAMPAIGN_HOME_QR_GENERATOR_SUBTITLE.toLowerCase()).not.toMatch(/\b(we|our|us)\b/);
  });

  it('de-emphasizes QR generator with onboarding hint when no domain groups', () => {
    expect(CAMPAIGN_HOME_QR_GENERATOR_NO_DOMAIN_SUBTITLE).toBe(
      'Works with any URL — connect a domain for branded short links',
    );
    expect(CAMPAIGN_HOME_QR_GENERATOR_NO_DOMAIN_SUBTITLE.toLowerCase()).not.toMatch(
      /\b(we|our|us)\b/,
    );
  });

  it('gates QR generator to connect-domain dialog when no domain groups (UX-062)', () => {
    // Template contract: when domainGroupCount === 0, QR generator mirrors Open analytics —
    // muted button with (click)="openConnectDomainDialog()", not routerLink to /tools/qr-code-generator.
    expect(resolveCampaignHomePrimaryQuickAction(0, 0)).toBe('connect-domain');
    expect(CAMPAIGN_HOME_QR_GENERATOR_NO_DOMAIN_SUBTITLE).toContain('connect a domain');
  });

  it('gates QR generator on connected hosts with add-host hint (UX-088)', () => {
    expect(resolveCampaignHomePrimaryQuickAction(1, 0)).toBe('add-host');
    expect(CAMPAIGN_HOME_QR_GENERATOR_NO_HOST_SUBTITLE).toBe(
      'Add a host to link QR codes to your domain',
    );
    expect(CAMPAIGN_HOME_QR_GENERATOR_NO_HOST_SUBTITLE.toLowerCase()).not.toMatch(
      /\b(we|our|us)\b/,
    );
  });
});
