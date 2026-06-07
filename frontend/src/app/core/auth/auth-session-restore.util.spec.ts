import { describe, expect, it, vi } from 'vitest';
import { of, throwError, type Observable } from 'rxjs';
import type { AuthSession } from '../models/auth.model';
import {
  tryRestoreAuthSession,
  type AuthSessionRestoreSource,
} from './auth-session-restore.util';

function createAuthStore(
  overrides: Partial<AuthSessionRestoreSource> = {},
): AuthSessionRestoreSource {
  return {
    isAuthenticated: () => false,
    refreshTokens: () => of({ accessToken: 'a', refreshToken: 'r' }),
    fetchSession: (): Observable<AuthSession> => of({} as AuthSession),
    ...overrides,
  };
}

describe('tryRestoreAuthSession', () => {
  it('skips refresh when already authenticated', async () => {
    const refreshTokens = vi.fn();
    const authStore = createAuthStore({
      isAuthenticated: () => true,
      refreshTokens,
    });

    await new Promise<void>((resolve, reject) => {
      tryRestoreAuthSession(authStore).subscribe({
        next: () => resolve(),
        error: reject,
      });
    });

    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('refreshes and fetches session when guest cookies exist', async () => {
    const refreshTokens = vi.fn(() => of({ accessToken: 'a', refreshToken: 'r' }));
    const fetchSession = vi.fn((): Observable<AuthSession> => of({} as AuthSession));
    const authStore = createAuthStore({ refreshTokens, fetchSession });

    await new Promise<void>((resolve, reject) => {
      tryRestoreAuthSession(authStore).subscribe({
        next: () => resolve(),
        error: reject,
      });
    });

    expect(refreshTokens).toHaveBeenCalledOnce();
    expect(fetchSession).toHaveBeenCalledOnce();
  });

  it('swallows refresh errors for guests', async () => {
    const authStore = createAuthStore({
      refreshTokens: () => throwError(() => new Error('no session')),
    });

    await new Promise<void>((resolve, reject) => {
      tryRestoreAuthSession(authStore).subscribe({
        next: () => resolve(),
        error: reject,
      });
    });
  });
});
