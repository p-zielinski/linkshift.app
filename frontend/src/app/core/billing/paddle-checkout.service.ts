import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-runtime-config';

type PaddleEvent = {
  name?: string;
  id?: string;
  data?: Record<string, any>;
};

type PaddleCheckoutOpenParams = {
  settings?: Record<string, any>;
  items?: Array<{ priceId: string; quantity?: number }>;
  customer?: Record<string, any>;
  customData?: Record<string, any>;
};

type PaddleGlobal = {
  Environment?: {
    set: (environment: 'sandbox') => void;
  };
  Initialize: (params: Record<string, any>) => void;
  Checkout: {
    open: (params: PaddleCheckoutOpenParams) => void;
  };
};

type OverlayStatus = 'completed' | 'closed';

export type OverlayCheckoutResult = {
  status: OverlayStatus;
  event?: PaddleEvent;
};

export type OpenOverlayCheckoutParams = {
  priceId: string;
  customerEmail?: string | null;
  customerCountryCode?: string | null;
  customerPostalCode?: string | null;
  customData?: Record<string, any>;
};

@Injectable({
  providedIn: 'root',
})
export class PaddleCheckoutService {
  private readonly config = inject(APP_CONFIG);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly scriptSrc = 'https://cdn.paddle.com/paddle/v2/paddle.js';
  private readonly checkoutSettings = {
    displayMode: 'overlay',
    variant: 'multi-page',
  };

  private loadingPromise: Promise<void> | null = null;
  private initialized = false;
  private readonly eventHandlers = new Set<(event: PaddleEvent) => void>();
  private readonly globalEventCallback = (event: PaddleEvent) => {
    for (const handler of this.eventHandlers) {
      handler(event);
    }
  };

  async openOverlayCheckout(
    params: OpenOverlayCheckoutParams,
  ): Promise<OverlayCheckoutResult> {
    if (!this.isBrowser) {
      throw new Error('Paddle checkout is only available in browser context.');
    }

    if (!params.priceId) {
      throw new Error('Missing Paddle priceId for checkout.');
    }

    const paddle = await this.ensureInitialized();

    return new Promise<OverlayCheckoutResult>((resolve, reject) => {
      let settled = false;
      let checkoutId: string | null = null;

      const settle = (result: OverlayCheckoutResult) => {
        if (settled) {
          return;
        }
        settled = true;
        this.eventHandlers.delete(eventCallback);
        resolve(result);
      };

      const fail = (errorMessage: string) => {
        if (settled) {
          return;
        }
        settled = true;
        this.eventHandlers.delete(eventCallback);
        reject(new Error(errorMessage));
      };

      const eventCallback = (event: PaddleEvent) => {
        if (!event?.name) {
          return;
        }

        if (event.name === 'checkout.loaded') {
          checkoutId = this.resolveCheckoutId(event);
          return;
        }

        if (event.name === 'checkout.completed') {
          if (!this.matchesCheckout(checkoutId, event)) {
            return;
          }
          settle({ status: 'completed', event });
          return;
        }

        if (event.name === 'checkout.closed') {
          if (!this.matchesCheckout(checkoutId, event)) {
            return;
          }
          settle({ status: 'closed', event });
          return;
        }

        if (event.name === 'checkout.error') {
          const errorData = event.data?.['error'] as Record<string, any> | undefined;
          const message =
            (errorData?.['detail'] as string | undefined) ??
            (errorData?.['message'] as string | undefined) ??
            'Paddle checkout failed.';
          fail(message);
          return;
        }

        if (event.name === 'checkout.warning') {
          // Helps debug provider-side config issues without interrupting checkout flow.
          console.warn('Paddle checkout warning', event.data);
        }
      };

      this.eventHandlers.add(eventCallback);

      try {
        const customer = this.buildCustomerPayload({
          email: params.customerEmail,
          countryCode: params.customerCountryCode,
          postalCode: params.customerPostalCode,
        });

        paddle.Checkout.open({
          settings: this.checkoutSettings,
          items: [
            {
              priceId: params.priceId,
              quantity: 1,
            },
          ],
          ...(customer ? { customer } : {}),
          customData: params.customData ?? {},
        });
      } catch (error) {
        this.eventHandlers.delete(eventCallback);
        reject(error);
      }
    });
  }

  private async ensureInitialized(): Promise<PaddleGlobal> {
    const token = (this.config.APP_PADDLE_CLIENT_TOKEN ?? '').trim();
    if (!token) {
      throw new Error(
        'Paddle client token is not configured (APP_PADDLE_CLIENT_TOKEN).',
      );
    }

    await this.loadScript();
    const paddle = this.getPaddleGlobal();

    if (!this.initialized) {
      const env = (this.config.APP_PADDLE_ENV ?? '').trim().toLowerCase();
      if (env === 'sandbox') {
        paddle.Environment?.set('sandbox');
      }

      paddle.Initialize({
        token,
        eventCallback: this.globalEventCallback,
        checkout: {
          settings: this.checkoutSettings,
        },
      });
      this.initialized = true;
    }

    return paddle;
  }

  private loadScript(): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise<void>((resolve, reject) => {
      const existing = this.document.querySelector<HTMLScriptElement>(
        `script[src="${this.scriptSrc}"]`,
      );

      if (existing) {
        if ((window as any).Paddle) {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('Failed to load Paddle.js script.')),
          { once: true },
        );
        return;
      }

      const script = this.document.createElement('script');
      script.src = this.scriptSrc;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Failed to load Paddle.js script.'));
      this.document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  private getPaddleGlobal(): PaddleGlobal {
    const paddle = (window as any).Paddle as PaddleGlobal | undefined;
    if (!paddle || typeof paddle.Initialize !== 'function') {
      throw new Error('Paddle.js is not available on window.Paddle.');
    }
    return paddle;
  }

  private buildCustomerPayload(params: {
    email?: string | null;
    countryCode?: string | null;
    postalCode?: string | null;
  }): Record<string, any> | null {
    const email = params.email?.trim() ?? '';
    const countryCode = params.countryCode?.trim() ?? '';
    const postalCode = params.postalCode?.trim() ?? '';

    if (!email && !countryCode && !postalCode) {
      return null;
    }

    const customer: Record<string, any> = {};
    if (email) {
      customer['email'] = email;
    }
    if (countryCode || postalCode) {
      customer['address'] = {
        ...(countryCode ? { countryCode } : {}),
        ...(postalCode ? { postalCode } : {}),
      };
    }

    return customer;
  }

  private resolveCheckoutId(event: PaddleEvent): string | null {
    const eventData = event.data;
    const checkoutData = eventData?.['checkout'] as Record<string, any> | undefined;
    const candidate = event.id ?? eventData?.['id'] ?? checkoutData?.['id'] ?? null;
    return candidate ? String(candidate) : null;
  }

  private matchesCheckout(checkoutId: string | null, event: PaddleEvent): boolean {
    if (!checkoutId) {
      return true;
    }
    const eventId = this.resolveCheckoutId(event);
    if (!eventId) {
      return true;
    }
    return checkoutId === eventId;
  }
}
