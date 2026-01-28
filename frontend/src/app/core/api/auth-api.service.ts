import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { AuthResponse, AuthTokens } from '../models/auth.model';
import type { LoginDto, RegisterDto, RefreshTokenDto } from '../models/auth.dto';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}/api/v1/auth`;

  login(payload: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload, {
      withCredentials: true,
    });
  }

  register(payload: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload, {
      withCredentials: true,
    });
  }

  refresh(payload: RefreshTokenDto = {}): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.apiUrl}/refresh`, payload, {
      withCredentials: true,
    });
  }

  logout(): Observable<{ success: true }> {
    return this.http.post<{ success: true }>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true },
    );
  }
}
