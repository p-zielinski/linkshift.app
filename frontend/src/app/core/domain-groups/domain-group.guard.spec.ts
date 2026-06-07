import { PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, type ActivatedRouteSnapshot } from '@angular/router';
import { DomainGroupStore } from '../store/domain-group.store';
import { DEFAULT_LIST_KEY } from '../store/entity/entity-store.utils';
import { DashboardModeService } from '../layout/dashboard-mode.service';
import {
  ADVANCED_MISSING_DOMAIN_GROUPS_PATH,
  DOMAIN_GROUPS_REQUIRED_MESSAGE,
  domainGroupsRequiredGuard,
  resetDomainGroupsRequiredSnackbarDebounceForTests,
} from './domain-group.guard';

describe('domainGroupsRequiredGuard', () => {
  const listResult = signal<{ data: { id: string }[] } | null>(null);
  const isLoading = signal<Record<string, boolean>>({});
  const expirationDates = signal<Record<string, number | null>>({});
  const snackBarOpen = vi.fn();

  const runGuard = (route: Partial<ActivatedRouteSnapshot> = {}) => {
    const snapshot = {
      data: {},
      ...route,
    } as ActivatedRouteSnapshot;

    return TestBed.runInInjectionContext(() => domainGroupsRequiredGuard(snapshot, null as never));
  };

  beforeEach(() => {
    listResult.set(null);
    isLoading.set({});
    expirationDates.set({ [DEFAULT_LIST_KEY]: Date.now() + 60_000 });
    snackBarOpen.mockReset();
    resetDomainGroupsRequiredSnackbarDebounceForTests();

    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        DashboardModeService,
        {
          provide: DomainGroupStore,
          useValue: {
            selectListResult: () => listResult,
            expirationDates: () => expirationDates(),
            isLoading: () => isLoading(),
            searchList: vi.fn(),
          },
        },
        {
          provide: Router,
          useValue: {
            parseUrl: (path: string) => ({ toString: () => path }),
          },
        },
        {
          provide: MatSnackBar,
          useValue: {
            open: snackBarOpen,
          },
        },
      ],
    });
  });

  it('allows access when domain groups exist', () => {
    listResult.set({ data: [{ id: 'group-1' }] });

    expect(runGuard()).toBe(true);
    expect(snackBarOpen).not.toHaveBeenCalled();
  });

  it('redirects advanced users to domain groups create flow when none exist', () => {
    listResult.set({ data: [] });
    TestBed.inject(DashboardModeService).setMode('advanced');

    const result = runGuard();
    expect(String(result)).toBe(ADVANCED_MISSING_DOMAIN_GROUPS_PATH);
    expect(snackBarOpen).toHaveBeenCalledWith(DOMAIN_GROUPS_REQUIRED_MESSAGE, 'Dismiss', {
      duration: 4_000,
    });
  });

  it('redirects campaign users to /overview when no domain groups exist', () => {
    listResult.set({ data: [] });
    TestBed.inject(DashboardModeService).setMode('campaign');

    const result = runGuard();
    expect(String(result)).toBe('/overview');
    expect(snackBarOpen).toHaveBeenCalledWith(DOMAIN_GROUPS_REQUIRED_MESSAGE, 'Dismiss', {
      duration: 4_000,
    });
  });

  it('debounces snackbar when redirecting repeatedly within the debounce window', () => {
    listResult.set({ data: [] });

    runGuard();
    runGuard();

    expect(snackBarOpen).toHaveBeenCalledTimes(1);
  });

  it('does not show snackbar during SSR', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        DashboardModeService,
        {
          provide: DomainGroupStore,
          useValue: {
            selectListResult: () => listResult,
            expirationDates: () => expirationDates(),
            isLoading: () => isLoading(),
            searchList: vi.fn(),
          },
        },
        {
          provide: Router,
          useValue: {
            parseUrl: (path: string) => ({ toString: () => path }),
          },
        },
        {
          provide: MatSnackBar,
          useValue: {
            open: snackBarOpen,
          },
        },
      ],
    });

    listResult.set({ data: [] });

    expect(runGuard()).toBe(true);
    expect(snackBarOpen).not.toHaveBeenCalled();
  });

  it('skips domain group requirement for campaign onboarding routes', () => {
    listResult.set({ data: [] });

    expect(
      runGuard({
        data: { skipDomainGroupsInCampaign: true },
      }),
    ).toBe(true);
  });

  it('still enforces domain groups on onboarding routes in advanced mode', () => {
    listResult.set({ data: [] });
    TestBed.inject(DashboardModeService).setMode('advanced');

    const result = runGuard({
      data: { skipDomainGroupsInCampaign: true },
    });
    expect(String(result)).toBe(ADVANCED_MISSING_DOMAIN_GROUPS_PATH);
  });

});
