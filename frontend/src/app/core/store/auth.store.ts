import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { catchError, finalize, tap, throwError, type Observable } from 'rxjs';
import type { AuthResponse, AuthTokens } from '../models/auth.model';
import type { LoginDto, RegisterDto } from '../models/auth.dto';
import type { Organization } from '../models/organization.model';
import type { User } from '../models/user.model';
import { AuthApiService } from '../api/auth-api.service';
import { DomainGroupStore } from './domain-group.store';
import { DomainStore } from './domain.store';
import { extractErrorMessage } from './store-error.utils';
import {
  clearStoredSession,
  loadStoredSession,
  storeSession
} from './auth.storage';

export type AuthState = {
  accessToken: string | null;
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  error: string | null;
};

const initialStored = loadStoredSession();
const initialState: AuthState = {
  accessToken: null,
  user: initialStored.user,
  organization: initialStored.organization,
  isLoading: false,
  error: null
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.accessToken())
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
        accessToken: tokens.accessToken
      });
      storeSession({
        user: store.user(),
        organization: store.organization()
      });
    };

    const updateUser = (partial: Partial<User>) => {
      const current = store.user();
      if (!current) {
        return;
      }
      const nextUser = { ...current, ...partial };
      patchState(store, { user: nextUser });
      storeSession({
        user: nextUser,
        organization: store.organization()
      });
    };

    const setError = (error: unknown, fallback: string) => {
      const message = extractErrorMessage(error, fallback);
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
          if (!response.checkoutUrl) {
            prefetchCoreData();
          }
        }),
        catchError((error) => {
          setError(error, 'Registration failed');
          return throwError(() => error);
        }),
        finalize(() => patchState(store, { isLoading: false }))
      );
    };

    const refreshTokens = (): Observable<AuthTokens> => {
      return api.refresh().pipe(
        tap((tokens) => setTokens(tokens)),
        catchError((error) => {
          logout();
          return throwError(() => error);
        })
      );
    };

    const logout = () => {
      api.logout().subscribe({
        error: () => undefined,
      });
      clearStoredSession();
      patchState(store, {
        accessToken: null,
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
      updateUser,
      clearError: () => patchState(store, { error: null })
    };
  })
);
