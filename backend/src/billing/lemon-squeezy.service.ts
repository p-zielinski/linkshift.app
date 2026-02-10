import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

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

type LemonSqueezyVariant = {
  id?: string;
  attributes?: Record<string, any>;
};

type LemonSqueezyVariantResponse = {
  data?: LemonSqueezyVariant;
};

type LemonSqueezyVariantListResponse = {
  data?: LemonSqueezyVariant[];
};

@Injectable()
export class LemonSqueezyService {
  private readonly apiKey: string;
  private readonly storeId: string;
  private readonly webhookSecret: string;
  private readonly defaultSuccessUrl: string;
  private readonly defaultCancelUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.apiKey = this.configService.get<string>('LEMON_SQUEEZY_API_KEY') ?? '';
    this.storeId =
      this.configService.get<string>('LEMON_SQUEEZY_STORE_ID') ?? '';
    this.webhookSecret =
      this.configService.get<string>('LEMON_SQUEEZY_WEBHOOK_SECRET') ?? '';
    this.defaultSuccessUrl =
      this.configService.get<string>('LEMON_SQUEEZY_SUCCESS_URL') ?? '';
    this.defaultCancelUrl =
      this.configService.get<string>('LEMON_SQUEEZY_CANCEL_URL') ?? '';
  }

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

  async getVariant(variantId: string) {
    return this.request<LemonSqueezyVariantResponse>(
      `/variants/${variantId}`,
      { method: 'GET' },
    );
  }

  async listVariants(productId: string) {
    const params = new URLSearchParams({
      'filter[product_id]': productId,
      'page[size]': '100',
    });
    return this.request<LemonSqueezyVariantListResponse>(
      `/variants?${params.toString()}`,
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
