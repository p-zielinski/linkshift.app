import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

const API_BASE_URL = 'https://api.lemonsqueezy.com/v1';

type LemonSqueezyCheckoutResponse = {
  data?: {
    id?: string;
    attributes?: {
      url?: string;
    };
  };
};

type LemonSqueezySubscriptionResponse = {
  data?: {
    id?: string;
    attributes?: Record<string, any>;
  };
};

@Injectable()
export class LemonSqueezyService {
  private readonly apiKey = process.env.LEMON_SQUEEZY_API_KEY ?? '';
  private readonly storeId = process.env.LEMON_SQUEEZY_STORE_ID ?? '';
  private readonly webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? '';
  private readonly defaultSuccessUrl =
    process.env.LEMON_SQUEEZY_SUCCESS_URL ?? '';
  private readonly defaultCancelUrl =
    process.env.LEMON_SQUEEZY_CANCEL_URL ?? '';

  async createCheckout(params: {
    variantId: string;
    customerEmail: string;
    organizationName: string;
    customData: Record<string, string>;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ checkoutUrl: string; checkoutId: string | null }> {
    const payload = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: params.customerEmail,
            custom: params.customData,
          },
          checkout_options: {
            redirect_url: params.successUrl || this.defaultSuccessUrl,
            cancel_url: params.cancelUrl || this.defaultCancelUrl,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: this.storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: params.variantId,
            },
          },
        },
      },
    };

    const response = await this.request<LemonSqueezyCheckoutResponse>(
      '/checkouts',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    const checkoutUrl = response.data?.attributes?.url;
    if (!checkoutUrl) {
      throw new Error('Missing checkout URL from Lemon Squeezy.');
    }

    return {
      checkoutUrl,
      checkoutId: response.data?.id ?? null,
    };
  }

  async getSubscription(subscriptionId: string) {
    return this.request<LemonSqueezySubscriptionResponse>(
      `/subscriptions/${subscriptionId}`,
      { method: 'GET' },
    );
  }

  verifySignature(rawBody: Buffer, signature: string | undefined): boolean {
    if (!this.webhookSecret || !signature) {
      return false;
    }

    const digest = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(digest, 'utf8'),
      Buffer.from(signature, 'utf8'),
    );
  }

  private async request<T>(
    path: string,
    init: RequestInit,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('LEMON_SQUEEZY_API_KEY is not configured.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        ...(init.headers ?? {}),
      },
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const message = json?.errors?.[0]?.detail ?? response.statusText;
      throw new Error(`Lemon Squeezy error: ${message}`);
    }

    return json as T;
  }
}
