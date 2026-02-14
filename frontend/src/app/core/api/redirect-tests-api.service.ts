import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, type Observable } from 'rxjs';
import type {
  RedirectTest,
  CreateRedirectTestDto,
  UpdateRedirectTestDto,
  RedirectTestListQuery
} from '../models/redirect-test.model';
import type { QueryResult } from '../models/query-result.model';
import { buildHttpParams } from './api.utils';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root'
})
export class RedirectTestsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/redirect-tests`;

  list(query?: RedirectTestListQuery): Observable<QueryResult<RedirectTest>> {
    if (!query) {
      return throwError(() => new Error('Missing redirect test query'));
    }

    const params = buildHttpParams(query);
    return this.http.get<QueryResult<RedirectTest>>(this.apiUrl, { params });
  }

  get(id: string): Observable<RedirectTest> {
    return this.http.get<RedirectTest>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateRedirectTestDto): Observable<RedirectTest> {
    return this.http.post<RedirectTest>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateRedirectTestDto): Observable<RedirectTest> {
    return this.http.put<RedirectTest>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
