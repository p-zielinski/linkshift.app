import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';
import type { OrganizationUsage } from '../models/organization-usage.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/organization`;

  getUsage(): Observable<OrganizationUsage> {
    return this.http.get<OrganizationUsage>(`${this.apiUrl}/usage`);
  }
}
