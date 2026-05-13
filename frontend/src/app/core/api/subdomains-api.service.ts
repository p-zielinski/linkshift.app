import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  Subdomain,
  CreateSubdomainDto,
  UpdateSubdomainDto,
} from '../models/subdomain.model';
import type { QueryResult } from '../models/query-result.model';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root'
})
export class SubdomainsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/subdomains`;

  list(): Observable<QueryResult<Subdomain>> {
    return this.http.get<QueryResult<Subdomain>>(this.apiUrl);
  }

  get(id: string): Observable<Subdomain> {
    return this.http.get<Subdomain>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateSubdomainDto): Observable<Subdomain> {
    return this.http.post<Subdomain>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateSubdomainDto): Observable<Subdomain> {
    return this.http.put<Subdomain>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
