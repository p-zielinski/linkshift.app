import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import { AuthApiService } from '../api/auth-api.service';
import { DomainGroupsApiService } from '../api/domain-groups-api.service';
import type { AuthResponse } from '../models/auth.model';
import { DashboardContextService } from '../layout/dashboard-context.service';
import { ApiKeyStore } from './api-key.store';
import { AuthStore } from './auth.store';
import { BillingPlansStore } from './billing-plans.store';
import { DomainGroupStore } from './domain-group.store';
import { DomainStore } from './domain.store';
import { LinkMapEntryStore } from './link-map-entry.store';
import { LinkMapStore } from './link-map.store';
import { LinksListStore } from './links-list.store';
import { OrganizationMembersStore } from './organization-members.store';
import { OrganizationUsageStore } from './organization-usage.store';
import { RedirectRuleStore } from './redirect-rule.store';
import { RedirectRulesAnalyticsStore } from './redirect-rules-analytics.store';
import { RedirectTestResultsStore } from './redirect-test-results.store';
import { RedirectTestStore } from './redirect-test.store';
import { SubdomainStore } from './subdomain.store';
import { clearStoredSession } from './auth.storage';
import { buildRedirectRuleListFilter } from '../utils/redirect-rules-list.util';

function createEntityStoreMock() {
  return {
    searchList: vi.fn(),
    resetStore: vi.fn(),
  };
}

function createUsageStoreMock() {
  return {
    loadUsage: vi.fn(),
    resetStore: vi.fn(),
  };
}

const AUTH_RESPONSE: AuthResponse = {
  accessToken: 'access-token',
  user: {
    id: 'user-1',
    email: 'test@example.com',
    organizationId: 'org-1',
    isOwner: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  organization: {
    id: 'org-1',
    name: 'Test Org',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
};

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let api: {
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
  };
  let domainStore: ReturnType<typeof createEntityStoreMock>;
  let domainGroupStore: ReturnType<typeof createEntityStoreMock>;
  let subdomainStore: ReturnType<typeof createEntityStoreMock>;
  let linksListStore: ReturnType<typeof createEntityStoreMock>;
  let redirectRuleStore: ReturnType<typeof createEntityStoreMock>;
  let redirectTestStore: ReturnType<typeof createEntityStoreMock>;
  let linkMapStore: ReturnType<typeof createEntityStoreMock>;
  let linkMapEntryStore: ReturnType<typeof createEntityStoreMock>;
  let redirectTestResultsStore: ReturnType<typeof createEntityStoreMock>;
  let organizationMembersStore: ReturnType<typeof createEntityStoreMock>;
  let billingPlansStore: ReturnType<typeof createEntityStoreMock>;
  let organizationUsageStore: ReturnType<typeof createUsageStoreMock>;
  let redirectRulesAnalyticsStore: ReturnType<typeof createEntityStoreMock>;
  let apiKeyStore: ReturnType<typeof createEntityStoreMock>;
  let clearSelectedDomainGroupId: ReturnType<typeof vi.fn>;
  let domainGroupsApi: { list: ReturnType<typeof vi.fn> };

  const dashboardStoreMocks = () => [
    domainStore,
    domainGroupStore,
    subdomainStore,
    linksListStore,
    redirectRuleStore,
    redirectTestStore,
    linkMapStore,
    linkMapEntryStore,
    redirectTestResultsStore,
    organizationMembersStore,
    billingPlansStore,
    organizationUsageStore,
    redirectRulesAnalyticsStore,
    apiKeyStore,
  ];

  beforeEach(() => {
    clearStoredSession();
    domainStore = createEntityStoreMock();
    domainGroupStore = createEntityStoreMock();
    subdomainStore = createEntityStoreMock();
    linksListStore = createEntityStoreMock();
    redirectRuleStore = createEntityStoreMock();
    redirectTestStore = createEntityStoreMock();
    linkMapStore = createEntityStoreMock();
    linkMapEntryStore = createEntityStoreMock();
    redirectTestResultsStore = createEntityStoreMock();
    organizationMembersStore = createEntityStoreMock();
    billingPlansStore = createEntityStoreMock();
    organizationUsageStore = createUsageStoreMock();
    redirectRulesAnalyticsStore = createEntityStoreMock();
    apiKeyStore = createEntityStoreMock();
    clearSelectedDomainGroupId = vi.fn();
    domainGroupsApi = {
      list: vi.fn(() =>
        of({
          data: [{ id: 'group-1', name: 'Default' }],
          hasMore: false,
        }),
      ),
    };
    api = {
      login: vi.fn(() => of(AUTH_RESPONSE)),
      logout: vi.fn(() => of(void 0)),
      refresh: vi.fn(() => of({ accessToken: 'refreshed-token' })),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthApiService, useValue: api },
        { provide: DomainGroupsApiService, useValue: domainGroupsApi },
        { provide: DomainGroupStore, useValue: domainGroupStore },
        { provide: DomainStore, useValue: domainStore },
        { provide: SubdomainStore, useValue: subdomainStore },
        { provide: LinksListStore, useValue: linksListStore },
        { provide: RedirectRuleStore, useValue: redirectRuleStore },
        { provide: RedirectTestStore, useValue: redirectTestStore },
        { provide: LinkMapStore, useValue: linkMapStore },
        { provide: LinkMapEntryStore, useValue: linkMapEntryStore },
        { provide: RedirectTestResultsStore, useValue: redirectTestResultsStore },
        { provide: OrganizationMembersStore, useValue: organizationMembersStore },
        { provide: BillingPlansStore, useValue: billingPlansStore },
        { provide: OrganizationUsageStore, useValue: organizationUsageStore },
        { provide: RedirectRulesAnalyticsStore, useValue: redirectRulesAnalyticsStore },
        { provide: ApiKeyStore, useValue: apiKeyStore },
        {
          provide: DashboardContextService,
          useValue: {
            clearSelectedDomainGroupId,
          },
        },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  describe('login', () => {
    it('resets stores before setting session and prefetching core data', async () => {
      const callOrder: string[] = [];
      domainGroupStore.resetStore.mockImplementation(() => {
        callOrder.push('reset');
      });
      api.login.mockImplementation(() => {
        callOrder.push('login');
        return of(AUTH_RESPONSE);
      });

      await firstValueFrom(store.login({ email: 'test@example.com', password: 'secret' }));

      expect(callOrder[0]).toBe('login');
      expect(callOrder[1]).toBe('reset');
      expect(domainGroupStore.resetStore).toHaveBeenCalledTimes(1);
    });

    it('prefetches core data with force=true for domain groups, domains, subdomains, scoped link maps and redirect rules, and usage', async () => {
      await firstValueFrom(store.login({ email: 'test@example.com', password: 'secret' }));

      expect(domainGroupStore.searchList).toHaveBeenCalledWith(undefined, true);
      expect(domainStore.searchList).toHaveBeenCalledWith(undefined, true);
      expect(subdomainStore.searchList).toHaveBeenCalledWith(undefined, true);
      expect(domainGroupsApi.list).toHaveBeenCalledTimes(1);
      expect(linkMapStore.searchList).toHaveBeenCalledWith({ domainGroupId: 'group-1' }, true);
      expect(redirectRuleStore.searchList).toHaveBeenCalledWith(
        buildRedirectRuleListFilter('group-1'),
        true,
      );
      expect(organizationUsageStore.loadUsage).toHaveBeenCalledWith(true);
    });
  });

  describe('refreshTokens', () => {
    it('resets all dashboard stores when refresh returns 401', async () => {
      api.refresh.mockReturnValue(throwError(() => ({ status: 401 })));
      for (const mock of dashboardStoreMocks()) {
        mock.resetStore.mockClear();
      }
      clearSelectedDomainGroupId.mockClear();

      await expect(firstValueFrom(store.refreshTokens())).rejects.toEqual({ status: 401 });

      for (const mock of dashboardStoreMocks()) {
        expect(mock.resetStore).toHaveBeenCalledTimes(1);
      }
      expect(clearSelectedDomainGroupId).toHaveBeenCalledTimes(1);
      expect(store.accessToken()).toBeNull();
    });
  });

  describe('logout', () => {
    beforeEach(async () => {
      await firstValueFrom(store.login({ email: 'test@example.com', password: 'secret' }));
      for (const mock of dashboardStoreMocks()) {
        mock.resetStore.mockClear();
      }
      clearSelectedDomainGroupId.mockClear();
    });

    it('resets all dashboard stores on logout', () => {
      const redirect = vi.fn();
      store.logout(redirect);

      for (const mock of dashboardStoreMocks()) {
        expect(mock.resetStore).toHaveBeenCalledTimes(1);
      }
      expect(clearSelectedDomainGroupId).toHaveBeenCalledTimes(1);
    });

    it('clears selected domain group before redirect', () => {
      const callOrder: string[] = [];
      clearSelectedDomainGroupId.mockImplementation(() => {
        callOrder.push('clear');
      });
      const logoutSubject = new Subject<void>();
      api.logout.mockReturnValue(logoutSubject.asObservable());
      const redirect = vi.fn(() => {
        callOrder.push('redirect');
      });

      store.logout(redirect);

      expect(clearSelectedDomainGroupId).toHaveBeenCalledTimes(1);
      expect(redirect).not.toHaveBeenCalled();
      expect(callOrder).toEqual(['clear']);

      logoutSubject.next();
      logoutSubject.complete();

      expect(redirect).toHaveBeenCalledTimes(1);
      expect(callOrder).toEqual(['clear', 'redirect']);
    });

    it('clears auth state synchronously before api.logout resolves', () => {
      const logoutSubject = new Subject<void>();
      api.logout.mockReturnValue(logoutSubject.asObservable());
      const redirect = vi.fn();

      store.logout(redirect);

      expect(store.accessToken()).toBeNull();
      expect(store.user()).toBeNull();
      expect(store.organization()).toBeNull();
      expect(store.isAuthenticated()).toBe(false);
      expect(redirect).not.toHaveBeenCalled();

      logoutSubject.next();
      logoutSubject.complete();

      expect(redirect).toHaveBeenCalledTimes(1);
    });
  });
});
