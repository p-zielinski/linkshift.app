import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { WizardDialogService } from '../../../core/services/wizard-dialog.service';
import { DashboardModeService } from '../../../core/layout/dashboard-mode.service';
import { DashboardDialogQueueService } from './dashboard-dialog-queue.service';
import {
  DASHBOARD_ONBOARDING_SHOW_ALWAYS,
  DASHBOARD_ONBOARDING_STORAGE_KEY,
  DASHBOARD_ONBOARDING_WINDOW_MS,
  DashboardOnboardingService,
  hasDashboardDialogQueryIntent,
  isOnboardingLandingRoute,
  shouldDeferOnboardingForRoute,
} from './dashboard-onboarding.service';
import type { DashboardOnboardingDialogResult } from '../components/dashboard-onboarding-dialog/dashboard-onboarding-dialog.component';
import { CampaignConnectDomainService } from '../../campaign-connect-domain/campaign-connect-domain.service';

function createDialogRef<TResult>(): {
  ref: MatDialogRef<TResult>;
  afterClosed$: Subject<TResult | null | undefined>;
} {
  const afterClosed$ = new Subject<TResult | null | undefined>();
  const ref = {
    afterClosed: () => afterClosed$.asObservable(),
    componentRef: null,
  } as MatDialogRef<TResult>;

  return { ref, afterClosed$ };
}

describe('DashboardOnboardingService', () => {
  let service: DashboardOnboardingService;
  let dialogQueue: DashboardDialogQueueService;
  let wizardOpen: ReturnType<typeof vi.fn>;
  let afterClosed$: Subject<DashboardOnboardingDialogResult | null | undefined>;
  let isCampaign: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.fn>;
  let openConnectDialog: ReturnType<typeof vi.fn>;
  let connectAfterClosed$: Subject<unknown>;
  let onboardingOpenCount: number;

  beforeEach(() => {
    afterClosed$ = new Subject<DashboardOnboardingDialogResult | null | undefined>();
    isCampaign = vi.fn().mockReturnValue(false);
    navigate = vi.fn().mockResolvedValue(true);
    navigateByUrl = vi.fn().mockResolvedValue(true);
    openConnectDialog = vi.fn();
    connectAfterClosed$ = new Subject<unknown>();
    onboardingOpenCount = 0;
    wizardOpen = vi.fn().mockImplementation(() => {
      onboardingOpenCount += 1;
      return {
        afterClosed: () => afterClosed$.asObservable(),
        componentRef: null,
      } as MatDialogRef<unknown, DashboardOnboardingDialogResult | null | undefined>;
    });
    openConnectDialog.mockImplementation(() => ({
      afterClosed: () => connectAfterClosed$.asObservable(),
      componentRef: null,
    }));

    localStorage.clear();
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);

    TestBed.configureTestingModule({
      providers: [
        DashboardOnboardingService,
        DashboardDialogQueueService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: WizardDialogService, useValue: { openWizard: wizardOpen } },
        { provide: DashboardModeService, useValue: { isCampaign } },
        {
          provide: Router,
          useValue: { navigate, navigateByUrl },
        },
        {
          provide: CampaignConnectDomainService,
          useValue: { openDialog: openConnectDialog },
        },
      ],
    });

    service = TestBed.inject(DashboardOnboardingService);
    dialogQueue = TestBed.inject(DashboardDialogQueueService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('shouldOpen returns false on the server', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        DashboardOnboardingService,
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: WizardDialogService, useValue: { openWizard: wizardOpen } },
        { provide: DashboardModeService, useValue: { isCampaign } },
      ],
    });

    const serverService = TestBed.inject(DashboardOnboardingService);
    const createdAt = new Date(1_000_000 - DASHBOARD_ONBOARDING_WINDOW_MS / 2).toISOString();

    expect(serverService.shouldOpen(createdAt)).toBe(false);
  });

  it('shouldOpen returns false when onboarding was already dismissed', () => {
    localStorage.setItem(DASHBOARD_ONBOARDING_STORAGE_KEY, 'true');
    const createdAt = new Date(1_000_000 - 1_000).toISOString();

    expect(service.shouldOpen(createdAt)).toBe(false);
  });

  it('shouldOpen returns false for invalid createdAt', () => {
    expect(service.shouldOpen('not-a-date')).toBe(false);
  });

  it('shouldOpen returns true within the onboarding window', () => {
    const createdAt = new Date(1_000_000 - DASHBOARD_ONBOARDING_WINDOW_MS / 2).toISOString();

    expect(service.shouldOpen(createdAt)).toBe(true);
  });

  it('shouldOpen returns false outside the onboarding window', () => {
    const createdAt = new Date(1_000_000 - DASHBOARD_ONBOARDING_WINDOW_MS - 1).toISOString();

    expect(service.shouldOpen(createdAt)).toBe(false);
  });

  it('open uses WizardDialogService with dismissible config', () => {
    service.open();

    expect(wizardOpen).toHaveBeenCalledWith(
      expect.any(Function),
      { campaignMode: false },
      0,
      { disableClose: false },
    );
  });

  it('open passes campaignMode in dialog data when dashboard is in campaign mode', () => {
    isCampaign.mockReturnValue(true);

    service.open();

    expect(wizardOpen).toHaveBeenCalledWith(
      expect.any(Function),
      { campaignMode: true },
      0,
      { disableClose: false },
    );
  });

  it('open passes campaignMode false in advanced mode', () => {
    isCampaign.mockReturnValue(false);

    service.open();

    expect(wizardOpen).toHaveBeenCalledWith(
      expect.any(Function),
      { campaignMode: false },
      0,
      { disableClose: false },
    );
  });

  it('open passes campaignMode when the dialog queue defers opening', () => {
    isCampaign.mockReturnValue(true);
    const blocking = createDialogRef<void>();
    dialogQueue.openBlocking(() => blocking.ref);

    service.open();

    expect(wizardOpen).not.toHaveBeenCalled();

    blocking.afterClosed$.next(undefined);

    expect(wizardOpen).toHaveBeenCalledWith(
      expect.any(Function),
      { campaignMode: true },
      0,
      { disableClose: false },
    );
  });

  it('markDismissed persists dismissal to localStorage', () => {
    service.markDismissed();

    expect(localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  /** `handleDialogClosed` is async; flush microtasks after emitting dialog close. */
  async function flushDialogClosedHandler(): Promise<void> {
    await Promise.resolve();
  }

  it('open marks onboarding dismissed when the wizard is confirmed', async () => {
    service.open();
    afterClosed$.next({ confirmed: true });
    await flushDialogClosedHandler();

    expect(localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  it('open marks onboarding dismissed when the wizard is skipped', async () => {
    service.open();
    afterClosed$.next({ confirmed: false });
    await flushDialogClosedHandler();

    expect(localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  it('open marks onboarding dismissed when the wizard closes without a result (backdrop/ESC)', async () => {
    service.open();
    afterClosed$.next(undefined);
    await flushDialogClosedHandler();

    expect(localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  it('open marks onboarding dismissed when the wizard closes with a null result (backdrop/ESC)', async () => {
    service.open();
    afterClosed$.next(null);
    await flushDialogClosedHandler();

    expect(localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY)).toBe('true');
  });

  it('open navigates to links create flow when the wizard requests openCreate', async () => {
    service.open();
    afterClosed$.next({ confirmed: true, openCreate: true });
    await flushDialogClosedHandler();

    expect(navigate).toHaveBeenCalledWith(['/links'], { queryParams: { openCreate: '1' } });
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('open navigates to the requested route when navigateTo is set', async () => {
    service.open();
    afterClosed$.next({ confirmed: true, navigateTo: '/domain-groups' });
    await flushDialogClosedHandler();

    expect(navigateByUrl).toHaveBeenCalledWith('/domain-groups');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('open launches connect-domain dialog when onboarding requests subdomain choice', async () => {
    const connectDomainData = {
      domainGroupId: 'group-default',
      existingWorkspaceName: 'Default',
    };

    service.open();
    afterClosed$.next({ confirmed: true, openConnectDomain: true, connectDomainData });
    await flushDialogClosedHandler();

    expect(openConnectDialog).toHaveBeenCalledWith(connectDomainData);
    expect(localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('resumes onboarding on next step after connect-domain succeeds', async () => {
    service.open();
    afterClosed$.next({
      confirmed: true,
      openConnectDomain: true,
      connectDomainData: { domainGroupId: 'group-default' },
    });
    await flushDialogClosedHandler();

    connectAfterClosed$.next({
      connected: true,
      domainGroupId: 'group-default',
      host: 'launch.localhost',
    });
    await flushDialogClosedHandler();

    expect(onboardingOpenCount).toBe(2);
    expect(wizardOpen).toHaveBeenLastCalledWith(
      expect.any(Function),
      { campaignMode: false, subdomainChoiceCompleted: true, initialStepId: 'next' },
      0,
      { disableClose: false },
    );
    expect(localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY)).toBeNull();
  });

  it('reopens onboarding when connect-domain is cancelled', async () => {
    service.open();
    afterClosed$.next({
      confirmed: true,
      openConnectDomain: true,
      connectDomainData: { domainGroupId: 'group-default' },
    });
    await flushDialogClosedHandler();

    connectAfterClosed$.next(undefined);
    await flushDialogClosedHandler();

    expect(onboardingOpenCount).toBe(2);
    expect(wizardOpen).toHaveBeenLastCalledWith(
      expect.any(Function),
      { campaignMode: false },
      0,
      { disableClose: false },
    );
    expect(localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY)).toBeNull();
  });

  it('marks dismissed and opens create-link flow when connect-domain requests openCreateLink', async () => {
    service.open();
    afterClosed$.next({
      confirmed: true,
      openConnectDomain: true,
      connectDomainData: { domainGroupId: 'group-default' },
    });
    await flushDialogClosedHandler();

    connectAfterClosed$.next({
      connected: true,
      domainGroupId: 'group-default',
      host: 'launch.localhost',
      openCreateLink: true,
    });
    await flushDialogClosedHandler();

    expect(localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(navigate).toHaveBeenCalledWith(['/links'], { queryParams: { openCreate: '1' } });
    expect(onboardingOpenCount).toBe(1);
  });

  it('respects DASHBOARD_ONBOARDING_SHOW_ALWAYS for shouldOpen eligibility', () => {
    if (!DASHBOARD_ONBOARDING_SHOW_ALWAYS) {
      localStorage.setItem(DASHBOARD_ONBOARDING_STORAGE_KEY, 'true');
      const createdAt = new Date(1_000_000 - 1_000).toISOString();

      expect(service.shouldOpen(createdAt)).toBe(false);
      return;
    }

    localStorage.setItem(DASHBOARD_ONBOARDING_STORAGE_KEY, 'true');
    expect(service.shouldOpen('invalid')).toBe(true);
  });

  describe('shouldDeferOnboarding', () => {
    it('defers when openCreate query intent is present', () => {
      expect(service.shouldDeferOnboarding('/links?openCreate=1')).toBe(true);
    });

    it('defers when openConnectDomain query intent is present', () => {
      expect(service.shouldDeferOnboarding('/links?openConnectDomain=1')).toBe(true);
    });

    it('does not defer on landing routes without dialog query intents in campaign mode', () => {
      isCampaign.mockReturnValue(true);

      expect(service.shouldDeferOnboarding('/overview')).toBe(false);
      expect(service.shouldDeferOnboarding('/home')).toBe(false);
    });

    it('does not defer on dashboard landing route in advanced mode', () => {
      isCampaign.mockReturnValue(false);

      expect(service.shouldDeferOnboarding('/dashboard')).toBe(false);
    });

    it('defers on non-landing routes without dialog query intents', () => {
      isCampaign.mockReturnValue(true);

      expect(service.shouldDeferOnboarding('/links')).toBe(true);
      expect(service.shouldDeferOnboarding('/settings')).toBe(true);
    });

    it('defers on overview in advanced mode', () => {
      isCampaign.mockReturnValue(false);

      expect(service.shouldDeferOnboarding('/overview')).toBe(true);
    });
  });
});

describe('dashboard onboarding defer helpers', () => {
  it('hasDashboardDialogQueryIntent detects known dialog query intents', () => {
    expect(hasDashboardDialogQueryIntent('/links?openCreate=1')).toBe(true);
    expect(hasDashboardDialogQueryIntent('/analytics?openConnectDomain=1')).toBe(true);
    expect(hasDashboardDialogQueryIntent('/links')).toBe(false);
    expect(hasDashboardDialogQueryIntent('/links?openCreate=0')).toBe(false);
  });

  it('isOnboardingLandingRoute resolves campaign and advanced landing paths', () => {
    expect(isOnboardingLandingRoute('/overview', true)).toBe(true);
    expect(isOnboardingLandingRoute('/home', true)).toBe(true);
    expect(isOnboardingLandingRoute('/dashboard', true)).toBe(false);
    expect(isOnboardingLandingRoute('/dashboard', false)).toBe(true);
    expect(isOnboardingLandingRoute('/overview', false)).toBe(false);
  });

  it('shouldDeferOnboardingForRoute prioritizes query intents over landing routes', () => {
    expect(shouldDeferOnboardingForRoute('/overview?openCreate=1', true)).toBe(true);
    expect(shouldDeferOnboardingForRoute('/dashboard?openConnectDomain=1', false)).toBe(true);
  });
});
