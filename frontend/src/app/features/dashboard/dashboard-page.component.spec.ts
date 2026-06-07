import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { OrganizationPlan } from '@shared/models/organization-config.model';
import { DEFAULT_PLAN_LIMITS } from '@shared/models/plan-limits.model';
import { BillingApiService } from '../../core/api/billing-api.service';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import type { OrganizationUsage } from '../../core/models/organization-usage.model';
import { AuthStore } from '../../core/store/auth.store';
import { DomainStore } from '../../core/store/domain.store';
import { OrganizationMembersStore } from '../../core/store/organization-members.store';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { DashboardPageComponent } from './dashboard-page.component';

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

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let component: DashboardPageComponent;
  const usageSignal = signal<OrganizationUsage | null>(baseUsage);
  const userSignal = signal({ email: 'user@example.com', id: 'user-1', isOwner: true });
  const organizationSignal = signal<{
    id: string;
    configuration: {
      activeSubscription: {
        plan: OrganizationPlan;
        planName: string | null;
        status: string;
        limits: typeof DEFAULT_PLAN_LIMITS;
      };
    };
  }>({
    id: 'org-1',
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
    userSignal.set({ email: 'user@example.com', id: 'user-1', isOwner: true });
    organizationSignal.set({
      id: 'org-1',
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
      imports: [DashboardPageComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        DashboardModeService,
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => false,
            user: () => userSignal(),
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
          provide: DomainStore,
          useValue: {
            selectList: () => signal([]),
            searchList: vi.fn(),
          },
        },
        {
          provide: OrganizationMembersStore,
          useValue: {
            members: () => [],
            loadMembers: vi.fn(),
          },
        },
        {
          provide: APP_CONFIG,
          useValue: {
            APP_SUBDOMAIN_BASE_URL: 'https://go.linkshift.app',
            APP_BASE_URL: 'https://app.linkshift.app',
          },
        },
        {
          provide: BillingApiService,
          useValue: { getCustomerPortal: vi.fn() },
        },
        {
          provide: MatDialog,
          useValue: { open: vi.fn() },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        {
          provide: Clipboard,
          useValue: { copy: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('formats subscription plan label from active subscription', () => {
    expect(component.subscriptionPlanLabel()).toBe('Pro Annual');

    organizationSignal.set({
      id: 'org-1',
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

  it('schedules overflow check only when user or organization id changes', () => {
    const scheduleSpy = vi.spyOn(
      component as unknown as { scheduleOverflowCheck: () => void },
      'scheduleOverflowCheck',
    );
    scheduleSpy.mockClear();

    userSignal.set({ ...userSignal(), email: 'updated@example.com' });
    TestBed.flushEffects();
    expect(scheduleSpy).not.toHaveBeenCalled();

    organizationSignal.set({
      ...organizationSignal(),
      configuration: {
        activeSubscription: {
          plan: OrganizationPlan.BASIC,
          planName: 'Basic Monthly',
          status: 'ACTIVE',
          limits: DEFAULT_PLAN_LIMITS,
        },
      },
    });
    TestBed.flushEffects();
    expect(scheduleSpy).not.toHaveBeenCalled();

    userSignal.set({ ...userSignal(), id: 'user-2' });
    TestBed.flushEffects();
    expect(scheduleSpy).toHaveBeenCalledTimes(1);

    scheduleSpy.mockClear();

    organizationSignal.set({ ...organizationSignal(), id: 'org-2' });
    TestBed.flushEffects();
    expect(scheduleSpy).toHaveBeenCalledTimes(1);
  });

  it('links to settings for plan and account management', () => {
    const root = fixture.nativeElement as HTMLElement;
    const settingsLink = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[routerlink]')).find(
      (link) => link.getAttribute('href') === '/settings',
    );

    expect(settingsLink).toBeTruthy();
    expect(settingsLink?.textContent?.trim()).toBe('Open settings');
  });
});
