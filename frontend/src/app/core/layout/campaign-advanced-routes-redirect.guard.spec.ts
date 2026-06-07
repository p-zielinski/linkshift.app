import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DashboardModeService } from './dashboard-mode.service';
import { campaignAdvancedRoutesRedirectGuard } from './campaign-advanced-routes-redirect.guard';

describe('campaignAdvancedRoutesRedirectGuard', () => {
  const runGuard = (url: string) =>
    TestBed.runInInjectionContext(() =>
      campaignAdvancedRoutesRedirectGuard(null as never, { url } as never),
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

  it('allows advanced routes on the server', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/redirect-rules'))).toBe('true');
  });

  it('allows advanced routes in advanced mode', () => {
    TestBed.inject(DashboardModeService).setMode('advanced');

    expect(String(runGuard('/redirect-rules'))).toBe('true');
    expect(String(runGuard('/domains'))).toBe('true');
    expect(String(runGuard('/redirect-rules-analytics'))).toBe('true');
  });

  it('redirects /dashboard to /overview in campaign mode', () => {
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/dashboard'))).toBe('/overview');
  });

  it('redirects /redirect-rules-analytics to /analytics in campaign mode', () => {
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/redirect-rules-analytics'))).toBe('/analytics');
  });

  it('redirects advanced-only routes to campaign equivalents in campaign mode', () => {
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/redirect-rules'))).toBe('/links');
    expect(String(runGuard('/domains'))).toBe('/settings#hosts');
    expect(String(runGuard('/domain-groups'))).toBe('/settings#hosts');
    expect(String(runGuard('/subdomains'))).toBe('/settings#hosts');
    expect(String(runGuard('/link-maps'))).toBe('/links');
    expect(String(runGuard('/link-maps/abc'))).toBe('/links?linkMapId=abc');
    expect(String(runGuard('/tests'))).toBe('/tools/redirect-tester');
  });

  it('allows shared routes in campaign mode', () => {
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/links'))).toBe('true');
    expect(String(runGuard('/tools'))).toBe('true');
    expect(String(runGuard('/settings'))).toBe('true');
    expect(String(runGuard('/settings#plan-usage'))).toBe('true');
  });

  it('preserves query params when redirecting /redirect-rules-analytics in campaign mode', () => {
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/redirect-rules-analytics?workspace=x&ruleId=y'))).toBe(
      '/analytics?workspace=x&ruleId=y',
    );
  });

  it('preserves fragment when redirecting /redirect-rules-analytics in campaign mode', () => {
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/redirect-rules-analytics#filters'))).toBe('/analytics#filters');
  });

  it('preserves query params and fragment when redirecting /link-maps/:id in campaign mode', () => {
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/link-maps/abc?workspace=x#details'))).toBe(
      '/links?workspace=x&linkMapId=abc#details',
    );
  });

  it('redirects domain infra routes to settings hosts section in campaign mode', () => {
    TestBed.inject(DashboardModeService).setMode('campaign');

    expect(String(runGuard('/domains?workspace=x'))).toBe('/settings?workspace=x#hosts');
    expect(String(runGuard('/domains#plan-usage'))).toBe('/settings#plan-usage');
  });
});
