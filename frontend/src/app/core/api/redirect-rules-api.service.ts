import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, type Observable } from 'rxjs';
import type {
  RedirectRule,
  CreateRedirectRuleDto,
  UpdateRedirectRuleDto,
  RedirectRuleListQuery,
  RedirectSimulationEntry,
  RedirectSimulationResponse
} from '../models/redirect-rule.model';
import type { QueryResult } from '../models/query-result.model';
import { buildHttpParams } from './api.utils';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root'
})
export class RedirectRulesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/redirect-rules`;

  list(query?: RedirectRuleListQuery): Observable<QueryResult<RedirectRule>> {
    if (!query) {
      return throwError(() => new Error('Missing redirect rule query'));
    }

    const params = buildHttpParams(query);
    return this.http.get<QueryResult<RedirectRule>>(this.apiUrl, { params });
  }

  get(id: string): Observable<RedirectRule> {
    return this.http.get<RedirectRule>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateRedirectRuleDto): Observable<RedirectRule> {
    return this.http.post<RedirectRule>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateRedirectRuleDto): Observable<RedirectRule> {
    return this.http.put<RedirectRule>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  simulate(entries: RedirectSimulationEntry[]): Observable<RedirectSimulationResponse> {
    return this.http.post<RedirectSimulationResponse>(`${this.apiUrl}/simulate`, {
      entries
    });
  }
}
