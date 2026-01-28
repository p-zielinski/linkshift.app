import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

type CheckoutResponse = {
  checkoutUrl: string;
};

type PortalResponse = {
  url: string;
};

@Injectable({
  providedIn: 'root',
})
export class BillingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/billing`;

  createCheckout(plan: 'STARTER' | 'PRO'): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, {
      plan,
    });
  }

  getCustomerPortal(): Observable<PortalResponse> {
    return this.http.get<PortalResponse>(`${this.apiUrl}/portal`);
  }
}
