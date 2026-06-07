import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { type CanMatchFn } from '@angular/router';
import { map } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { tryRestoreAuthSession } from './auth-session-restore.util';

/**
 * Restores auth from refresh cookies before a public shell renders (e.g. `/docs`).
 * Marketing routes use `marketingPublicCanMatch`, which includes the same restore step.
 */
export const publicSessionRestoreCanMatch: CanMatchFn = () => {
  const platformId = inject(PLATFORM_ID);
  const authStore = inject(AuthStore);

  if (isPlatformServer(platformId)) {
    return true;
  }

  if (authStore.isAuthenticated()) {
    return true;
  }

  return tryRestoreAuthSession(authStore).pipe(map(() => true));
};
