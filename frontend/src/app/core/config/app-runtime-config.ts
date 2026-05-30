import { inject, InjectionToken, makeStateKey, TransferState } from '@angular/core';

export type AppRuntimeConfig = {
  APP_BASE_URL: string;
  APP_SUBDOMAIN_BASE_URL: string;
  APP_TOOLS_BASE_URL: string;
  APP_SITE_NAME: string;
  APP_SITE_TAGLINE: string;
  APP_SUPPORT_EMAIL: string;
  APP_LEGAL_NAME: string;
  APP_LEGAL_ADDRESS: string;
  APP_PRIVACY_EMAIL: string;
  APP_MIN_AGE: string;
  APP_LEGAL_VERSION: string;
  APP_DOMAIN_TARGET_IP: string;
  APP_AUTH_GATE_ENABLED: string;
  APP_PADDLE_CLIENT_TOKEN: string;
  APP_PADDLE_ENV: string;
  APP_TURNSTILE_SITE_KEY: string;
};

export const DEFAULT_APP_RUNTIME_CONFIG: AppRuntimeConfig = {
  APP_BASE_URL: 'http://localhost:3000',
  APP_SUBDOMAIN_BASE_URL: '',
  APP_TOOLS_BASE_URL: '',
  APP_SITE_NAME: 'LinkShift.App',
  APP_SITE_TAGLINE: 'Signal-driven redirect automation',
  APP_SUPPORT_EMAIL: 'support@redirectcontrol.app',
  APP_LEGAL_NAME: 'Independent operator',
  APP_LEGAL_ADDRESS: 'Available upon request',
  APP_PRIVACY_EMAIL: 'privacy@redirectcontrol.app',
  APP_MIN_AGE: '16',
  APP_LEGAL_VERSION: 'v2',
  APP_DOMAIN_TARGET_IP: '',
  APP_AUTH_GATE_ENABLED: 'false',
  APP_PADDLE_CLIENT_TOKEN: '',
  APP_PADDLE_ENV: 'sandbox',
  APP_TURNSTILE_SITE_KEY: '',
};

export const resolveAppRuntimeConfig = (
  overrides?: Partial<AppRuntimeConfig>,
): AppRuntimeConfig => {
  return {
    ...DEFAULT_APP_RUNTIME_CONFIG,
    ...Object.fromEntries(
      Object.entries(overrides ?? {}).filter(([_, v]) => v !== undefined && v !== ''),
    ),
  } as AppRuntimeConfig;
};

export const APP_CONFIG_KEY = makeStateKey<AppRuntimeConfig>('app_runtime_config');

export const APP_CONFIG = new InjectionToken<AppRuntimeConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => {
    const transferState = inject(TransferState);
    const browserConfig = (globalThis as any).APP_CONFIG as
      | Partial<AppRuntimeConfig>
      | undefined;
    const transferConfig = transferState.get<Partial<AppRuntimeConfig> | null>(
      APP_CONFIG_KEY,
      null,
    );

    return resolveAppRuntimeConfig({
      ...(transferConfig ?? {}),
      ...(browserConfig ?? {}),
    });
  },
});
