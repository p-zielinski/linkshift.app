import { InjectionToken, inject } from '@angular/core';
import { APP_CONFIG } from './app-runtime-config';

export type ToolsApiConfig = {
  baseUrl: string;
};

export const TOOLS_API_CONFIG = new InjectionToken<ToolsApiConfig>('TOOLS_API_CONFIG', {
  providedIn: 'root',
  factory: () => {
    const appConfig = inject(APP_CONFIG);
    const fallback = appConfig.APP_BASE_URL;
    const baseUrl = (appConfig.APP_TOOLS_BASE_URL || fallback).replace(/\/+$/, '');
    return { baseUrl };
  },
});
