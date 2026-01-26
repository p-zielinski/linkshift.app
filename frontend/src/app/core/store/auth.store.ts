import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { catchError, finalize, tap, throwError, type Observable } from 'rxjs';
import type { AuthResponse, AuthTokens } from '../models/auth.model';
import type { LoginDto, RegisterDto } from '../models/auth.dto';
import type { Organization } from '../models/organization.model';
import type { User } from '../models/user.model';
import { AuthApiService } from '../api/auth-api.service';
import { DomainGroupStore } from './domain-group.store';
import { DomainStore } from './domain.store';
import {
  clearStoredSession,
  loadStoredSession,
  storeSession
} from './auth.storage';

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  error: string | null;
};

const initialStored = loadStoredSession();
const initialState: AuthState = {
  accessToken: initialStored.accessToken,
  refreshToken: initialStored.refreshToken,
  user: initialStored.user,
  organization: initialStored.organization,
  isLoading: false,
  error: null
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.accessToken() && !!store.user())
  })),
  withMethods((store, api = inject(AuthApiService)) => {
    const domainStore = inject(DomainStore);
    const domainGroupStore = inject(DomainGroupStore);

    const prefetchCoreData = () => {
      domainGroupStore.searchList();
      domainStore.searchList();
    };
    const setSession = (payload: AuthResponse) => {
      const nextState: AuthState = {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
        organization: payload.organization,
        isLoading: false,
        error: null
      };

      patchState(store, nextState);
      storeSession(nextState);
    };

    const setTokens = (tokens: AuthTokens) => {
      patchState(store, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
      storeSession({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: store.user(),
        organization: store.organization()
      });
    };

    const setError = (error: unknown, fallback: string) => {
      const message = error instanceof HttpErrorResponse
        ? error.error?.details || error.error?.message || error.message
        : fallback;

      patchState(store, { error: message, isLoading: false });
    };

    const login = (payload: LoginDto): Observable<AuthResponse> => {
      patchState(store, { isLoading: true, error: null });
      return api.login(payload).pipe(
        tap((response) => {
          setSession(response);
          prefetchCoreData();
        }),
        catchError((error) => {
          setError(error, 'Login failed');
          return throwError(() => error);
        }),
        finalize(() => patchState(store, { isLoading: false }))
      );
    };

    const register = (payload: RegisterDto): Observable<AuthResponse> => {
      patchState(store, { isLoading: true, error: null });
      return api.register(payload).pipe(
        tap((response) => {
          setSession(response);
          prefetchCoreData();
        }),
        catchError((error) => {
          setError(error, 'Registration failed');
          return throwError(() => error);
        }),
        finalize(() => patchState(store, { isLoading: false }))
      );
    };

    const refreshTokens = (): Observable<AuthTokens> => {
      const refreshToken = store.refreshToken();

      if (!refreshToken) {
        logout();
        return throwError(() => new Error('Missing refresh token'));
      }

      return api.refresh({ refreshToken }).pipe(
        tap((tokens) => setTokens(tokens)),
        catchError((error) => {
          logout();
          return throwError(() => error);
        })
      );
    };

    const logout = () => {
      clearStoredSession();
      patchState(store, {
        accessToken: null,
        refreshToken: null,
        user: null,
        organization: null,
        isLoading: false,
        error: null
      });
    };

    return {
      login,
      register,
      refreshTokens,
      logout,
      clearError: () => patchState(store, { error: null })
    };
  })
);
