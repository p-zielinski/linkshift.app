import { PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG, DEFAULT_APP_RUNTIME_CONFIG } from '../../../core/config/app-runtime-config';
import { DashboardModeService } from '../../../core/layout/dashboard-mode.service';
import { AuthStore } from '../../../core/store/auth.store';
import { DomainStore } from '../../../core/store/domain.store';
import { DomainGroupStore } from '../../../core/store/domain-group.store';
import { OrganizationMembersStore } from '../../../core/store/organization-members.store';
import { OrganizationUsageStore } from '../../../core/store/organization-usage.store';
import { SubdomainStore } from '../../../core/store/subdomain.store';
import { SetupChecklistService } from './setup-checklist.service';

describe('SetupChecklistService', () => {
  let domainGroupStoreSearchList: ReturnType<typeof vi.fn>;
  let subdomainStoreSearchList: ReturnType<typeof vi.fn>;
  let domainStoreSearchList: ReturnType<typeof vi.fn>;
  let loadUsage: ReturnType<typeof vi.fn>;
  let loadMembers: ReturnType<typeof vi.fn>;
  let isAuthenticated: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    domainGroupStoreSearchList = vi.fn();
    subdomainStoreSearchList = vi.fn();
    domainStoreSearchList = vi.fn();
    loadUsage = vi.fn();
    loadMembers = vi.fn();
    isAuthenticated = signal(true);

    TestBed.configureTestingModule({
      providers: [
        SetupChecklistService,
        DashboardModeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: APP_CONFIG, useValue: DEFAULT_APP_RUNTIME_CONFIG },
        {
          provide: AuthStore,
          useValue: { isAuthenticated },
        },
        {
          provide: DomainGroupStore,
          useValue: {
            selectList: () => signal([]),
            searchList: domainGroupStoreSearchList,
          },
        },
        {
          provide: SubdomainStore,
          useValue: {
            selectList: () => signal([]),
            searchList: subdomainStoreSearchList,
          },
        },
        {
          provide: DomainStore,
          useValue: {
            selectList: () => signal([]),
            searchList: domainStoreSearchList,
          },
        },
        {
          provide: OrganizationUsageStore,
          useValue: {
            usage: () => null,
            loadUsage,
          },
        },
        {
          provide: OrganizationMembersStore,
          useValue: {
            members: () => [],
            loadMembers,
          },
        },
      ],
    });
  });

  it('loads usage and members when authenticated', () => {
    TestBed.inject(SetupChecklistService);
    TestBed.flushEffects();

    expect(loadUsage).toHaveBeenCalledTimes(1);
    expect(loadMembers).toHaveBeenCalledTimes(1);
  });

  it('does not load domain groups, subdomains, or domains', () => {
    TestBed.inject(SetupChecklistService);
    TestBed.flushEffects();

    expect(domainGroupStoreSearchList).not.toHaveBeenCalled();
    expect(subdomainStoreSearchList).not.toHaveBeenCalled();
    expect(domainStoreSearchList).not.toHaveBeenCalled();
  });

  it('does not load usage or members when unauthenticated', () => {
    isAuthenticated.set(false);

    TestBed.inject(SetupChecklistService);
    TestBed.flushEffects();

    expect(loadUsage).not.toHaveBeenCalled();
    expect(loadMembers).not.toHaveBeenCalled();
  });
});
