import { inject } from '@angular/core';
import { type CanActivateFn, type CanMatchFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthStore } from '../store/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  return authStore.refreshTokens().pipe(
    map(() => true),
    catchError(() => of(router.parseUrl('/auth'))),
  );
};

export const guestGuard: CanMatchFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return authStore.refreshTokens().pipe(
      map(() => router.parseUrl('/dashboard')),
      catchError(() => of(true)),
    );
  }

  return router.parseUrl('/dashboard');
};
