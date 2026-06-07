import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { DocsAssistantDrawerService } from '../../features/documentation/services/docs-assistant-drawer.service';
import { DEFAULT_SITE_CONFIG, SITE_CONFIG } from '../config/site-config';
import type { User } from '../models/user.model';
import { AuthStore } from '../store/auth.store';
import { DomainGroupStore } from '../store/domain-group.store';
import { DomainStore } from '../store/domain.store';
import { SubdomainStore } from '../store/subdomain.store';
import { DEFAULT_LIST_KEY } from '../store/entity/entity-store.utils';
import { AppShellComponent } from './app-shell.component';
import { DOMAIN_GROUPS_REQUIRED_MESSAGE } from '../domain-groups/domain-group.guard';
import { DashboardContextService } from './dashboard-context.service';
import { DashboardModeService } from './dashboard-mode.service';
import { DashboardOnboardingService } from '../../features/dashboard/services/dashboard-onboarding.service';

const DOMAINS_ROUTE = '/domains';

function findSidebarModeToggleButton(root: HTMLElement): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll<HTMLButtonElement>('mat-sidenav button[mat-stroked-button]')).find(
    (button) => button.textContent?.includes('Switch to'),
  );
}

function findMobileToolbarModeToggleButton(root: HTMLElement): HTMLButtonElement | undefined {
  return root.querySelector<HTMLButtonElement>('mat-sidenav-content button.app-mobile-mode-toggle') ?? undefined;
}

function findMobileNavToggleButton(root: HTMLElement): HTMLButtonElement | undefined {
  return root.querySelector<HTMLButtonElement>('mat-sidenav-content button[aria-label="Open menu"], mat-sidenav-content button[aria-label="Close menu"]') ?? undefined;
}

function findAdvancedNavState(component: AppShellComponent, route: string) {
  for (const section of component.advancedNavSectionsWithStates()) {
    const match = section.items.find((state) => state.item.route === route);
    if (match) {
      return match;
    }
  }

  return undefined;
}

const CONSENTED_USER = {
  termsAcceptedAt: '2024-01-01',
  privacyAcceptedAt: '2024-01-01',
  ageConfirmedAt: '2024-01-01',
  legalVersion: DEFAULT_SITE_CONFIG.legalVersion,
};

describe('AppShellComponent', () => {
  let fixture: ComponentFixture<AppShellComponent>;
  let component: AppShellComponent;
  let router: Router;
  let navigateByUrl: ReturnType<typeof vi.fn>;
  let reconcileAvailableGroups: ReturnType<typeof vi.fn>;
  let closeAssistantDrawer: ReturnType<typeof vi.fn>;
  let assistantDrawerOpen: ReturnType<typeof signal<boolean>>;
  let domainStoreSearchList: ReturnType<typeof vi.fn>;
  let domainGroupStoreSearchList: ReturnType<typeof vi.fn>;
  let subdomainStoreSearchList: ReturnType<typeof vi.fn>;
  let onboardingShouldOpen: ReturnType<typeof vi.fn>;
  let onboardingOpen: ReturnType<typeof vi.fn>;
  let onboardingShouldDefer: ReturnType<typeof vi.fn>;
  const domainGroupsList = signal<{ id: string }[]>([]);
  const listResult = signal<{ data: { id: string }[] } | null>({ data: [] });
  const isLoading = signal<Record<string, boolean>>({});
  const user = signal<User | null>(CONSENTED_USER as User);

  beforeEach(async () => {
    domainGroupsList.set([]);
    listResult.set({ data: [] });
    isLoading.set({});
    user.set(CONSENTED_USER as User);
    reconcileAvailableGroups = vi.fn();
    closeAssistantDrawer = vi.fn();
    assistantDrawerOpen = signal(false);
    domainStoreSearchList = vi.fn();
    domainGroupStoreSearchList = vi.fn();
    subdomainStoreSearchList = vi.fn();
    onboardingShouldOpen = vi.fn().mockReturnValue(false);
    onboardingOpen = vi.fn();
    onboardingShouldDefer = vi.fn().mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: SITE_CONFIG, useValue: DEFAULT_SITE_CONFIG },
        {
          provide: AuthStore,
          useValue: {
            user,
            isAuthenticated: signal(true),
            logout: vi.fn(),
          },
        },
        {
          provide: DomainStore,
          useValue: { searchList: domainStoreSearchList },
        },
        {
          provide: DomainGroupStore,
          useValue: {
            selectList: () => domainGroupsList,
            selectListResult: () => listResult,
            isLoading: () => isLoading(),
            searchList: domainGroupStoreSearchList,
          },
        },
        {
          provide: SubdomainStore,
          useValue: { searchList: subdomainStoreSearchList },
        },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: vi.fn().mockReturnValue(of({ matches: false, breakpoints: {} })),
            isMatched: vi.fn().mockReturnValue(false),
          },
        },
        {
          provide: DocsAssistantDrawerService,
          useValue: {
            open: assistantDrawerOpen,
            contentMounted: signal(false),
            forceClose: vi.fn(),
            closeDrawer: closeAssistantDrawer,
          },
        },
        DashboardModeService,
        {
          provide: DashboardContextService,
          useValue: {
            reconcileAvailableGroups,
          },
        },
        {
          provide: DashboardOnboardingService,
          useValue: {
            shouldOpen: onboardingShouldOpen,
            shouldDeferOnboarding: onboardingShouldDefer,
            open: onboardingOpen,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShellComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  describe('bootstrap data loading', () => {
    it('loads domain groups, domains, and subdomains when authenticated with consent', () => {
      fixture.detectChanges();

      expect(domainGroupStoreSearchList).toHaveBeenCalledTimes(1);
      expect(domainStoreSearchList).toHaveBeenCalledTimes(1);
      expect(subdomainStoreSearchList).toHaveBeenCalledTimes(1);
    });

    it('does not load bootstrap lists when legal consent is required', () => {
      user.set({
        id: 'user-1',
        email: 'test@example.com',
        organizationId: 'org-1',
        isOwner: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      fixture.detectChanges();

      expect(domainGroupStoreSearchList).not.toHaveBeenCalled();
      expect(domainStoreSearchList).not.toHaveBeenCalled();
      expect(subdomainStoreSearchList).not.toHaveBeenCalled();
    });
  });

  describe('domain group reconciliation', () => {
    it('reconciles dashboard context when domain groups finish loading', () => {
      const groups = [{ id: 'group-a' }, { id: 'group-b' }];
      domainGroupsList.set(groups);
      listResult.set({ data: groups });
      isLoading.set({ [DEFAULT_LIST_KEY]: false });

      fixture.detectChanges();

      expect(reconcileAvailableGroups).toHaveBeenCalledWith(groups, {
        allowEmptySelection: true,
      });
    });

    it('reconciles with allowEmptySelection false in advanced mode on non-links routes', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('advanced');

      const groups = [{ id: 'group-a' }, { id: 'group-b' }];
      domainGroupsList.set(groups);
      listResult.set({ data: groups });
      isLoading.set({ [DEFAULT_LIST_KEY]: false });

      fixture.detectChanges();

      expect(reconcileAvailableGroups).toHaveBeenCalledWith(groups, {
        allowEmptySelection: false,
      });
    });

    it('reconciles with allowEmptySelection true on /links in advanced mode', () => {
      fixture.destroy();
      vi.spyOn(router, 'url', 'get').mockReturnValue('/links');
      fixture = TestBed.createComponent(AppShellComponent);
      component = fixture.componentInstance;

      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('advanced');

      const groups = [{ id: 'group-a' }, { id: 'group-b' }];
      domainGroupsList.set(groups);
      listResult.set({ data: groups });
      isLoading.set({ [DEFAULT_LIST_KEY]: false });

      fixture.detectChanges();

      expect(reconcileAvailableGroups).toHaveBeenCalledWith(groups, {
        allowEmptySelection: true,
      });
    });

    it('does not reconcile while domain groups are still loading', () => {
      domainGroupsList.set([{ id: 'group-a' }]);
      listResult.set(null);
      isLoading.set({ [DEFAULT_LIST_KEY]: true });

      fixture.detectChanges();

      expect(reconcileAvailableGroups).not.toHaveBeenCalled();
    });
  });

  describe('sidebar nav links', () => {
    it('renders domain-gated nav items as disabled while domain groups are loading', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('advanced');
      listResult.set(null);
      isLoading.set({ [DEFAULT_LIST_KEY]: true });
      fixture.detectChanges();

      const disabledButtons = Array.from<HTMLButtonElement>(
        fixture.nativeElement.querySelectorAll('mat-sidenav button.mat-mdc-list-item[disabled]'),
      );
      const domainsButton = disabledButtons.find((button) =>
        button.textContent?.includes('Domains'),
      );

      expect(domainsButton).toBeTruthy();
      expect(domainsButton?.disabled).toBe(true);
      expect(
        domainsButton?.querySelector('.sr-only')?.textContent?.trim(),
      ).toBe('Loading sites…');
    });

    it('renders domain-gated nav items as native disabled buttons with screen-reader reason', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('advanced');
      fixture.detectChanges();

      const disabledButtons = Array.from<HTMLButtonElement>(
        fixture.nativeElement.querySelectorAll('mat-sidenav button.mat-mdc-list-item[disabled]'),
      );
      const domainsButton = disabledButtons.find((button) =>
        button.textContent?.includes('Domains'),
      );

      expect(domainsButton).toBeTruthy();
      expect(domainsButton?.disabled).toBe(true);
      expect(
        domainsButton?.querySelector('.sr-only')?.textContent?.trim(),
      ).toBe(DOMAIN_GROUPS_REQUIRED_MESSAGE);
    });

    it('marks enabled nav links as interactive Material list items', () => {
      fixture.detectChanges();

      const links = fixture.nativeElement.querySelectorAll(
        'mat-sidenav a.mat-mdc-list-item',
      ) as NodeListOf<HTMLElement>;

      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(link.classList.contains('mat-mdc-list-item-interactive')).toBe(true);
      }
    });
  });

  describe('mobile nav toggle', () => {
    it('exposes aria-expanded and toggles aria-label with mobile nav state', () => {
      fixture.detectChanges();

      const toggle = findMobileNavToggleButton(fixture.nativeElement);

      expect(toggle).toBeTruthy();
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
      expect(toggle?.getAttribute('aria-label')).toBe('Open menu');

      component.toggleMobileNav();
      fixture.detectChanges();

      const openToggle = findMobileNavToggleButton(fixture.nativeElement);

      expect(openToggle?.getAttribute('aria-expanded')).toBe('true');
      expect(openToggle?.getAttribute('aria-label')).toBe('Close menu');
    });

    it('closes mobile nav on escape when the assistant drawer is closed', () => {
      component.isMobile.set(true);
      component.mobileNavOpen.set(true);

      component.onEscapeKey();

      expect(component.mobileNavOpen()).toBe(false);
    });

    it('closes the assistant drawer on escape before closing mobile nav', () => {
      assistantDrawerOpen.set(true);
      component.isMobile.set(true);
      component.mobileNavOpen.set(true);

      component.onEscapeKey();

      expect(closeAssistantDrawer).toHaveBeenCalled();
      expect(component.mobileNavOpen()).toBe(true);
    });
  });

  describe('mobile mode toggle', () => {
    beforeEach(() => {
      component.isMobile.set(true);
    });

    it('renders a tappable mode chip in the mobile toolbar', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('campaign');
      fixture.detectChanges();

      const toggle = findMobileToolbarModeToggleButton(fixture.nativeElement);

      expect(toggle?.textContent?.trim()).toBe('Campaign');
      expect(toggle?.getAttribute('aria-label')).toBe(
        'Campaign view active. Switch to advanced view.',
      );
      expect(toggle?.getAttribute('aria-pressed')).toBe('false');

      dashboardMode.setMode('advanced');
      fixture.detectChanges();

      const advancedToggle = findMobileToolbarModeToggleButton(fixture.nativeElement);

      expect(advancedToggle?.textContent?.trim()).toBe('Advanced');
      expect(advancedToggle?.getAttribute('aria-label')).toBe(
        'Advanced view active. Switch to campaign view.',
      );
      expect(advancedToggle?.getAttribute('aria-pressed')).toBe('true');
    });

    it('hides the sidebar mode toggle on mobile', () => {
      fixture.detectChanges();

      expect(findSidebarModeToggleButton(fixture.nativeElement)).toBeUndefined();
      expect(findMobileToolbarModeToggleButton(fixture.nativeElement)).toBeTruthy();
    });

    it('closes mobile nav when switching mode from the toolbar chip', () => {
      component.mobileNavOpen.set(true);
      fixture.detectChanges();

      findMobileToolbarModeToggleButton(fixture.nativeElement)?.click();

      expect(component.mobileNavOpen()).toBe(false);
    });
  });

  describe('campaignNavStates', () => {
    it('disables all campaign nav items when legal consent is required', () => {
      user.set({
        id: 'user-1',
        email: 'test@example.com',
        organizationId: 'org-1',
        isOwner: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      const states = component.campaignNavStates();

      expect(states.length).toBeGreaterThan(0);
      for (const state of states) {
        expect(state.disabled).toBe(true);
        expect(state.tooltip).toBe('Accept updated terms to continue.');
      }
    });

    it('enables campaign nav items when consent is granted and sites are unavailable', () => {
      listResult.set({ data: [] });
      isLoading.set({ [DEFAULT_LIST_KEY]: false });

      const states = component.campaignNavStates();

      expect(states.every((state) => !state.disabled)).toBe(true);
      expect(states.every((state) => state.tooltip === '')).toBe(true);
    });
  });

  describe('advancedNavSectionsWithStates', () => {
    it('disables domain-gated nav items while domain groups are loading', () => {
      listResult.set(null);
      isLoading.set({ [DEFAULT_LIST_KEY]: true });

      const domainsState = findAdvancedNavState(component, DOMAINS_ROUTE);

      expect(domainsState?.disabled).toBe(true);
      expect(domainsState?.tooltip).toBe('Loading sites…');
    });

    it('disables domain-gated nav items when loaded with no sites', () => {
      listResult.set({ data: [] });
      isLoading.set({ [DEFAULT_LIST_KEY]: false });

      const domainsState = findAdvancedNavState(component, DOMAINS_ROUTE);

      expect(domainsState?.disabled).toBe(true);
      expect(domainsState?.tooltip).toBe(DOMAIN_GROUPS_REQUIRED_MESSAGE);
    });

    it('enables domain-gated nav items when sites are available', () => {
      domainGroupsList.set([{ id: 'group-1' }]);
      listResult.set({ data: [{ id: 'group-1' }] });
      isLoading.set({ [DEFAULT_LIST_KEY]: false });

      const domainsState = findAdvancedNavState(component, DOMAINS_ROUTE);

      expect(domainsState?.disabled).toBe(false);
      expect(domainsState?.tooltip).toBe('');
    });

    it('disables domain-gated nav items with legal consent copy when consent is required', () => {
      user.set({
        id: 'user-1',
        email: 'test@example.com',
        organizationId: 'org-1',
        isOwner: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      const domainsState = findAdvancedNavState(component, DOMAINS_ROUTE);

      expect(domainsState?.disabled).toBe(true);
      expect(domainsState?.tooltip).toBe('Accept updated terms to continue.');
    });
  });

  describe('dashboard page heading', () => {
    it('renders a visually hidden h1 that reflects the current dashboard mode', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('campaign');
      fixture.detectChanges();

      const heading = fixture.nativeElement.querySelector(
        'mat-sidenav-content h1.sr-only',
      ) as HTMLHeadingElement;

      expect(heading?.textContent?.trim()).toBe('Campaign view');

      dashboardMode.setMode('advanced');
      fixture.detectChanges();

      expect(heading?.textContent?.trim()).toBe('Advanced view');
    });
  });

  describe('main navigation landmark', () => {
    it('wraps sidebar nav lists in a nav landmark', () => {
      fixture.detectChanges();

      const nav = fixture.nativeElement.querySelector(
        'mat-sidenav nav[aria-label="Main navigation"]',
      ) as HTMLElement;

      expect(nav).toBeTruthy();
      expect(nav.querySelector('mat-nav-list')).toBeTruthy();
    });
  });

  describe('dashboard mode badge', () => {
    it('shows Campaign label in campaign mode', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('campaign');

      expect(component.currentModeLabel()).toBe('Campaign');
    });

    it('shows Advanced label in advanced mode', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('advanced');

      expect(component.currentModeLabel()).toBe('Advanced');
    });

    it('sets aria-pressed on mode toggle when advanced', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('advanced');
      fixture.detectChanges();

      const modeToggle = findSidebarModeToggleButton(fixture.nativeElement);

      expect(modeToggle?.getAttribute('aria-pressed')).toBe('true');
    });

    it('clears aria-pressed on mode toggle in campaign mode', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('campaign');
      fixture.detectChanges();

      const modeToggle = findSidebarModeToggleButton(fixture.nativeElement);

      expect(modeToggle?.getAttribute('aria-pressed')).toBe('false');
    });

    it('describes current mode and action in mode toggle aria-label', () => {
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('campaign');
      fixture.detectChanges();

      const modeToggle = findSidebarModeToggleButton(fixture.nativeElement);

      expect(modeToggle?.getAttribute('aria-label')).toBe(
        'Campaign view active. Switch to advanced view.',
      );

      dashboardMode.setMode('advanced');
      fixture.detectChanges();

      const advancedToggle = findSidebarModeToggleButton(fixture.nativeElement);

      expect(advancedToggle?.getAttribute('aria-label')).toBe(
        'Advanced view active. Switch to campaign view.',
      );
    });
  });

  describe('switchDashboardMode', () => {
    it('stays on shared routes when toggling mode', () => {
      vi.spyOn(router, 'url', 'get').mockReturnValue('/tools/qr-code-generator');
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('campaign');

      component.switchDashboardMode();

      expect(dashboardMode.isAdvanced()).toBe(true);
      expect(navigateByUrl).toHaveBeenCalledWith('/tools/qr-code-generator');
    });

    it('maps overview to dashboard when switching to advanced', () => {
      vi.spyOn(router, 'url', 'get').mockReturnValue('/overview');
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('campaign');

      component.switchDashboardMode();

      expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('maps redirect-rules-analytics to analytics when switching to campaign', () => {
      vi.spyOn(router, 'url', 'get').mockReturnValue('/redirect-rules-analytics?workspace=g');
      const dashboardMode = TestBed.inject(DashboardModeService);
      dashboardMode.setMode('advanced');

      component.switchDashboardMode();

      expect(navigateByUrl).toHaveBeenCalledWith('/analytics?workspace=g');
    });

    it('does not navigate when legal consent is required', () => {
      user.set({
        id: 'user-1',
        email: 'test@example.com',
        organizationId: 'org-1',
        isOwner: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });
      vi.spyOn(router, 'url', 'get').mockReturnValue('/links');

      component.switchDashboardMode();

      expect(navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('onboarding auto-open', () => {
    const recentUser = {
      ...CONSENTED_USER,
      id: 'user-1',
      email: 'test@example.com',
      organizationId: 'org-1',
      isOwner: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    function createShellAtUrl(url: string): void {
      fixture.destroy();
      vi.spyOn(router, 'url', 'get').mockReturnValue(url);
      fixture = TestBed.createComponent(AppShellComponent);
      component = fixture.componentInstance;
      user.set(recentUser as User);
      onboardingShouldOpen.mockReturnValue(true);
      onboardingShouldDefer.mockReturnValue(false);
    }

    it('opens onboarding for eligible users on landing routes', () => {
      createShellAtUrl('/overview');

      fixture.detectChanges();

      expect(onboardingOpen).toHaveBeenCalledTimes(1);
    });

    it('skips onboarding when shouldDeferOnboarding returns true', () => {
      createShellAtUrl('/links?openCreate=1');
      onboardingShouldDefer.mockReturnValue(true);

      fixture.detectChanges();

      expect(onboardingShouldDefer).toHaveBeenCalledWith('/links?openCreate=1');
      expect(onboardingOpen).not.toHaveBeenCalled();
    });

    it('does not open onboarding when user is outside the onboarding window', () => {
      createShellAtUrl('/overview');
      onboardingShouldOpen.mockReturnValue(false);

      fixture.detectChanges();

      expect(onboardingOpen).not.toHaveBeenCalled();
    });
  });
});
