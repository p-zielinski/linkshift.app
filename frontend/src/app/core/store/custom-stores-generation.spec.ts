import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { OrganizationPlan } from '@shared/models/organization-config.model';
import { of, Subject } from 'rxjs';
import { OrganizationMembersApiService } from '../api/organization-members-api.service';
import { BillingApiService, type BillingPlanCatalog } from '../api/billing-api.service';
import { OrganizationApiService } from '../api/organization-api.service';
import { RedirectRulesApiService } from '../api/redirect-rules-api.service';
import type { OrganizationMember } from '../models/organization-member.model';
import type { OrganizationUsage } from '../models/organization-usage.model';
import { HttpMethod } from '../models/http-method.model';
import type { RedirectRule, TopRedirectRuleEntry } from '../models/redirect-rule.model';
import { BillingPlansStore } from './billing-plans.store';
import { OrganizationMembersStore } from './organization-members.store';
import { OrganizationUsageStore } from './organization-usage.store';
import { RedirectRulesAnalyticsStore } from './redirect-rules-analytics.store';

const MEMBER: OrganizationMember = {
  id: 'member-1',
  email: 'member@example.com',
  isOwner: false,
  isBlocked: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const STALE_MEMBER: OrganizationMember = {
  id: 'member-2',
  email: 'stale@example.com',
  isOwner: false,
  isBlocked: false,
  createdAt: '2024-01-02',
  updatedAt: '2024-01-02',
};

const CATALOG: BillingPlanCatalog = {
  plans: [],
  limits: {},
  updatedAt: '2024-01-01',
};

const STALE_CATALOG: BillingPlanCatalog = {
  plans: [
    {
      plan: OrganizationPlan.PRO,
      interval: 'MONTHLY',
      priceId: 'price-stale',
      amount: 1000,
      currency: 'usd',
    },
  ],
  limits: {},
  updatedAt: '2024-01-02',
};

@Injectable()
class MockOrganizationMembersApiService {
  listUseSubject = false;
  listSubject = new Subject<OrganizationMember[]>();
  listResult: OrganizationMember[] = [MEMBER];

  listMembers() {
    if (this.listUseSubject) {
      return this.listSubject.asObservable();
    }
    return of(this.listResult);
  }

  updateMemberStatus() {
    return of(MEMBER);
  }
}

const USAGE: OrganizationUsage = {
  domainGroups: 1,
  domains: 2,
  subdomains: 3,
  rules: 4,
  tests: 5,
  users: 6,
  apiKeys: 7,
  linkMaps: 8,
  linkMapEntries: 9,
};

const STALE_USAGE: OrganizationUsage = {
  ...USAGE,
  domains: 99,
};

const RULE: RedirectRule = {
  id: 'rule-1',
  source: '/summer',
  destination: 'https://example.com',
  statusCode: 302,
  matchMethod: [HttpMethod.GET],
  queryMatch: 'ignore',
  pathMatch: 'exact',
  priority: 0,
  domainGroupId: 'group-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const STALE_RULE: RedirectRule = {
  ...RULE,
  id: 'rule-2',
  source: '/stale',
};

const ANALYTICS_ENTRY: TopRedirectRuleEntry = {
  rule: RULE,
  hits: 10,
  topLinkMapKeys: [],
  topRequestVariants: [],
};

const STALE_ANALYTICS_ENTRY: TopRedirectRuleEntry = {
  rule: STALE_RULE,
  hits: 99,
  topLinkMapKeys: [],
  topRequestVariants: [],
};

@Injectable()
class MockOrganizationApiService {
  usageUseSubject = false;
  usageSubject = new Subject<OrganizationUsage>();
  usageResult: OrganizationUsage = USAGE;

  getUsage() {
    if (this.usageUseSubject) {
      return this.usageSubject.asObservable();
    }
    return of(this.usageResult);
  }
}

@Injectable()
class MockRedirectRulesApiService {
  analyticsUseSubject = false;
  analyticsSubject = new Subject<{ data: TopRedirectRuleEntry[] }>();
  analyticsResult = { data: [ANALYTICS_ENTRY] };

  analytics() {
    if (this.analyticsUseSubject) {
      return this.analyticsSubject.asObservable();
    }
    return of(this.analyticsResult);
  }
}

@Injectable()
class MockBillingApiService {
  plansUseSubject = false;
  plansSubject = new Subject<BillingPlanCatalog>();
  plansResult: BillingPlanCatalog = CATALOG;

  getPlans() {
    if (this.plansUseSubject) {
      return this.plansSubject.asObservable();
    }
    return of(this.plansResult);
  }
}

describe('custom stores load generation', () => {
  describe('OrganizationMembersStore', () => {
    let store: InstanceType<typeof OrganizationMembersStore>;
    let api: MockOrganizationMembersApiService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          MockOrganizationMembersApiService,
          {
            provide: OrganizationMembersApiService,
            useExisting: MockOrganizationMembersApiService,
          },
          {
            provide: OrganizationUsageStore,
            useValue: {
              invalidateUsage: () => undefined,
              loadUsage: () => undefined,
            },
          },
          OrganizationMembersStore,
        ],
      });
      store = TestBed.inject(OrganizationMembersStore);
      api = TestBed.inject(MockOrganizationMembersApiService);
      api.listUseSubject = false;
      api.listSubject = new Subject<OrganizationMember[]>();
      api.listResult = [MEMBER];
    });

    it('ignores stale member list responses after resetStore', () => {
      store.loadMembers();
      expect(store.members()).toEqual([MEMBER]);

      api.listUseSubject = true;
      store.loadMembers(true);

      store.resetStore();
      expect(store.members()).toEqual([]);
      expect(store.isLoading()).toBe(false);

      api.listSubject.next([STALE_MEMBER]);

      expect(store.members()).toEqual([]);
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('BillingPlansStore', () => {
    let store: InstanceType<typeof BillingPlansStore>;
    let api: MockBillingApiService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          MockBillingApiService,
          { provide: BillingApiService, useExisting: MockBillingApiService },
          BillingPlansStore,
        ],
      });
      store = TestBed.inject(BillingPlansStore);
      api = TestBed.inject(MockBillingApiService);
      api.plansUseSubject = false;
      api.plansSubject = new Subject<BillingPlanCatalog>();
      api.plansResult = CATALOG;
    });

    it('ignores stale billing plan responses after resetStore', () => {
      store.loadPlans();
      expect(store.catalog()).toEqual(CATALOG);

      api.plansUseSubject = true;
      store.loadPlans();

      store.resetStore();
      expect(store.catalog()).toBeNull();
      expect(store.isLoading()).toBe(false);

      api.plansSubject.next(STALE_CATALOG);

      expect(store.catalog()).toBeNull();
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('OrganizationUsageStore', () => {
    let store: InstanceType<typeof OrganizationUsageStore>;
    let api: MockOrganizationApiService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          MockOrganizationApiService,
          { provide: OrganizationApiService, useExisting: MockOrganizationApiService },
          OrganizationUsageStore,
        ],
      });
      store = TestBed.inject(OrganizationUsageStore);
      api = TestBed.inject(MockOrganizationApiService);
      api.usageUseSubject = false;
      api.usageSubject = new Subject<OrganizationUsage>();
      api.usageResult = USAGE;
    });

    it('ignores stale usage responses after resetStore', () => {
      store.loadUsage();
      expect(store.usage()).toEqual(USAGE);

      api.usageUseSubject = true;
      store.loadUsage(true);

      store.resetStore();
      expect(store.usage()).toBeNull();
      expect(store.isLoading()).toBe(false);

      api.usageSubject.next(STALE_USAGE);

      expect(store.usage()).toBeNull();
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('RedirectRulesAnalyticsStore', () => {
    let store: InstanceType<typeof RedirectRulesAnalyticsStore>;
    let api: MockRedirectRulesApiService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          MockRedirectRulesApiService,
          { provide: RedirectRulesApiService, useExisting: MockRedirectRulesApiService },
          RedirectRulesAnalyticsStore,
        ],
      });
      store = TestBed.inject(RedirectRulesAnalyticsStore);
      api = TestBed.inject(MockRedirectRulesApiService);
      api.analyticsUseSubject = false;
      api.analyticsSubject = new Subject<{ data: TopRedirectRuleEntry[] }>();
      api.analyticsResult = { data: [ANALYTICS_ENTRY] };
    });

    it('ignores stale analytics responses after resetStore', () => {
      const query = { domainGroupId: 'group-1', limit: 10 };
      store.searchAnalytics(query);
      expect(store.selectAnalytics(query)()).toEqual([ANALYTICS_ENTRY]);

      api.analyticsUseSubject = true;
      store.searchAnalytics(query, true);

      store.resetStore();
      expect(store.selectAnalytics(query)()).toEqual([]);
      expect(store.selectLoading(query)()).toBe(false);

      api.analyticsSubject.next({ data: [STALE_ANALYTICS_ENTRY] });

      expect(store.selectAnalytics(query)()).toEqual([]);
      expect(store.selectLoading(query)()).toBe(false);
    });
  });
});
