import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, type Observable } from 'rxjs';
import type { QueryResult } from '../models/query-result.model';
import type { AggregatedLinkRow, LinksListQuery } from '../models/links-list.model';
import { buildHttpParams } from './api.utils';
import { API_CONFIG } from '../config/api-config';

const READ_ONLY_ERROR = 'Links list is read-only';

@Injectable({
  providedIn: 'root',
})
export class LinksListApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/links`;

  list(query?: LinksListQuery): Observable<QueryResult<AggregatedLinkRow>> {
    if (!query) {
      return throwError(() => new Error('Missing links list query'));
    }

    const params = buildHttpParams(query);
    return this.http.get<QueryResult<AggregatedLinkRow>>(this.apiUrl, { params });
  }

  get(_id: string): Observable<AggregatedLinkRow> {
    return throwError(() => new Error(READ_ONLY_ERROR));
  }

  create(_payload: never): Observable<AggregatedLinkRow> {
    return throwError(() => new Error(READ_ONLY_ERROR));
  }

  update(_id: string, _payload: never): Observable<AggregatedLinkRow> {
    return throwError(() => new Error(READ_ONLY_ERROR));
  }

  delete(_id: string): Observable<void> {
    return throwError(() => new Error(READ_ONLY_ERROR));
  }
}
