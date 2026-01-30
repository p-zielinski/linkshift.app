import { InjectionToken } from '@angular/core';

export type SiteConfig = {
  name: string;
  tagline: string;
  supportEmail: string;
  legalName: string;
  legalAddress: string;
  privacyEmail: string;
  minAge: number;
  legalVersion: string;
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  name: 'Redirect Control',
  tagline: 'Signal-driven redirect automation',
  supportEmail: 'support@redirectcontrol.app',
  legalName: 'Independent operator',
  legalAddress: 'Available upon request',
  privacyEmail: 'privacy@redirectcontrol.app',
  minAge: 16,
  legalVersion: 'v1',
};

export const SITE_CONFIG = new InjectionToken<SiteConfig>('SITE_CONFIG', {
  providedIn: 'root',
  factory: () => {
    const globalConfig = globalThis as {
      APP_SITE_NAME?: string;
      APP_SITE_TAGLINE?: string;
      APP_SUPPORT_EMAIL?: string;
      APP_LEGAL_NAME?: string;
      APP_LEGAL_ADDRESS?: string;
      APP_PRIVACY_EMAIL?: string;
      APP_MIN_AGE?: string | number;
      APP_LEGAL_VERSION?: string;
    };

    const minAge = Number(globalConfig.APP_MIN_AGE ?? DEFAULT_SITE_CONFIG.minAge);

    return {
      name: globalConfig.APP_SITE_NAME ?? DEFAULT_SITE_CONFIG.name,
      tagline: globalConfig.APP_SITE_TAGLINE ?? DEFAULT_SITE_CONFIG.tagline,
      supportEmail: globalConfig.APP_SUPPORT_EMAIL ?? DEFAULT_SITE_CONFIG.supportEmail,
      legalName: globalConfig.APP_LEGAL_NAME ?? DEFAULT_SITE_CONFIG.legalName,
      legalAddress: globalConfig.APP_LEGAL_ADDRESS ?? DEFAULT_SITE_CONFIG.legalAddress,
      privacyEmail: globalConfig.APP_PRIVACY_EMAIL ?? DEFAULT_SITE_CONFIG.privacyEmail,
      minAge: Number.isNaN(minAge) ? DEFAULT_SITE_CONFIG.minAge : minAge,
      legalVersion: globalConfig.APP_LEGAL_VERSION ?? DEFAULT_SITE_CONFIG.legalVersion,
    };
  }
});
