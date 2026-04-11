import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { catchError, finalize, tap, throwError, type Observable } from 'rxjs';
import type { AuthResponse, AuthSession, AuthTokens } from '../models/auth.model';
import type { LoginDto, RegisterDto } from '../models/auth.dto';
import type { Organization } from '../models/organization.model';
import type { User } from '../models/user.model';
import { AuthApiService } from '../api/auth-api.service';
import { DomainGroupStore } from './domain-group.store';
import { DomainStore } from './domain.store';
import { RedirectRuleStore } from './redirect-rule.store';
import { RedirectTestStore } from './redirect-test.store';
import { LinkMapStore } from './link-map.store';
import { LinkMapEntryStore } from './link-map-entry.store';
import { RedirectTestResultsStore } from './redirect-test-results.store';
import { OrganizationMembersStore } from './organization-members.store';
import { BillingPlansStore } from './billing-plans.store';
import { OrganizationUsageStore } from './organization-usage.store';
import { RedirectRulesAnalyticsStore } from './redirect-rules-analytics.store';
import { ApiKeyStore } from './api-key.store';
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
    const redirectRuleStore = inject(RedirectRuleStore);
    const redirectTestStore = inject(RedirectTestStore);
    const linkMapStore = inject(LinkMapStore);
    const linkMapEntryStore = inject(LinkMapEntryStore);
    const redirectTestResultsStore = inject(RedirectTestResultsStore);
    const organizationMembersStore = inject(OrganizationMembersStore);
    const billingPlansStore = inject(BillingPlansStore);
    const organizationUsageStore = inject(OrganizationUsageStore);
    const redirectRulesAnalyticsStore = inject(RedirectRulesAnalyticsStore);
    const apiKeyStore = inject(ApiKeyStore);

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

    const setSessionProfile = (payload: AuthSession) => {
      patchState(store, {
        user: payload.user,
        organization: payload.organization
      });
      storeSession({
        user: payload.user,
        organization: payload.organization
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
          if (error.status === 401) {
            patchState(store, { accessToken: null, user: null });
          }
          return throwError(() => error);
        })
      );
    };

    const fetchSession = (): Observable<AuthSession> => {
      return api.getSession().pipe(
        tap((session) => setSessionProfile(session)),
        catchError((error) => {
          if (error.status === 401) {
            patchState(store, { accessToken: null, user: null, organization: null });
          }
          return throwError(() => error);
        })
      );
    };

    const logout = (redirectFnc: () => void) => {
      const resetStores = () => {
        domainStore.resetStore();
        domainGroupStore.resetStore();
        redirectRuleStore.resetStore();
        redirectTestStore.resetStore();
        linkMapStore.resetStore();
        linkMapEntryStore.resetStore();
        redirectTestResultsStore.resetStore();
        organizationMembersStore.resetStore();
        billingPlansStore.resetStore();
        organizationUsageStore.resetStore();
        redirectRulesAnalyticsStore.resetStore();
        apiKeyStore.resetStore();
      };

      api.logout().pipe().subscribe({
        next: () => {
          clearStoredSession();
          patchState(store, {
            accessToken: null,
            user: null,
            organization: null,
            isLoading: false,
            error: null
          });
          resetStores();
          redirectFnc();
        },
        error: () => {
          clearStoredSession();
          patchState(store, {
            accessToken: null,
            user: null,
            organization: null,
            isLoading: false,
            error: null
          });
          resetStores();
          redirectFnc();
        },
      });

    };

    return {
      login,
      register,
      refreshTokens,
      fetchSession,
      logout,
      updateUser,
      clearError: () => patchState(store, { error: null })
    };
  })
);
