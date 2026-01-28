import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';
import { OrganizationPlan } from '@shared/models/organization-config.model';

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

@Injectable({
  providedIn: 'root',
})
export class BillingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/billing`;

  createCheckout(plan: OrganizationPlan): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, {
      plan,
    });
  }

  getCustomerPortal(): Observable<PortalResponse> {
    return this.http.get<PortalResponse>(`${this.apiUrl}/portal`);
  }

  getCheckoutSession(sessionId: string): Observable<CheckoutSessionResponse> {
    return this.http.get<CheckoutSessionResponse>(
      `${this.apiUrl}/checkout-sessions/${sessionId}`,
    );
  }
}
