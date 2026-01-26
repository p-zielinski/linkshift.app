import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { Domain, CreateDomainDto, UpdateDomainDto } from '../models/domain.model';
import type { QueryResult } from '../models/query-result.model';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root'
})
export class DomainsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/domains`;

  list(): Observable<QueryResult<Domain>> {
    return this.http.get<QueryResult<Domain>>(this.apiUrl);
  }

  get(id: string): Observable<Domain> {
    return this.http.get<Domain>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateDomainDto): Observable<Domain> {
    return this.http.post<Domain>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateDomainDto): Observable<Domain> {
    return this.http.put<Domain>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
