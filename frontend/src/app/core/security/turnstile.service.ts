import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-runtime-config';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          size?: 'normal' | 'compact' | 'invisible';
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        },
      ) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

@Injectable({
  providedIn: 'root',
})
export class TurnstileService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly appConfig = inject(APP_CONFIG);

  private scriptLoadPromise: Promise<void> | null = null;
  private widgetId: string | null = null;
  private container: HTMLDivElement | null = null;
  private pendingResolve: ((token: string | null) => void) | null = null;

  isConfigured(): boolean {
    return !!this.appConfig.APP_TURNSTILE_SITE_KEY?.trim();
  }

  async requestToken(): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const siteKey = this.appConfig.APP_TURNSTILE_SITE_KEY?.trim();
    if (!siteKey) {
      return null;
    }

    await this.ensureScriptLoaded();
    this.ensureWidget(siteKey);

    if (!this.widgetId || !window.turnstile) {
      return null;
    }

    return new Promise<string | null>((resolve) => {
      const timeoutId = window.setTimeout(() => {
        if (this.pendingResolve) {
          this.finishPending(null);
          resolve(null);
        }
      }, 30_000);

      this.pendingResolve = (token) => {
        window.clearTimeout(timeoutId);
        this.pendingResolve = null;
        resolve(token);
      };

      try {
        window.turnstile!.execute(this.widgetId!);
      } catch {
        window.clearTimeout(timeoutId);
        this.pendingResolve = null;
        resolve(null);
      }
    });
  }

  reset(): void {
    if (!isPlatformBrowser(this.platformId) || !this.widgetId || !window.turnstile) {
      return;
    }

    try {
      window.turnstile.reset(this.widgetId);
    } catch {
      // Widget may already be removed.
    }
  }

  private finishPending(token: string | null): void {
    const resolve = this.pendingResolve;
    this.pendingResolve = null;
    resolve?.(token);
  }

  private ensureWidget(siteKey: string): void {
    if (this.widgetId && this.container) {
      return;
    }

    this.container = document.createElement('div');
    this.container.className = 'sr-only';
    this.container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.container);

    this.widgetId = window.turnstile!.render(this.container, {
      sitekey: siteKey,
      size: 'invisible',
      callback: (token) => this.finishPending(token),
      'error-callback': () => this.finishPending(null),
      'expired-callback': () => this.finishPending(null),
    });
  }

  private ensureScriptLoaded(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (window.turnstile) {
      return Promise.resolve();
    }

    if (this.scriptLoadPromise) {
      return this.scriptLoadPromise;
    }

    this.scriptLoadPromise = new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('turnstile_script_failed')),
          { once: true },
        );
        return;
      }

      const script = document.createElement('script');
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('turnstile_script_failed'));
      document.head.appendChild(script);
    });

    return this.scriptLoadPromise;
  }
}
