// src/app/core/auth/auth.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

// Flag to indicate if a refresh operation is currently in progress
let isRefreshing = false;
// Queue for pending requests while refreshing
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.accessToken();

  // 1. Skip Auth for Auth endpoints (login/register/refresh) to avoid infinite loops
  if (req.url.includes('/api/v1/auth')) {
    return next(req);
  }

  // 2. Add Token if available
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 3. Handle 401 Unauthorized errors
  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next, authStore);
      }
      return throwError(() => error);
    })
  );
};

// --- Helper function for Refresh Logic ---

function handle401Error(request: any, next: any, authStore: AuthStore) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authStore.refreshTokens().pipe(
      switchMap((response) => {
        isRefreshing = false;
        const newToken = response.accessToken;
        refreshTokenSubject.next(newToken);

        // Retry the original failed request with the new token
        return next(request.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        }));
      }),
      catchError((err) => {
        isRefreshing = false;
        // If refresh fails, the AuthStore handles logout internally via tap/catchError
        return throwError(() => err);
      })
    );
  } else {
    // If refresh is already in progress, wait for it to complete
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        return next(request.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        }));
      })
    );
  }
}
