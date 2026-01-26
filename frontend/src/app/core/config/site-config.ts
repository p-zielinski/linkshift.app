import { InjectionToken } from '@angular/core';

export type SiteConfig = {
  name: string;
  tagline: string;
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  name: 'Redirect Control',
  tagline: 'Signal-driven redirect automation'
};

export const SITE_CONFIG = new InjectionToken<SiteConfig>('SITE_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_SITE_CONFIG
});
