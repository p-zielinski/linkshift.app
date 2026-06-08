import {
  HttpContextToken,
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

type RefreshEvent =
  | { status: 'success'; token: string }
  | { status: 'error'; error: unknown };

const RETRY_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

// Flag to indicate if a refresh operation is currently in progress
let isRefreshing = false;
// Queue for pending requests while refreshing
const refreshTokenSubject = new BehaviorSubject<RefreshEvent | null>(null);
let isHandlingAuthFailure = false;

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
          return handle401Error(authReq, next, authStore, router, error);
        }

        if (error.status === 403) {
          const details = (error.error as { details?: string })?.details ?? '';
          if (details.toLowerCase().includes('legal consent')) {
            if (!isPlatformServer(platformId)) {
              const currentPath = router.url.split('?')[0] ?? router.url;
              if (!currentPath.startsWith('/legal/consent')) {
                void router.navigateByUrl('/legal/consent');
              }
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
  logout: (redirectFnc: () => void) => void;
};

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authStore: AuthStoreLike,
  router: Router,
  originalError: HttpErrorResponse,
) {
  if (request.context.get(RETRY_AFTER_REFRESH)) {
    triggerAuthFailureRedirect(authStore, router);
    return throwError(() => originalError);
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authStore.refreshTokens().pipe(
      switchMap((response: AuthTokens) => {
        isRefreshing = false;
        const newToken = response.accessToken;
        refreshTokenSubject.next({ status: 'success', token: newToken });

        return next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
            context: request.context.set(RETRY_AFTER_REFRESH, true),
          }),
        );
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.next({ status: 'error', error: err });
        triggerAuthFailureRedirect(authStore, router);
        return throwError(() => err);
      }),
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((event): event is RefreshEvent => event !== null),
      take(1),
      switchMap((event) => {
        if (event.status === 'error') {
          return throwError(() => event.error);
        }

        return next(
          request.clone({
            setHeaders: { Authorization: `Bearer ${event.token}` },
            context: request.context.set(RETRY_AFTER_REFRESH, true),
          }),
        );
      }),
    );
  }
}

function triggerAuthFailureRedirect(authStore: AuthStoreLike, router: Router): void {
  if (isHandlingAuthFailure) {
    return;
  }

  isHandlingAuthFailure = true;
  authStore.logout(() => {
    void router.navigateByUrl('/auth').finally(() => {
      isHandlingAuthFailure = false;
    });
  });
}

/** Resets module-level interceptor state between tests. */
export function resetAuthInterceptorStateForTests(): void {
  isRefreshing = false;
  isHandlingAuthFailure = false;
  refreshTokenSubject.next(null);
}
