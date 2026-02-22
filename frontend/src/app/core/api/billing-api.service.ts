import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';
import { BillingInterval, OrganizationPlan } from '@shared/models/organization-config.model';

type CheckoutResponse = {
  checkoutUrl: string;
  checkoutSessionId?: string;
};

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

export type PlanLimits = {
  maxDomainGroups: number;
  maxDomainsPerGroup: number;
  maxTotalDomains: number;
  maxRulesPerGroup: number;
  maxTotalRules: number;
  maxTestsPerGroup: number;
  maxTotalTests: number;
  maxUsers: number;
  redirectionLimitPerMinute: number;
  maxLinkMaps: number;
  maxLinkMapEntriesTotal: number;
  maxLinkMapEntriesPerMap: number;
};

export type BillingPlanPrice = {
  plan: OrganizationPlan;
  interval: BillingInterval;
  amount: number;
  currency: string;
  variantId: string;
};

export type BillingPlanCatalog = {
  plans: BillingPlanPrice[];
  limits: Partial<Record<OrganizationPlan, PlanLimits>>;
  updatedAt: string;
};

export type CustomPlanPricing = {
  amount: number;
  currency: string;
  variantId: string;
};

export type CustomPlanCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  limits: PlanLimits;
  monthly: CustomPlanPricing | null;
  yearly: CustomPlanPricing | null;
};

export type CustomPlanCatalog = {
  plans: CustomPlanCatalogItem[];
  updatedAt: string;
};

@Injectable({
  providedIn: 'root',
})
export class BillingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/billing`;

  createCheckout(variantId: string): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, {
      variantId,
    });
  }

  getCustomerPortal(): Observable<PortalResponse> {
    return this.http.get<PortalResponse>(`${this.apiUrl}/portal`);
  }

  getPlans(): Observable<BillingPlanCatalog> {
    return this.http.get<BillingPlanCatalog>(`${this.apiUrl}/plans`);
  }

  getCustomPlans(): Observable<CustomPlanCatalog> {
    return this.http.get<CustomPlanCatalog>(`${this.apiUrl}/custom-plans`);
  }

  createCustomPlanCheckout(
    customPlanId: string,
    variantId: string,
  ): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(
      `${this.apiUrl}/custom-plans/${customPlanId}/checkout`,
      { variantId },
    );
  }

  getCheckoutSession(sessionId: string): Observable<CheckoutSessionResponse> {
    return this.http.get<CheckoutSessionResponse>(
      `${this.apiUrl}/checkout-sessions/${sessionId}`,
    );
  }
}
