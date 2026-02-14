import type { User } from '../models/user.model';
import type { SiteConfig } from '../config/site-config';

export const needsLegalConsent = (
  user: User | null,
  siteConfig: SiteConfig
): boolean => {
  if (!user) {
    return false;
  }

  if (!user.termsAcceptedAt || !user.privacyAcceptedAt || !user.ageConfirmedAt) {
    return true;
  }

  if (!user.legalVersion) {
    return true;
  }

  return user.legalVersion !== siteConfig.legalVersion;
};
