import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { DashboardModeService } from '../layout/dashboard-mode.service';
import { appFallbackRedirectGuard } from './app-fallback-redirect.guard';

describe('appFallbackRedirectGuard', () => {
  let isAuthenticated = false;
  let refreshSucceeds = false;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => appFallbackRedirectGuard(null as never, null as never));

  const resolveGuardResult = async (result: ReturnType<typeof runGuard>) => {
    if (isObservable(result)) {
      return String(await firstValueFrom(result));
    }

    return String(result);
  };

  beforeEach(() => {
    isAuthenticated = false;
    refreshSucceeds = false;

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        DashboardModeService,
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => isAuthenticated,
            refreshTokens: () =>
              refreshSucceeds ? of(undefined) : throwError(() => new Error('no session')),
            fetchSession: () => of(undefined),
          },
        },
        {
          provide: Router,
          useValue: {
            parseUrl: (path: string) => ({ toString: () => path }),
          },
        },
      ],
    });
  });

  it('redirects unknown paths to marketing / on the server', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });

    const result = runGuard();
    expect(String(result)).toBe('/');
  });

  it('redirects guests to /', async () => {
    expect(await resolveGuardResult(runGuard())).toBe('/');
  });

  it('redirects guests with a restored session to the mode landing path', async () => {
    refreshSucceeds = true;
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(await resolveGuardResult(runGuard())).toBe('/overview');
  });

  it('redirects authenticated campaign users to /overview', () => {
    isAuthenticated = true;
    TestBed.inject(DashboardModeService).setMode('campaign');

    const result = runGuard();
    expect(String(result)).toBe('/overview');
  });

  it('redirects authenticated advanced users to /dashboard', () => {
    isAuthenticated = true;
    TestBed.inject(DashboardModeService).setMode('advanced');

    const result = runGuard();
    expect(String(result)).toBe('/dashboard');
  });
});
