import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { AuthResponse, AuthTokens } from '../models/auth.model';
import type {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  InviteRegisterDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
  EmailVerificationDto,
  EmailChangeRequestDto,
  EmailChangeConfirmDto
} from '../models/auth.dto';
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

  registerInvite(payload: InviteRegisterDto): Observable<{ success: true }> {
    return this.http.post<{ success: true }>(
      `${this.apiUrl}/register-invite`,
      payload,
    );
  }

  lookupInvite(token: string): Observable<{ email: string; organizationName: string; expiresAt: string }> {
    return this.http.get<{ email: string; organizationName: string; expiresAt: string }>(
      `${this.apiUrl}/invites/lookup`,
      { params: { token } }
    );
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

  verifyEmail(payload: EmailVerificationDto): Observable<{ verified: boolean }> {
    return this.http.post<{ verified: boolean }>(
      `${this.apiUrl}/verify-email`,
      payload,
    );
  }

  resendVerification(): Observable<{ sent?: boolean; alreadyVerified?: boolean }> {
    return this.http.post<{ sent?: boolean; alreadyVerified?: boolean }>(
      `${this.apiUrl}/resend-verification`,
      {},
    );
  }

  requestPasswordReset(payload: PasswordResetRequestDto): Observable<{ sent: true }> {
    return this.http.post<{ sent: true }>(
      `${this.apiUrl}/password-reset/request`,
      payload,
    );
  }

  confirmPasswordReset(payload: PasswordResetConfirmDto): Observable<{ success: true }> {
    return this.http.post<{ success: true }>(
      `${this.apiUrl}/password-reset/confirm`,
      payload,
    );
  }

  updateEmailForUnverified(payload: EmailChangeRequestDto): Observable<{ updated: true }> {
    return this.http.post<{ updated: true }>(
      `${this.apiUrl}/email-change`,
      payload,
    );
  }

  requestEmailChange(payload: EmailChangeRequestDto): Observable<{ sent: true }> {
    return this.http.post<{ sent: true }>(
      `${this.apiUrl}/email-change/request`,
      payload,
    );
  }

  confirmEmailChange(payload: EmailChangeConfirmDto): Observable<{ updated: true }> {
    return this.http.post<{ updated: true }>(
      `${this.apiUrl}/email-change/confirm`,
      payload,
    );
  }
}
