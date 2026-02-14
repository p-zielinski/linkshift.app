import { mergeApplicationConfig, ApplicationConfig, inject, TransferState } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import {
  APP_CONFIG,
  APP_CONFIG_KEY,
  resolveAppRuntimeConfig,
} from './core/config/app-runtime-config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: APP_CONFIG,
      useFactory: () => {
        const config = resolveAppRuntimeConfig({
          APP_API_BASE_URL: process.env['' + 'APP_API_BASE_URL'],
          APP_SITE_NAME: process.env['' + 'APP_SITE_NAME'],
          APP_SITE_TAGLINE: process.env['' + 'APP_SITE_TAGLINE'],
          APP_SUPPORT_EMAIL: process.env['' + 'APP_SUPPORT_EMAIL'],
          APP_LEGAL_NAME: process.env['' + 'APP_LEGAL_NAME'],
          APP_LEGAL_ADDRESS: process.env['' + 'APP_LEGAL_ADDRESS'],
          APP_PRIVACY_EMAIL: process.env['' + 'APP_PRIVACY_EMAIL'],
          APP_MIN_AGE: process.env['' + 'APP_MIN_AGE'],
          APP_LEGAL_VERSION: process.env['' + 'APP_LEGAL_VERSION'],
          APP_DOMAIN_TARGET_IP: process.env['' + 'APP_DOMAIN_TARGET_IP'],
          APP_AUTH_GATE_ENABLED: process.env['' + 'APP_AUTH_GATE_ENABLED'],
        });
        inject(TransferState).set(APP_CONFIG_KEY, config);
        return config;
      },
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
