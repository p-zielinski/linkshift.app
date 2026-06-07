import { organizationHasConnectedHosts } from '../../shared/components/setup-checklist/setup-checklist.auto-complete.util';

export type CampaignHomePrimaryQuickAction = 'connect-domain' | 'add-host' | 'create-link';

export type CampaignHomeRecentLinksEmptyCta = 'connect-domain' | 'add-host' | 'create-link';

/** Scope hint for Overview recent links (see RECENT_LINKS_MAP_SCAN_LIMIT in campaign-home-page). */
export const CAMPAIGN_HOME_RECENT_LINKS_SUBTITLE =
  'Latest short links from your recently updated sites';

export const CAMPAIGN_HOME_RECENT_LINKS_LOAD_ERROR =
  "Couldn't load recent links. Try again or open Links for the full list.";

export const CAMPAIGN_HOME_QR_GENERATOR_SUBTITLE =
  'Build share-ready QR assets from any URL';

export const CAMPAIGN_HOME_QR_GENERATOR_NO_DOMAIN_SUBTITLE =
  'Works with any URL — connect a domain for branded short links';

export const CAMPAIGN_HOME_QR_GENERATOR_NO_HOST_SUBTITLE =
  'Add a host to link QR codes to your domain';

export function resolveCampaignHomePrimaryQuickAction(
  domainGroupCount: number,
  hostCount: number,
): CampaignHomePrimaryQuickAction {
  if (domainGroupCount === 0) {
    return 'connect-domain';
  }

  if (!organizationHasConnectedHosts(domainGroupCount, hostCount)) {
    return 'add-host';
  }

  return 'create-link';
}

export function resolveCampaignHomeRecentLinksEmptyCta(
  domainGroupCount: number,
  hostCount: number,
): CampaignHomeRecentLinksEmptyCta {
  if (domainGroupCount === 0) {
    return 'connect-domain';
  }

  if (!organizationHasConnectedHosts(domainGroupCount, hostCount)) {
    return 'add-host';
  }

  return 'create-link';
}
