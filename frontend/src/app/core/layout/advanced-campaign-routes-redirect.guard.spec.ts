import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DashboardModeService } from './dashboard-mode.service';
import { advancedCampaignRoutesRedirectGuard } from './advanced-campaign-routes-redirect.guard';

describe('advancedCampaignRoutesRedirectGuard', () => {
  const runGuard = (url: string) =>
    TestBed.runInInjectionContext(() =>
      advancedCampaignRoutesRedirectGuard(null as never, { url } as never),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        DashboardModeService,
        {
          provide: Router,
          useValue: {
            parseUrl: (url: string) => {
              const parsed = new URL(url, 'http://localhost');
              const pathname = parsed.pathname;
              const queryParams = Object.fromEntries(parsed.searchParams.entries());
              const fragment = parsed.hash ? parsed.hash.slice(1) : null;

              return {
                queryParams: { ...queryParams },
                fragment,
                toString() {
                  const query = new URLSearchParams(this.queryParams).toString();
                  let result = pathname;
                  if (query) {
                    result += `?${query}`;
                  }
                  if (this.fragment) {
                    result += `#${this.fragment}`;
                  }
                  return result;
                },
              };
            },
          },
        },
      ],
    });
  });

  it('allows campaign routes on the server', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard('/overview'))).toBe('true');
  });

  it('allows campaign routes in campaign mode', () => {
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/overview'))).toBe('true');
    expect(String(runGuard('/analytics'))).toBe('true');
    expect(String(runGuard('/settings'))).toBe('true');
  });

  it('redirects /overview to /dashboard in advanced mode', () => {
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard('/overview'))).toBe('/dashboard');
  });

  it('redirects /analytics to /redirect-rules-analytics in advanced mode', () => {
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard('/analytics'))).toBe('/redirect-rules-analytics');
  });

  it('allows /settings in advanced mode', () => {
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard('/settings'))).toBe('true');
    expect(String(runGuard('/settings#plan-usage'))).toBe('true');
  });

  it('preserves query params when redirecting /analytics in advanced mode', () => {
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard('/analytics?workspace=x&ruleId=y'))).toBe(
      '/redirect-rules-analytics?workspace=x&ruleId=y',
    );
  });

  it('preserves fragment when redirecting /analytics in advanced mode', () => {
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard('/analytics#filters'))).toBe('/redirect-rules-analytics#filters');
  });

  it('preserves query params and fragment when redirecting /analytics in advanced mode', () => {
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard('/analytics?workspace=x&ruleId=y#filters'))).toBe(
      '/redirect-rules-analytics?workspace=x&ruleId=y#filters',
    );
  });
});
