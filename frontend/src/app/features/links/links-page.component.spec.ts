import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { AuthStore } from '../../core/store/auth.store';
import { DashboardContextService } from '../../core/layout/dashboard-context.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import { LinksListStore } from '../../core/store/links-list.store';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { organizationHasConnectedHosts } from '../../shared/components/setup-checklist/setup-checklist.auto-complete.util';
import { resolveLinksEditDialogTarget } from './links-edit-dialog.util';
import {
  buildLinksListBaseFilter,
  resolveLinksListStartAfterId,
  resolveLinksOpenCreateQueryAction,
  resolveLinksWaitingForDomainGroups,
} from './links-page-scope.util';
import { LinksPageComponent } from './links-page.component';
import { CampaignConnectDomainService } from '../campaign-connect-domain/campaign-connect-domain.service';
import { DashboardDialogQueueService } from '../dashboard/services/dashboard-dialog-queue.service';

describe('LinksPageComponent links list query', () => {
  it('omits search shorter than two characters', () => {
    expect(
      buildLinksListBaseFilter({
        activeGroupId: 'group-1',
        linkMapId: '',
        search: 'a',
      }),
    ).toEqual({ domainGroupId: 'group-1' });
  });

  it('includes search, site, and link map filters when set', () => {
    expect(
      buildLinksListBaseFilter({
        activeGroupId: 'group-1',
        linkMapId: 'map-1',
        search: '  summer  ',
      }),
    ).toEqual({
      domainGroupId: 'group-1',
      linkMapId: 'map-1',
      search: 'summer',
    });
  });

  it('omits domainGroupId for all-sites scope', () => {
    expect(
      buildLinksListBaseFilter({
        activeGroupId: '',
        linkMapId: '',
        search: '',
      }),
    ).toEqual({});
  });

  it('resolves startAfterId from page cursors', () => {
    const cursors = [undefined, 'entry-1', 'entry-2'] as const;

    expect(resolveLinksListStartAfterId(1, cursors)).toBeUndefined();
    expect(resolveLinksListStartAfterId(2, cursors)).toBe('entry-1');
    expect(resolveLinksListStartAfterId(3, cursors)).toBe('entry-2');
  });
});

describe('LinksPageComponent create-link gating', () => {
  it('requires connected hosts before opening create wizard', () => {
    expect(organizationHasConnectedHosts(1, 0)).toBe(false);
    expect(organizationHasConnectedHosts(1, 1)).toBe(true);
  });

  it('shows add-host empty state instead of link list when groups exist without hosts (UX-060)', () => {
    const shouldShowAddHostEmptyState = (groupCount: number, hostCount: number) =>
      groupCount > 0 && !organizationHasConnectedHosts(groupCount, hostCount);

    expect(shouldShowAddHostEmptyState(1, 0)).toBe(true);
    expect(shouldShowAddHostEmptyState(3, 0)).toBe(true);
    expect(shouldShowAddHostEmptyState(1, 1)).toBe(false);
    expect(shouldShowAddHostEmptyState(0, 0)).toBe(false);
  });

  it('redirects openCreate query to connect-domain when groups exist without hosts', () => {
    expect(resolveLinksOpenCreateQueryAction(true, 1, 0)).toBe('open-connect-domain');
  });
});

describe('LinksPageComponent openCreate domain-groups wait', () => {
  it('shows loading banner while openCreate waits for domain groups', () => {
    expect(
      resolveLinksWaitingForDomainGroups({
        openCreateRequested: true,
        authLoaded: true,
        domainGroupsLoading: true,
        domainGroupsListLoaded: false,
      }),
    ).toBe(true);
  });

  it('hides loading banner once domain groups list is loaded', () => {
    expect(
      resolveLinksWaitingForDomainGroups({
        openCreateRequested: true,
        authLoaded: true,
        domainGroupsLoading: false,
        domainGroupsListLoaded: true,
      }),
    ).toBe(false);
  });
});

describe('LinksPageComponent edit dialog routing', () => {
  it('uses campaign simplified dialog target in campaign mode', () => {
    expect(resolveLinksEditDialogTarget(true)).toBe('campaign-simplified');
  });

  it('uses advanced entry form dialog target in advanced mode', () => {
    expect(resolveLinksEditDialogTarget(false)).toBe('advanced-entry-form');
  });
});

describe('LinksPageComponent', () => {
  let fixture: ComponentFixture<LinksPageComponent>;
  let searchList: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    searchList = vi.fn();

    await TestBed.configureTestingModule({
      imports: [LinksPageComponent],
      providers: [
        {
          provide: DomainGroupStore,
          useValue: {
            selectList: () => signal([{ id: 'group-1', name: 'Marketing' }]),
            list: () => ({ default: { data: [], hasMore: false } }),
            isLoading: () => ({}),
            searchList: vi.fn(),
            lastError: () => null,
            clearError: vi.fn(),
          },
        },
        {
          provide: SubdomainStore,
          useValue: {
            selectList: () => signal([]),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: DomainStore,
          useValue: {
            selectList: () =>
              signal([
                {
                  id: 'domain-1',
                  name: 'go.example.com',
                  domainGroupId: 'group-1',
                  dnsStatus: 'VERIFIED',
                  createdAt: '2026-01-01T00:00:00.000Z',
                  updatedAt: '2026-01-01T00:00:00.000Z',
                },
              ]),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: LinkMapStore,
          useValue: {
            selectList: () => signal([]),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: LinksListStore,
          useValue: {
            selectList: () => signal([]),
            selectListResult: () => signal({ data: [], hasMore: false }),
            selectListExpiration: () => signal(null),
            isLoading: () => ({}),
            searchList,
            lastError: () => null,
            clearError: vi.fn(),
          },
        },
        {
          provide: RedirectRuleStore,
          useValue: {
            selectList: () => signal([]),
            selectListResult: () => signal(null),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: OrganizationUsageStore,
          useValue: {
            usage: () => ({ linkMapEntries: 0 }),
            loadUsage: vi.fn(),
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => true,
            isLoading: () => false,
          },
        },
        {
          provide: DashboardContextService,
          useValue: {
            selectedDomainGroupId: () => 'group-1',
            setSelectedDomainGroupId: vi.fn(),
          },
        },
        {
          provide: DashboardModeService,
          useValue: {
            isCampaign: () => true,
            isCampaignMode: () => true,
            isAdvanced: () => false,
            showPageLevelWorkspaceFilter: signal(false),
            mode: () => 'campaign',
          },
        },
        {
          provide: DomainGroupFilterPersistenceService,
          useValue: { bind: vi.fn() },
        },
        {
          provide: CampaignConnectDomainService,
          useValue: { openDialog: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }) },
        },
        {
          provide: DashboardDialogQueueService,
          useValue: {
            runWhenIdle: (callback: () => void) => callback(),
            openBlocking: (callback: () => unknown) => callback(),
          },
        },
        {
          provide: WizardDialogService,
          useValue: { openWizard: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: new BehaviorSubject(convertToParamMap({})).asObservable(),
            snapshot: { paramMap: convertToParamMap({}) },
          },
        },
        {
          provide: APP_CONFIG,
          useValue: {
            APP_SUBDOMAIN_BASE_URL: 'https://go.example.com',
            APP_BASE_URL: 'https://example.com',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LinksPageComponent);
    fixture.detectChanges();
  });

  it('requests the links list from LinksListStore on init', () => {
    expect(searchList).toHaveBeenCalled();
    const query = searchList.mock.calls.at(-1)?.[0];
    expect(query).toMatchObject({ limit: 20 });
    expect(query.startAfterId).toBeUndefined();
  });
});

describe('LinksPageComponent list cache wiring', () => {
  let searchList: ReturnType<typeof vi.fn>;

  async function createFixture(options?: {
    listResult?: { data: string[]; hasMore: boolean };
    expiration?: number | null;
  }) {
    searchList = vi.fn();
    const listResult = signal(options?.listResult ?? null);
    const expiration = signal(options?.expiration ?? null);

    await TestBed.configureTestingModule({
      imports: [LinksPageComponent],
      providers: [
        {
          provide: DomainGroupStore,
          useValue: {
            selectList: () => signal([{ id: 'group-1', name: 'Marketing' }]),
            list: () => ({ default: { data: [], hasMore: false } }),
            isLoading: () => ({}),
            searchList: vi.fn(),
            lastError: () => null,
            clearError: vi.fn(),
          },
        },
        {
          provide: SubdomainStore,
          useValue: {
            selectList: () => signal([]),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: DomainStore,
          useValue: {
            selectList: () => signal([]),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: LinkMapStore,
          useValue: {
            selectList: () => signal([]),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: LinksListStore,
          useValue: {
            selectList: () => signal([]),
            selectListResult: () => listResult,
            selectListExpiration: () => expiration,
            isLoading: () => ({}),
            searchList,
            lastError: () => null,
            clearError: vi.fn(),
          },
        },
        {
          provide: RedirectRuleStore,
          useValue: {
            selectList: () => signal([]),
            selectListResult: () => signal(null),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: OrganizationUsageStore,
          useValue: {
            usage: () => ({ linkMapEntries: 0 }),
            loadUsage: vi.fn(),
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => true,
            isLoading: () => false,
          },
        },
        {
          provide: DashboardContextService,
          useValue: {
            selectedDomainGroupId: () => 'group-1',
            setSelectedDomainGroupId: vi.fn(),
          },
        },
        {
          provide: DashboardModeService,
          useValue: {
            isCampaign: () => true,
            isCampaignMode: () => true,
            isAdvanced: () => false,
            showPageLevelWorkspaceFilter: signal(false),
            mode: () => 'campaign',
          },
        },
        {
          provide: DomainGroupFilterPersistenceService,
          useValue: { bind: vi.fn() },
        },
        {
          provide: CampaignConnectDomainService,
          useValue: { openDialog: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }) },
        },
        {
          provide: DashboardDialogQueueService,
          useValue: {
            runWhenIdle: (callback: () => void) => callback(),
            openBlocking: (callback: () => unknown) => callback(),
          },
        },
        {
          provide: WizardDialogService,
          useValue: { openWizard: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: new BehaviorSubject(convertToParamMap({})).asObservable(),
            snapshot: { paramMap: convertToParamMap({}) },
          },
        },
        {
          provide: APP_CONFIG,
          useValue: {
            APP_SUBDOMAIN_BASE_URL: 'https://go.example.com',
            APP_BASE_URL: 'https://example.com',
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LinksPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('does not refetch when cached list result is still valid', async () => {
    await createFixture({
      listResult: { data: [], hasMore: false },
      expiration: Date.now() + 60_000,
    });

    expect(searchList).not.toHaveBeenCalled();
  });
});
