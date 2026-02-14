import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';
import type { OrganizationInvite, OrganizationMember } from '../models/organization-member.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/organization`;

  listMembers(): Observable<OrganizationMember[]> {
    return this.http.get<OrganizationMember[]>(`${this.apiUrl}/members`);
  }

  inviteMember(email: string): Observable<OrganizationInvite> {
    return this.http.post<OrganizationInvite>(`${this.apiUrl}/invites`, { email });
  }

  updateMemberStatus(
    userId: string,
    blocked: boolean
  ): Observable<OrganizationMember> {
    return this.http.patch<OrganizationMember>(
      `${this.apiUrl}/members/${userId}/status`,
      { blocked }
    );
  }
}
