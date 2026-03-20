import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, type Observable } from 'rxjs';
import type { QueryResult } from '../models/query-result.model';
import type {
  CreateLinkMapEntryDto,
  DeleteLinkMapEntriesByIdDto,
  ImportLinkMapEntriesDto,
  ImportLinkMapEntriesResult,
  LinkMapEntry,
  LinkMapEntryListQuery,
  RollbackImportedLinkMapEntriesDto,
  UpdateLinkMapEntryDto,
} from '../models/link-map.model';
import { buildHttpParams } from './api.utils';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class LinkMapEntriesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/link-map-entries`;

  list(query?: LinkMapEntryListQuery): Observable<QueryResult<LinkMapEntry>> {
    if (!query) {
      return throwError(() => new Error('Missing link map entry query'));
    }

    const params = buildHttpParams(query);
    return this.http.get<QueryResult<LinkMapEntry>>(this.apiUrl, { params });
  }

  get(id: string): Observable<LinkMapEntry> {
    return this.http.get<LinkMapEntry>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateLinkMapEntryDto): Observable<LinkMapEntry> {
    return this.http.post<LinkMapEntry>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateLinkMapEntryDto): Observable<LinkMapEntry> {
    return this.http.put<LinkMapEntry>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteMany(payload: DeleteLinkMapEntriesByIdDto): Observable<{ deletedCount: number }> {
    return this.http.delete<{ deletedCount: number }>(this.apiUrl, { body: payload });
  }

  importEntries(payload: ImportLinkMapEntriesDto): Observable<ImportLinkMapEntriesResult> {
    return this.http.post<ImportLinkMapEntriesResult>(`${this.apiUrl}/import`, payload);
  }

  rollbackImport(
    payload: RollbackImportedLinkMapEntriesDto,
  ): Observable<{ deletedCount: number }> {
    return this.http.post<{ deletedCount: number }>(`${this.apiUrl}/import/rollback`, payload);
  }
}
