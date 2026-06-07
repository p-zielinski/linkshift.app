import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { DashboardModeService } from '../layout/dashboard-mode.service';
import { AuthStore } from '../store/auth.store';
import { guestGuard } from './auth.guard';

describe('guestGuard', () => {
  let isAuthenticated = false;
  let refreshSucceeds = false;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => guestGuard(null as never, null as never));

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
            fetchSession: () => {
              if (refreshSucceeds) {
                isAuthenticated = true;
              }
              return of(undefined);
            },
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

  it('allows auth routes to render on the server', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });

    expect(runGuard()).toBe(true);
  });

  it('allows guests without a session', async () => {
    expect(await resolveGuardResult(runGuard())).toBe('true');
  });

  it('redirects signed-in campaign users to /overview', () => {
    isAuthenticated = true;
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard())).toBe('/overview');
  });

  it('redirects signed-in advanced users to /dashboard', () => {
    isAuthenticated = true;
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard())).toBe('/dashboard');
  });

  it('redirects guests with a restored session to the mode landing path', async () => {
    refreshSucceeds = true;
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(await resolveGuardResult(runGuard())).toBe('/overview');
  });
});
