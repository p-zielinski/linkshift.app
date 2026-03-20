import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, throwError, type Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';
import type {
  LinkMap,
  CreateLinkMapDto,
  UpdateLinkMapDto,
  LinkMapListQuery,
} from '../models/link-map.model';
import type { QueryResult } from '../models/query-result.model';
import { buildHttpParams } from './api.utils';

@Injectable({ providedIn: 'root' })
export class LinkMapsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/link-maps`;

  list(query?: LinkMapListQuery): Observable<QueryResult<LinkMap>> {
    if (!query) {
      return throwError(() => new Error('Missing link map query'));
    }
    const params = buildHttpParams(query);
    return this.http.get<LinkMap[]>(this.apiUrl, { params }).pipe(
      map((items) => ({
        data: items,
        hasMore: false,
      })),
    );
  }

  get(id: string): Observable<LinkMap> {
    return this.http.get<LinkMap>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateLinkMapDto): Observable<LinkMap> {
    return this.http.post<LinkMap>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateLinkMapDto): Observable<LinkMap> {
    return this.http.put<LinkMap>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
