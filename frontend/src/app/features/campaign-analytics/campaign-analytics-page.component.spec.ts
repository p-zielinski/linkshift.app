import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { DashboardContextService } from '../../core/layout/dashboard-context.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { DashboardPageWorkspaceRegistry } from '../../core/layout/dashboard-page-workspace.registry';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { AuthStore } from '../../core/store/auth.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { RedirectRulesAnalyticsStore } from '../../core/store/redirect-rules-analytics.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import type { DomainGroup } from '../../core/models/domain-group.model';
import { CampaignConnectDomainService } from '../campaign-connect-domain/campaign-connect-domain.service';
import { CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY } from '../campaign-connect-domain/campaign-connect-domain.util';
import { DashboardDialogQueueService } from '../dashboard/services/dashboard-dialog-queue.service';
import { CampaignAnalyticsPageComponent } from './campaign-analytics-page.component';

const domainGroupA: DomainGroup = {
  id: 'group-a',
  name: 'Site A',
  organizationId: 'org-1',
  robotsPolicy: 'NONE',
  redirectDeliveryMode: 'INSTANT',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const domainGroupB: DomainGroup = {
  id: 'group-b',
  name: 'Site B',
  organizationId: 'org-1',
  robotsPolicy: 'NONE',
  redirectDeliveryMode: 'INSTANT',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('CampaignAnalyticsPageComponent', () => {
  let fixture: ComponentFixture<CampaignAnalyticsPageComponent>;
  let component: CampaignAnalyticsPageComponent;
  let dashboardModeService: DashboardModeService;
  let dialogQueue: DashboardDialogQueueService;
  let pageWorkspaceRegistry: DashboardPageWorkspaceRegistry;
  let domainGroupsSignal: ReturnType<typeof signal<DomainGroup[]>>;
  let domainGroupFilterBind: ReturnType<typeof vi.fn>;
  let searchAnalytics: ReturnType<typeof vi.fn>;
  let routerNavigate: ReturnType<typeof vi.fn>;
  let openConnectDomainDialog: ReturnType<typeof vi.spyOn>;
  let runWhenIdle: ReturnType<typeof vi.spyOn>;
  let activatedRoute: ActivatedRoute;

  async function configureTestingModule(queryParams: Record<string, string> = {}): Promise<void> {
    domainGroupsSignal = signal<DomainGroup[]>([]);
    domainGroupFilterBind = vi.fn();
    searchAnalytics = vi.fn();
    routerNavigate = vi.fn().mockResolvedValue(true);
    activatedRoute = {
      queryParamMap: new BehaviorSubject(convertToParamMap(queryParams)).asObservable(),
    } as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [CampaignAnalyticsPageComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: { navigate: routerNavigate } },
        DashboardModeService,
        DashboardContextService,
        DashboardDialogQueueService,
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => true,
            organization: () => ({
              configuration: JSON.stringify({
                activeSubscription: { limits: { analyticsRetentionDays: 30 } },
              }),
            }),
          },
        },
        {
          provide: DomainGroupStore,
          useValue: {
            selectList: () => domainGroupsSignal,
            searchList: vi.fn(),
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
          provide: SubdomainStore,
          useValue: {
            selectList: () => signal([]),
            searchList: vi.fn(),
          },
        },
        {
          provide: RedirectRulesAnalyticsStore,
          useValue: {
            results: () => ({}),
            isLoading: () => ({}),
            errors: () => ({}),
            searchAnalytics,
          },
        },
        {
          provide: DomainGroupFilterPersistenceService,
          useValue: { bind: domainGroupFilterBind },
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
          provide: CampaignConnectDomainService,
          useValue: { openDialog: vi.fn() },
        },
        {
          provide: APP_CONFIG,
          useValue: {
            APP_SUBDOMAIN_BASE_URL: 'https://go.linkshift.app',
            APP_BASE_URL: 'https://app.linkshift.app',
          },
        },
      ],
    }).compileComponents();

    dashboardModeService = TestBed.inject(DashboardModeService);
    dialogQueue = TestBed.inject(DashboardDialogQueueService);
    pageWorkspaceRegistry = TestBed.inject(DashboardPageWorkspaceRegistry);
    openConnectDomainDialog = vi.spyOn(
      CampaignAnalyticsPageComponent.prototype,
      'openConnectDomainDialog',
    );
    runWhenIdle = vi.spyOn(dialogQueue, 'runWhenIdle');
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(CampaignAnalyticsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await configureTestingModule({ [CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY]: '1' });
    dashboardModeService.setMode('advanced');
  });

  it('does not open connect-domain dialog from query param in advanced mode', () => {
    createComponent();

    expect(openConnectDomainDialog).not.toHaveBeenCalled();
    expect(runWhenIdle).not.toHaveBeenCalled();
    expect(routerNavigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        relativeTo: activatedRoute,
        queryParams: { [CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY]: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );
  });

  describe('workspace filter (UX-214)', () => {
    beforeEach(async () => {
      TestBed.resetTestingModule();
      await configureTestingModule();
      dashboardModeService.setMode('campaign');
    });

    it('allows all-sites selection when multiple domain groups exist', () => {
      domainGroupsSignal.set([domainGroupA, domainGroupB]);
      createComponent();

      expect(component.allowAllSitesSelection()).toBe(true);
      expect(component.showPageLevelWorkspaceFilter()).toBe(true);
      expect(pageWorkspaceRegistry.binding()?.allowAllSites()).toBe(true);
    });

    it('does not allow all-sites selection with a single domain group', () => {
      domainGroupsSignal.set([domainGroupA]);
      createComponent();

      expect(component.allowAllSitesSelection()).toBe(false);
      expect(component.showPageLevelWorkspaceFilter()).toBe(false);
      expect(pageWorkspaceRegistry.binding()?.allowAllSites()).toBe(false);
    });

    it('loads org-wide analytics when no site is selected', () => {
      domainGroupsSignal.set([domainGroupA, domainGroupB]);
      createComponent();

      component.filterModel.set({ domainGroupId: '' });
      searchAnalytics.mockClear();
      component.setQuickRange(7);

      expect(searchAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String),
          limit: 50,
        }),
      );
      const query = searchAnalytics.mock.calls.at(-1)?.[0];
      expect(query).not.toHaveProperty('domainGroupId');
    });
  });
});
