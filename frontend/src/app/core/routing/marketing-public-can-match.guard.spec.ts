import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlSegment } from '@angular/router';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { DashboardModeService } from '../layout/dashboard-mode.service';
import { AuthStore } from '../store/auth.store';
import {
  isSignedInPublicMarketingPath,
  marketingPublicCanMatch,
} from './marketing-public-can-match.guard';

describe('isSignedInPublicMarketingPath', () => {
  const segment = (path: string) => new UrlSegment(path, {});

  it('treats marketing home as non-public', () => {
    expect(isSignedInPublicMarketingPath([])).toBe(false);
  });

  it('allows blog and nested article paths', () => {
    expect(isSignedInPublicMarketingPath([segment('blog')])).toBe(true);
    expect(isSignedInPublicMarketingPath([segment('blog'), segment('bitly-vs-linkshift')])).toBe(
      true,
    );
  });

  it('allows alternatives and nested comparison pages', () => {
    expect(isSignedInPublicMarketingPath([segment('alternatives')])).toBe(true);
    expect(
      isSignedInPublicMarketingPath([segment('alternatives'), segment('redirect-pizza')]),
    ).toBe(true);
  });

  it('allows pricing, tools, contact, use-cases, and legal pages', () => {
    const paths = [
      'pricing',
      'use-cases',
      'contact',
      'qr-code-generator',
      'redirect-tester',
      'terms',
      'privacy',
      'cookies',
      'do-not-sell',
    ];

    expect(paths.every((path) => isSignedInPublicMarketingPath([segment(path)]))).toBe(true);
  });
});

describe('marketingPublicCanMatch', () => {
  let isAuthenticated = false;
  let refreshSucceeds = false;

  const runGuard = (paths: string[] = []) => {
    const segments = paths.map((path) => new UrlSegment(path, {}));
    return TestBed.runInInjectionContext(() =>
      marketingPublicCanMatch(null as never, segments),
    );
  };

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

  it('allows the marketing shell on the server', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });

    expect(runGuard()).toBe(true);
  });

  it('allows guests on marketing home', async () => {
    expect(await resolveGuardResult(runGuard())).toBe('true');
  });

  it('allows guests on public marketing pages', async () => {
    expect(await resolveGuardResult(runGuard(['pricing']))).toBe('true');
    expect(await resolveGuardResult(runGuard(['blog', 'bitly-vs-linkshift']))).toBe('true');
  });

  it('redirects signed-in campaign users on marketing home to /overview', () => {
    isAuthenticated = true;
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard())).toBe('/overview');
  });

  it('redirects signed-in advanced users on marketing home to /dashboard', () => {
    isAuthenticated = true;
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard())).toBe('/dashboard');
  });

  it('does not match app routes so AppShell can handle them', () => {
    isAuthenticated = true;
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard(['overview']))).toBe('false');
    expect(String(runGuard(['links']))).toBe('false');
    expect(String(runGuard(['dashboard']))).toBe('false');
  });

  it('allows signed-in users on public marketing pages', () => {
    isAuthenticated = true;

    expect(String(runGuard(['pricing']))).toBe('true');
    expect(String(runGuard(['blog', 'bitly-vs-linkshift']))).toBe('true');
    expect(String(runGuard(['terms']))).toBe('true');
  });

  it('allows signed-in users on alternatives pages', () => {
    isAuthenticated = true;

    expect(String(runGuard(['alternatives', 'redirect-pizza']))).toBe('true');
  });

  it('redirects guests with a restored session on marketing home to the mode landing path', async () => {
    refreshSucceeds = true;
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(await resolveGuardResult(runGuard())).toBe('/overview');
  });
});
