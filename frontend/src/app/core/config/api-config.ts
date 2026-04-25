import { InjectionToken, inject } from '@angular/core';
import { APP_CONFIG } from './app-runtime-config';

export type ApiConfig = {
  baseUrl: string;
};

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => {
    const appConfig = inject(APP_CONFIG);
    const baseUrl = resolveApiBaseUrl(appConfig.APP_BASE_URL);
    return { baseUrl };
  },
});

function resolveApiBaseUrl(configuredBaseUrl: string): string {
  const normalizedConfiguredBaseUrl = configuredBaseUrl.replace(/\/+$/, '');
  const browserOrigin = resolveBrowserOrigin();

  if (
    browserOrigin &&
    isLocalOrigin(browserOrigin) &&
    normalizedConfiguredBaseUrl &&
    !isLocalOrigin(normalizedConfiguredBaseUrl)
  ) {
    return browserOrigin;
  }

  return normalizedConfiguredBaseUrl || browserOrigin || 'http://localhost:3000';
}

function resolveBrowserOrigin(): string | null {
  if (typeof globalThis.location?.origin !== 'string') {
    return null;
  }
  return safeOrigin(globalThis.location.origin);
}

function safeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '::1' ||
      parsed.hostname === '[::1]'
    );
  } catch {
    return false;
  }
}
