import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  DomainGroup,
  CreateDomainGroupDto,
  UpdateDomainGroupDto
} from '../models/domain-group.model';
import type { QueryResult } from '../models/query-result.model';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root'
})
export class DomainGroupsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/domain-groups`;

  list(): Observable<QueryResult<DomainGroup>> {
    return this.http.get<QueryResult<DomainGroup>>(this.apiUrl);
  }

  get(id: string): Observable<DomainGroup> {
    return this.http.get<DomainGroup>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateDomainGroupDto): Observable<DomainGroup> {
    return this.http.post<DomainGroup>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateDomainGroupDto): Observable<DomainGroup> {
    return this.http.put<DomainGroup>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
