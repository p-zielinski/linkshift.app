import { catchError, map, type Observable, of, switchMap } from 'rxjs';
import type { AuthSession, AuthTokens } from '../models/auth.model';

export type AuthSessionRestoreSource = {
  isAuthenticated: () => boolean;
  refreshTokens: () => Observable<AuthTokens>;
  fetchSession: () => Observable<AuthSession>;
};

/**
 * Best-effort session restore for public shells (fallback when no route guard ran first).
 * Swallows errors so guests stay on public pages.
 */
export function tryRestoreAuthSession(authStore: AuthSessionRestoreSource): Observable<void> {
  if (authStore.isAuthenticated()) {
    return of(undefined);
  }

  return authStore.refreshTokens().pipe(
    switchMap(() => authStore.fetchSession()),
    map(() => undefined),
    catchError(() => of(undefined)),
  );
}
