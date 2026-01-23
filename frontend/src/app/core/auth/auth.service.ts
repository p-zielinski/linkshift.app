// src/app/core/auth/auth.service.ts

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError, Observable, of } from 'rxjs';
import { AuthResponse, RefreshResponse, TokenPair, User } from './auth.types';
import { LoginDto, RegisterDto } from './auth.dto'; // Assume you have DTOs matching backend

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = '/api/v1/auth'; // Adjust if you have environment config

  // --- STATE (Signals) ---

  // Private signal holding the current user state
  private _currentUser = signal<User | null>(this.loadUserFromStorage());

  // Public readonly signal for components to consume
  currentUser = this._currentUser.asReadonly();

  // Derived state: is the user logged in?
  isLoggedIn = computed(() => !!this._currentUser());

  constructor() {
    // Optional: Validate token on startup or simply rely on storage presence
  }

  // --- PUBLIC API ---

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(data: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Refreshes tokens using the stored refresh token.
   * Returns the new access token or throws error.
   */
  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.success) {
          this.storeTokens(response.data);
        }
      }),
      catchError(err => {
        // If refresh fails (e.g. invalid token, blacklisted), force logout
        this.logout();
        return throwError(() => err);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // --- INTERNAL HELPERS ---

  private handleAuthSuccess(response: AuthResponse) {
    if (response.success && response.data) {
      this.storeTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      });
      this.storeUser(response.data.user);
    }
  }

  private storeTokens(tokens: TokenPair) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  private storeUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private clearSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }
}
