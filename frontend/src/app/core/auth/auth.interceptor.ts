import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import {
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
  type Observable,
} from 'rxjs';
import type { AuthTokens } from '../models/auth.model';

// Flag to indicate if a refresh operation is currently in progress
let isRefreshing = false;
// Queue for pending requests while refreshing
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const token = authStore.accessToken();

  // 1. Skip Auth for public auth endpoints to avoid infinite loops
  const publicAuthPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/register-invite',
    '/api/v1/auth/refresh',
    '/api/v1/auth/logout',
    '/api/v1/auth/verify-email',
    '/api/v1/auth/password-reset/request',
    '/api/v1/auth/password-reset/confirm',
    '/api/v1/auth/invites/lookup',
  ];

  if (publicAuthPaths.some((path) => req.url.includes(path))) {
    return next(req);
  }

  // 2. Add Token if available
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  // 3. Handle 401 Unauthorized errors
  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        // Only attempt token refresh logic in the browser
        if (error.status === 401 && !isPlatformServer(platformId)) {
          return handle401Error(authReq, next, authStore);
        }

        if (error.status === 403) {
          const details = (error.error as { details?: string })?.details ?? '';
          if (details.toLowerCase().includes('legal consent')) {
            // Only navigate if we are in the browser
            if (!isPlatformServer(platformId)) {
              router.navigateByUrl('/legal/consent');
            }
          }
        }
      }
      return throwError(() => error);
    }),
  );
};

// --- Helper function for Refresh Logic ---

type AuthStoreLike = {
  accessToken: () => string | null;
  refreshTokens: () => Observable<AuthTokens>;
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authStore: AuthStoreLike,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authStore.refreshTokens().pipe(
      switchMap((response: AuthTokens) => {
        isRefreshing = false;
        const newToken = response.accessToken;
        refreshTokenSubject.next(newToken);

        return next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          }),
        );
      }),
      catchError((err) => {
        isRefreshing = false;
        return throwError(() => err);
      }),
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => {
        return next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          }),
        );
      }),
    );
  }
}
