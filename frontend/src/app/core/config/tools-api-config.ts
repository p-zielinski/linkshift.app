import { InjectionToken, inject } from '@angular/core';
import { APP_CONFIG } from './app-runtime-config';

export type ToolsApiConfig = {
  baseUrl: string;
};

export const TOOLS_API_CONFIG = new InjectionToken<ToolsApiConfig>('TOOLS_API_CONFIG', {
  providedIn: 'root',
  factory: () => {
    const appConfig = inject(APP_CONFIG);
    const baseUrl = resolveToolsApiBase(appConfig.APP_TOOLS_BASE_URL, appConfig.APP_BASE_URL).replace(
      /\/+$/,
      '',
    );
    return { baseUrl };
  },
});

function resolveToolsApiBase(toolsBaseUrl: string, appBaseUrl: string): string {
  const normalizedToolsBaseUrl = toolsBaseUrl?.trim();
  if (normalizedToolsBaseUrl) {
    return normalizedToolsBaseUrl;
  }

  return isLocalOrigin(appBaseUrl) ? 'http://localhost:3030' : appBaseUrl;
}

function isLocalOrigin(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  } catch {
    return false;
  }
}
