import { InjectionToken } from '@angular/core';

export type ApiConfig = {
  baseUrl: string;
};

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => {
    const globalBaseUrl = (globalThis as { APP_API_BASE_URL?: string }).APP_API_BASE_URL;
    const baseUrl = (globalBaseUrl ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');
    return { baseUrl };
  }
});
