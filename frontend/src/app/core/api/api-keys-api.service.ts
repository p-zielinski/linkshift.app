import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { QueryResult } from '../models/query-result.model';
import type { ApiKey, CreateApiKeyDto, UpdateApiKeyDto } from '../models/api-key.model';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class ApiKeysApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/api-keys`;

  list(): Observable<QueryResult<ApiKey>> {
    return this.http.get<QueryResult<ApiKey>>(this.apiUrl);
  }

  get(id: string): Observable<ApiKey> {
    return this.http.get<ApiKey>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateApiKeyDto): Observable<ApiKey> {
    return this.http.post<ApiKey>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateApiKeyDto): Observable<ApiKey> {
    return this.http.put<ApiKey>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
