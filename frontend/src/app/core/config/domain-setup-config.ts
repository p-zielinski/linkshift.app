import { InjectionToken, inject } from '@angular/core';
import { APP_CONFIG } from './app-runtime-config';

export type DomainSetupConfig = {
  targetIp: string;
};

const DEFAULT_DOMAIN_SETUP_CONFIG: DomainSetupConfig = {
  targetIp: '',
};

export const DOMAIN_SETUP_CONFIG = new InjectionToken<DomainSetupConfig>(
  'DOMAIN_SETUP_CONFIG',
  {
    providedIn: 'root',
    factory: () => {
      const appConfig = inject(APP_CONFIG);
      console.log(appConfig)
      return {
        targetIp: appConfig.APP_DOMAIN_TARGET_IP ?? DEFAULT_DOMAIN_SETUP_CONFIG.targetIp,
      };
    },
  },
);
