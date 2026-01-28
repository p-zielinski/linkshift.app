import { InjectionToken } from '@angular/core';

export type SiteConfig = {
  name: string;
  tagline: string;
  supportEmail: string;
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  name: 'Redirect Control',
  tagline: 'Signal-driven redirect automation',
  supportEmail: 'support@redirectcontrol.app',
};

export const SITE_CONFIG = new InjectionToken<SiteConfig>('SITE_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_SITE_CONFIG
});
