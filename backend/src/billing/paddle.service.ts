import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

const API_BASE_URL = 'https://api.paddle.com';

type PaddleTransactionResponse = {
  data?: {
    id?: string;
    checkout?: {
      url?: string | null;
    } | null;
  };
};

type PaddleSubscriptionResponse = {
  data?: {
    id?: string;
    attributes?: Record<string, any>;
    [key: string]: any;
  };
};

type PaddlePriceResponse = {
  data?: {
    id?: string;
    [key: string]: any;
  };
};

type PaddlePortalSessionResponse = {
  data?: {
    id?: string;
    urls?: Record<string, any>;
  };
};

export type PaddleSubscriptionUpdateItem = {
  price_id: string;
  quantity: number;
};

export type PaddleSubscriptionProrationBillingMode =
  | 'prorated_immediately'
  | 'prorated_next_billing_period'
  | 'do_not_bill';

export type PaddleSubscriptionOnPaymentFailure =
  | 'prevent_change'
  | 'apply_change';

@Injectable()
export class PaddleService {
  private readonly apiKey: string;
  private readonly webhookSecret: string;
  private readonly defaultSuccessUrl: string;
  private readonly apiBaseUrl: string;
  private readonly apiVersion: string | null;
  private readonly webhookToleranceSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PADDLE_API_KEY') ?? '';
    this.webhookSecret =
      this.configService.get<string>('PADDLE_WEBHOOK_SECRET') ?? '';
    this.defaultSuccessUrl =
      this.configService.get<string>('PADDLE_SUCCESS_URL') ?? '';
    this.apiBaseUrl =
      this.configService.get<string>('PADDLE_API_BASE_URL') ?? API_BASE_URL;
    this.apiVersion =
      this.configService.get<string>('PADDLE_API_VERSION') ?? null;
    this.webhookToleranceSeconds = Number(
      this.configService.get<string>('PADDLE_WEBHOOK_TOLERANCE_SECONDS') ??
        '300',
    );
  }

  async createCheckout(params: {
    priceId: string;
    customData: Record<string, any>;
    successUrl?: string;
  }): Promise<{ checkoutUrl: string; checkoutId: string | null }> {
    const payload: Record<string, any> = {
      items: [
        {
          price_id: params.priceId,
          quantity: 1,
        },
      ],
      collection_mode: 'automatic',
      custom_data: params.customData,
      checkout: {
        url: params.successUrl || this.defaultSuccessUrl || null,
      },
    };

    const response = await this.request<PaddleTransactionResponse>(
      '/transactions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    const checkoutUrl = response.data?.checkout?.url ?? null;
    if (!checkoutUrl) {
      throw new Error('Missing checkout URL from Paddle transaction.');
    }

    return {
      checkoutUrl,
      checkoutId: response.data?.id ?? null,
    };
  }

  async getSubscription(subscriptionId: string) {
    return this.request<PaddleSubscriptionResponse>(
      `/subscriptions/${subscriptionId}`,
      {
        method: 'GET',
      },
    );
  }

  async cancelSubscription(
    subscriptionId: string,
    effectiveFrom: 'immediately' | 'next_billing_period' = 'immediately',
  ) {
    return this.request<PaddleSubscriptionResponse>(
      `/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({
          effective_from: effectiveFrom,
        }),
      },
    );
  }

  async previewSubscriptionUpdate(params: {
    subscriptionId: string;
    items: PaddleSubscriptionUpdateItem[];
    prorationBillingMode: PaddleSubscriptionProrationBillingMode;
  }) {
    return this.request<PaddleSubscriptionResponse>(
      `/subscriptions/${params.subscriptionId}/preview`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          items: params.items,
          proration_billing_mode: params.prorationBillingMode,
        }),
      },
    );
  }

  async updateSubscription(params: {
    subscriptionId: string;
    items: PaddleSubscriptionUpdateItem[];
    prorationBillingMode: PaddleSubscriptionProrationBillingMode;
    onPaymentFailure?: PaddleSubscriptionOnPaymentFailure;
  }) {
    return this.request<PaddleSubscriptionResponse>(
      `/subscriptions/${params.subscriptionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          items: params.items,
          proration_billing_mode: params.prorationBillingMode,
          on_payment_failure: params.onPaymentFailure ?? 'prevent_change',
        }),
      },
    );
  }

  async getPrice(priceId: string) {
    return this.request<PaddlePriceResponse>(`/prices/${priceId}`, {
      method: 'GET',
    });
  }

  async createCustomerPortalSession(params: {
    customerId: string;
    subscriptionIds?: string[];
  }) {
    const body: Record<string, any> = {};
    if (params.subscriptionIds && params.subscriptionIds.length > 0) {
      body.subscription_ids = params.subscriptionIds;
    }

    return this.request<PaddlePortalSessionResponse>(
      `/customers/${params.customerId}/portal-sessions`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    );
  }

  verifySignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
    if (!this.webhookSecret || !signatureHeader) {
      return false;
    }

    const parsed = this.parseSignatureHeader(signatureHeader);
    if (!parsed) {
      return false;
    }

    if (this.webhookToleranceSeconds > 0) {
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - parsed.timestamp) > this.webhookToleranceSeconds) {
        return false;
      }
    }

    const payload = `${parsed.timestamp}:${rawBody.toString('utf8')}`;
    const digest = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    const digestBuffer = Buffer.from(digest, 'utf8');
    for (const signature of parsed.signatures) {
      const signatureBuffer = Buffer.from(signature, 'utf8');
      if (signatureBuffer.length !== digestBuffer.length) {
        continue;
      }
      if (crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
        return true;
      }
    }

    return false;
  }

  private parseSignatureHeader(
    signatureHeader: string,
  ): { timestamp: number; signatures: string[] } | null {
    const segments = signatureHeader
      .split(';')
      .map((segment) => segment.trim())
      .filter(Boolean);

    let timestamp: number | null = null;
    const signatures: string[] = [];

    for (const segment of segments) {
      const [key, ...valueParts] = segment.split('=');
      const value = valueParts.join('=').trim();
      if (!key || !value) {
        continue;
      }

      if (key === 'ts') {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
          return null;
        }
        timestamp = parsed;
      }

      if (key === 'h1') {
        signatures.push(value);
      }
    }

    if (timestamp === null || signatures.length === 0) {
      return null;
    }

    return {
      timestamp,
      signatures,
    };
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    if (!this.apiKey) {
      throw new Error('PADDLE_API_KEY is not configured.');
    }

    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(this.apiVersion
          ? { 'Paddle-Version': this.apiVersion }
          : {}),
        ...(init.headers ?? {}),
      },
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const message =
        json?.error?.detail ??
        json?.error?.message ??
        json?.errors?.[0]?.detail ??
        response.statusText;
      throw new Error(`Paddle error: ${message}`);
    }

    return json as T;
  }
}
