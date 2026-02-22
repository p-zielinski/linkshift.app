import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, throwError, type Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';
import type {
  LinkMap,
  CreateLinkMapDto,
  UpdateLinkMapDto,
  LinkMapListQuery,
  LinkMapWithEntries,
  UpsertLinkMapEntriesDto,
  DeleteLinkMapEntriesDto,
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
        hasMore: false
      }))
    );
  }

  get(id: string): Observable<LinkMapWithEntries> {
    return this.http.get<LinkMapWithEntries>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateLinkMapDto): Observable<LinkMapWithEntries> {
    return this.http.post<LinkMapWithEntries>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateLinkMapDto): Observable<LinkMapWithEntries> {
    return this.http.put<LinkMapWithEntries>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  upsertEntries(id: string, payload: UpsertLinkMapEntriesDto): Observable<LinkMapWithEntries> {
    return this.http.post<LinkMapWithEntries>(`${this.apiUrl}/${id}/entries`, payload);
  }

  deleteEntries(id: string, payload: DeleteLinkMapEntriesDto): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/entries`, { body: payload });
  }
}
