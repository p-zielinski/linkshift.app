import { InjectionToken, inject } from '@angular/core';
import { APP_CONFIG } from './app-runtime-config';

export type ApiConfig = {
  baseUrl: string;
};

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => {
    const appConfig = inject(APP_CONFIG);
    const baseUrl = appConfig.APP_API_BASE_URL.replace(/\/+$/, '');
    return { baseUrl };
  }
});
