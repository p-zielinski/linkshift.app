import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';
import {
  BillingInterval,
  OrganizationPlan,
  OrganizationStatus,
} from '@shared/models/organization-config.model';
import type { PlanLimits } from '@shared/models/plan-limits.model';

export type PortalAction = 'manage' | 'cancel';

type PortalResponse = {
  url: string;
};

export type CheckoutSessionStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELED'
  | 'FAILED'
  | 'EXPIRED';

export type CheckoutSessionResponse = {
  id: string;
  plan: string;
  status: CheckoutSessionStatus;
  updatedAt: string;
  completedAt?: string | null;
};

export type CreateCheckoutSessionResponse = {
  checkoutSessionId: string;
  plan: OrganizationPlan;
  interval: BillingInterval;
  priceId: string;
};

export type SubscriptionProrationBillingMode =
  | 'prorated_immediately'
  | 'prorated_next_billing_period'
  | 'do_not_bill';

export type SubscriptionChangeCheckoutResponse = {
  flow: 'CHECKOUT';
  checkoutSessionId: string;
  plan: OrganizationPlan;
  interval: BillingInterval;
  priceId: string;
};

export type SubscriptionChangeUpdatedResponse = {
  flow: 'UPDATED';
  providerSubscriptionId: string;
  plan: OrganizationPlan;
  interval: BillingInterval;
  prorationBillingMode: SubscriptionProrationBillingMode;
  amount: number;
  currency: string;
  activeFrom: string | null;
  activeUntil: string | null;
};

export type SubscriptionChangeNoopResponse = {
  flow: 'NOOP';
  plan: OrganizationPlan;
  interval: BillingInterval;
  priceId: string;
};

export type SubscriptionChangeResponse =
  | SubscriptionChangeCheckoutResponse
  | SubscriptionChangeUpdatedResponse
  | SubscriptionChangeNoopResponse;

export type SubscriptionSyncResponse = {
  synced: boolean;
  source: 'PADDLE' | 'LOCAL';
  reason: string | null;
  activeSubscription: {
    plan: OrganizationPlan;
    status: OrganizationStatus;
    interval: BillingInterval | 'LIFETIME';
    providerSubscriptionId: string | null;
    providerVariantId: string | null;
    amount: number;
    currency: string;
    activeFrom: string | null;
    activeUntil: string | null;
  };
};

export type BillingPlanPrice = {
  plan: OrganizationPlan;
  interval: BillingInterval;
  amount: number;
  currency: string;
  priceId: string;
};

export type BillingPlanCatalog = {
  plans: BillingPlanPrice[];
  limits: Partial<Record<OrganizationPlan, PlanLimits>>;
  updatedAt: string;
};

@Injectable({
  providedIn: 'root',
})
export class BillingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/billing`;

  getCustomerPortal(): Observable<PortalResponse> {
    return this.http.get<PortalResponse>(`${this.apiUrl}/portal`);
  }

  createCheckoutSession(
    priceId: string,
  ): Observable<CreateCheckoutSessionResponse> {
    return this.http.post<CreateCheckoutSessionResponse>(
      `${this.apiUrl}/checkout-sessions`,
      { priceId },
    );
  }

  changeSubscription(priceId: string): Observable<SubscriptionChangeResponse> {
    return this.http.post<SubscriptionChangeResponse>(
      `${this.apiUrl}/subscription/change`,
      { priceId },
    );
  }

  syncSubscription(): Observable<SubscriptionSyncResponse> {
    return this.http.post<SubscriptionSyncResponse>(
      `${this.apiUrl}/subscription/sync`,
      {},
    );
  }

  getPlans(): Observable<BillingPlanCatalog> {
    return this.http.get<BillingPlanCatalog>(`${this.apiUrl}/plans`);
  }

  getCheckoutSession(sessionId: string): Observable<CheckoutSessionResponse> {
    return this.http.get<CheckoutSessionResponse>(
      `${this.apiUrl}/checkout-sessions/${sessionId}`,
    );
  }
}
