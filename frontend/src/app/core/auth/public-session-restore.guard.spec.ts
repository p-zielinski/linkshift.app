import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UrlSegment } from '@angular/router';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { publicSessionRestoreCanMatch } from './public-session-restore.guard';

describe('publicSessionRestoreCanMatch', () => {
  let isAuthenticated = false;
  let refreshCalls = 0;

  const runGuard = () => {
    const segments = [new UrlSegment('docs', {})];
    return TestBed.runInInjectionContext(() =>
      publicSessionRestoreCanMatch(null as never, segments),
    );
  };

  const resolveGuardResult = async (result: ReturnType<typeof runGuard>) => {
    if (isObservable(result)) {
      return await firstValueFrom(result);
    }

    return result;
  };

  beforeEach(() => {
    isAuthenticated = false;
    refreshCalls = 0;

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => isAuthenticated,
            refreshTokens: () => {
              refreshCalls += 1;
              isAuthenticated = true;
              return of({ accessToken: 'token', refreshToken: 'refresh' });
            },
            fetchSession: () => of({}),
          },
        },
      ],
    });
  });

  it('allows navigation on the server without refresh', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    expect(runGuard()).toBe(true);
    expect(refreshCalls).toBe(0);
  });

  it('skips refresh when already authenticated', () => {
    isAuthenticated = true;
    expect(runGuard()).toBe(true);
    expect(refreshCalls).toBe(0);
  });

  it('restores session before matching when refresh cookies exist', async () => {
    expect(await resolveGuardResult(runGuard())).toBe(true);
    expect(refreshCalls).toBe(1);
    expect(isAuthenticated).toBe(true);
  });

  it('still allows navigation when refresh fails', async () => {
    TestBed.overrideProvider(AuthStore, {
      useValue: {
        isAuthenticated: () => false,
        refreshTokens: () => throwError(() => new Error('no session')),
        fetchSession: () => of({}),
      },
    });

    expect(await resolveGuardResult(runGuard())).toBe(true);
  });
});
