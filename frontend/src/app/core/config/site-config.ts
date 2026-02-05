import { InjectionToken, inject } from '@angular/core';
import { APP_CONFIG } from './app-runtime-config';

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
    const appConfig = inject(APP_CONFIG);
    const minAge = Number(appConfig.APP_MIN_AGE ?? DEFAULT_SITE_CONFIG.minAge);

    return {
      name: appConfig.APP_SITE_NAME ?? DEFAULT_SITE_CONFIG.name,
      tagline: appConfig.APP_SITE_TAGLINE ?? DEFAULT_SITE_CONFIG.tagline,
      supportEmail: appConfig.APP_SUPPORT_EMAIL ?? DEFAULT_SITE_CONFIG.supportEmail,
      legalName: appConfig.APP_LEGAL_NAME ?? DEFAULT_SITE_CONFIG.legalName,
      legalAddress: appConfig.APP_LEGAL_ADDRESS ?? DEFAULT_SITE_CONFIG.legalAddress,
      privacyEmail: appConfig.APP_PRIVACY_EMAIL ?? DEFAULT_SITE_CONFIG.privacyEmail,
      minAge: Number.isNaN(minAge) ? DEFAULT_SITE_CONFIG.minAge : minAge,
      legalVersion: appConfig.APP_LEGAL_VERSION ?? DEFAULT_SITE_CONFIG.legalVersion,
    };
  }
});
