import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { OrganizationPlan } from '@shared/models/organization-config.model';
import { DEFAULT_PLAN_LIMITS } from '@shared/models/plan-limits.model';
import { Subject, of } from 'rxjs';
import { BillingApiService } from '../../core/api/billing-api.service';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { DashboardContextService } from '../../core/layout/dashboard-context.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import type { DomainGroup } from '../../core/models/domain-group.model';
import type { OrganizationUsage } from '../../core/models/organization-usage.model';
import { AuthStore } from '../../core/store/auth.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { CampaignConnectDomainService } from '../campaign-connect-domain/campaign-connect-domain.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CampaignSettingsPageComponent } from './campaign-settings-page.component';

const baseUsage: OrganizationUsage = {
  domainGroups: 1,
  domains: 1,
  subdomains: 0,
  rules: 5,
  tests: 0,
  users: 1,
  apiKeys: 0,
  linkMaps: 1,
  linkMapEntries: 10,
};

const sampleDomainGroup: DomainGroup = {
  id: 'group-1',
  name: 'Launch site',
  organizationId: 'org-1',
  robotsPolicy: 'NONE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('CampaignSettingsPageComponent', () => {
  let fixture: ComponentFixture<CampaignSettingsPageComponent>;
  let component: CampaignSettingsPageComponent;
  let dashboardModeService: DashboardModeService;
  const usageSignal = signal<OrganizationUsage | null>(baseUsage);
  const domainGroupsSignal = signal<DomainGroup[]>([sampleDomainGroup]);
  const subdomainsSignal = signal<{ id: string; name: string; domainGroupId: string }[]>([]);
  const domainsSignal = signal<{ id: string; name: string; domainGroupId: string }[]>([
    { id: 'domain-1', name: 'go.example.com', domainGroupId: 'group-1' },
  ]);
  const fragmentSubject = new Subject<string | null>();
  const openConnectDomainDialog = vi.fn(() => ({
    afterClosed: () => new Subject<undefined>(),
  }));
  const dialogOpen = vi.fn();
  const getCustomerPortal = vi.fn();
  const organizationSignal = signal<{
    configuration: {
      activeSubscription: {
        plan: OrganizationPlan;
        planName: string | null;
        status: string;
        limits: typeof DEFAULT_PLAN_LIMITS;
      };
    };
  }>({
    configuration: {
      activeSubscription: {
        plan: OrganizationPlan.PRO,
        planName: 'Pro Annual',
        status: 'ACTIVE',
        limits: DEFAULT_PLAN_LIMITS,
      },
    },
  });

  beforeEach(async () => {
    usageSignal.set(baseUsage);
    domainGroupsSignal.set([sampleDomainGroup]);
    subdomainsSignal.set([]);
    domainsSignal.set([
      { id: 'domain-1', name: 'go.example.com', domainGroupId: 'group-1' },
    ]);
    openConnectDomainDialog.mockClear();
    dialogOpen.mockClear();
    getCustomerPortal.mockClear();
    fragmentSubject.next(null);
    organizationSignal.set({
      configuration: {
        activeSubscription: {
          plan: OrganizationPlan.PRO,
          planName: 'Pro Annual',
          status: 'ACTIVE',
          limits: DEFAULT_PLAN_LIMITS,
        },
      },
    });

    await TestBed.configureTestingModule({
      imports: [CampaignSettingsPageComponent],
      providers: [
        provideRouter([]),
        DashboardModeService,
        {
          provide: AuthStore,
          useValue: {
            user: () => ({ email: 'user@example.com' }),
            organization: () => organizationSignal(),
          },
        },
        {
          provide: OrganizationUsageStore,
          useValue: {
            usage: () => usageSignal(),
            isLoading: () => false,
            error: () => null,
            loadUsage: vi.fn(),
          },
        },
        {
          provide: BillingApiService,
          useValue: { getCustomerPortal },
        },
        {
          provide: MatDialog,
          useValue: { open: dialogOpen },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        {
          provide: APP_CONFIG,
          useValue: {
            APP_BASE_URL: 'https://linkshift.app',
            APP_SUBDOMAIN_BASE_URL: 'https://ls.linkshift.app',
          },
        },
        {
          provide: DomainGroupStore,
          useValue: {
            selectList: () => domainGroupsSignal,
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: SubdomainStore,
          useValue: {
            selectList: () => subdomainsSignal,
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: DomainStore,
          useValue: {
            selectList: () => domainsSignal,
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        DashboardContextService,
        {
          provide: CampaignConnectDomainService,
          useValue: { openDialog: openConnectDomainDialog },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { fragment: null },
            fragment: fragmentSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    dashboardModeService = TestBed.inject(DashboardModeService);
    dashboardModeService.setMode('campaign');
    fixture = TestBed.createComponent(CampaignSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('maps primary tile usage and limits from store data', () => {
    const views = component.primaryTileViews();

    expect(views.map((view) => view.tile.label)).toEqual([
      'Short link hosts',
      'Active links',
      'Team seats',
    ]);
    expect(views[0]).toMatchObject({
      usage: baseUsage.domains,
      limit: DEFAULT_PLAN_LIMITS.maxTotalDomains,
      limitReached: true,
    });
    expect(views[1]).toMatchObject({
      usage: baseUsage.linkMapEntries,
      limit: DEFAULT_PLAN_LIMITS.maxLinkMapEntriesTotal,
      limitReached: false,
    });
    expect(views[2]).toMatchObject({
      usage: baseUsage.users,
      limit: DEFAULT_PLAN_LIMITS.maxUsers,
      limitReached: true,
    });
  });

  it('detects when a primary tile limit is reached', () => {
    usageSignal.set({
      ...baseUsage,
      linkMapEntries: DEFAULT_PLAN_LIMITS.maxLinkMapEntriesTotal,
    });
    fixture.detectChanges();

    const activeLinksView = component
      .primaryTileViews()
      .find((view) => view.tile.id === 'linkMapEntries');

    expect(activeLinksView).toMatchObject({
      usage: DEFAULT_PLAN_LIMITS.maxLinkMapEntriesTotal,
      limit: DEFAULT_PLAN_LIMITS.maxLinkMapEntriesTotal,
      limitReached: true,
    });
  });

  it('maps technical tile views and detects reached limits', () => {
    usageSignal.set({
      ...baseUsage,
      rules: DEFAULT_PLAN_LIMITS.maxTotalRules,
      linkMaps: 0,
    });
    fixture.detectChanges();

    const views = component.technicalTileViews();

    expect(views.map((view) => view.tile.label)).toEqual(['Redirect rules', 'Link maps']);
    expect(views[0]).toMatchObject({
      usage: DEFAULT_PLAN_LIMITS.maxTotalRules,
      limit: DEFAULT_PLAN_LIMITS.maxTotalRules,
      limitReached: true,
    });
    expect(views[1]?.limitReached).toBe(false);
  });

  it('formats subscription plan label from active subscription', () => {
    expect(component.subscriptionPlanLabel()).toBe('Pro Annual');

    organizationSignal.set({
      configuration: {
        activeSubscription: {
          plan: OrganizationPlan.BASIC,
          planName: null,
          status: 'ACTIVE',
          limits: DEFAULT_PLAN_LIMITS,
        },
      },
    });
    fixture.detectChanges();

    expect(component.subscriptionPlanLabel()).toBe('Basic');
  });

  it('groups connected hosts by site', () => {
    expect(component.hostsByDomainGroupId()['group-1']).toEqual([
      expect.objectContaining({
        host: 'go.example.com',
        label: 'go.example.com (custom domain)',
      }),
    ]);
  });

  it('opens connect domain dialog from settings hosts section', () => {
    component.openConnectDomainDialog();

    expect(openConnectDomainDialog).toHaveBeenCalledWith({
      domainGroups: [sampleDomainGroup],
    });
  });

  it('scrolls hosts section into view when URL fragment is hosts', async () => {
    const scrollIntoView = vi.fn();
    const hostsElement = document.createElement('section');
    hostsElement.id = 'hosts';
    hostsElement.scrollIntoView = scrollIntoView;
    vi.spyOn(document, 'getElementById').mockReturnValue(hostsElement);

    fragmentSubject.next('hosts');
    await new Promise<void>((resolve) => queueMicrotask(resolve));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  function findBillingButton(label: string): HTMLButtonElement | undefined {
    const root = fixture.nativeElement as HTMLElement;
    return Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === label,
    );
  }

  it('shows cancel subscription for paid non-free plans', () => {
    expect(findBillingButton('Cancel subscription')).toBeTruthy();
    expect(findBillingButton('Manage subscription')).toBeTruthy();
  });

  it('hides cancel subscription for free plans', () => {
    organizationSignal.set({
      configuration: {
        activeSubscription: {
          plan: OrganizationPlan.FREE,
          planName: null,
          status: 'ACTIVE',
          limits: DEFAULT_PLAN_LIMITS,
        },
      },
    });
    fixture.detectChanges();

    expect(findBillingButton('Cancel subscription')).toBeUndefined();
    expect(findBillingButton('Manage subscription')).toBeUndefined();
    expect(findBillingButton('Upgrade')).toBeTruthy();
  });

  it('opens customer portal after cancel subscription is confirmed', async () => {
    const openCustomerPortal = vi
      .spyOn(component as unknown as { openCustomerPortal: () => Promise<void> }, 'openCustomerPortal')
      .mockResolvedValue(undefined);
    vi.spyOn(component['dialog'], 'open').mockReturnValue({
      afterClosed: () => of(true),
    } as ReturnType<MatDialog['open']>);

    await component.openCancelSubscription();

    expect(component['dialog'].open).toHaveBeenCalledWith(
      ConfirmDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Cancel subscription',
          confirmLabel: 'Continue',
          cancelLabel: 'Back',
        }),
      }),
    );
    expect(openCustomerPortal).toHaveBeenCalledTimes(1);
  });

  it('does not open customer portal when cancel subscription is dismissed', async () => {
    const openCustomerPortal = vi
      .spyOn(component as unknown as { openCustomerPortal: () => Promise<void> }, 'openCustomerPortal')
      .mockResolvedValue(undefined);
    vi.spyOn(component['dialog'], 'open').mockReturnValue({
      afterClosed: () => of(false),
    } as ReturnType<MatDialog['open']>);

    await component.openCancelSubscription();

    expect(component['dialog'].open).toHaveBeenCalledTimes(1);
    expect(openCustomerPortal).not.toHaveBeenCalled();
  });

  function findRouterLink(href: string): HTMLAnchorElement | undefined {
    const root = fixture.nativeElement as HTMLElement;
    return Array.from(root.querySelectorAll<HTMLAnchorElement>('a[routerlink]')).find(
      (link) => link.getAttribute('href') === href,
    );
  }

  it('shows advanced cross-links when not in campaign mode', () => {
    dashboardModeService.setMode('advanced');
    fixture.detectChanges();

    expect(findRouterLink('/dashboard')).toBeTruthy();
    expect(findRouterLink('/domain-groups')).toBeTruthy();
    expect(findRouterLink('/redirect-rules')).toBeTruthy();
  });

  it('hides advanced cross-links in campaign mode', () => {
    dashboardModeService.setMode('campaign');
    fixture.detectChanges();

    expect(findRouterLink('/dashboard')).toBeUndefined();
    expect(findRouterLink('/domain-groups')).toBeUndefined();
    expect(findRouterLink('/redirect-rules')).toBeUndefined();
  });
});
