import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { APP_CONFIG } from '../../../../core/config/app-runtime-config';
import { AuthStore } from '../../../../core/store/auth.store';
import { DomainGroupStore } from '../../../../core/store/domain-group.store';
import { DomainStore } from '../../../../core/store/domain.store';
import { LinkMapStore } from '../../../../core/store/link-map.store';
import { RedirectRuleStore } from '../../../../core/store/redirect-rule.store';
import { SubdomainStore } from '../../../../core/store/subdomain.store';
import { CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY } from '../../../campaign-connect-domain/campaign-connect-domain.util';
import { DashboardOnboardingDialogComponent } from './dashboard-onboarding-dialog.component';

describe('DashboardOnboardingDialogComponent', () => {
  const subdomainsSignal = signal<
    {
      id: string;
      name: string;
      domainGroupId: string;
      createdAt: string;
      updatedAt: string;
    }[]
  >([
    {
      id: 'sub-1',
      name: 'launch',
      domainGroupId: 'group-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);
  const domainsSignal = signal<
    {
      id: string;
      name: string;
      domainGroupId: string;
      dnsStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
      createdAt: string;
      updatedAt: string;
    }[]
  >([]);
  const linkMapsSignal = signal([
    {
      id: 'map-1',
      name: 'First link map',
      domainGroupId: 'group-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);
  const domainGroupsSignal = signal([
    {
      id: 'group-1',
      name: 'Default',
      organizationId: 'org-1',
      robotsPolicy: 'NONE',
      redirectDeliveryMode: 'INSTANT',
      customRobotsContent: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);
  const redirectRulesSignal = signal([
    {
      id: 'rule-1',
      source: '/short',
      destination: null,
      statusCode: 302,
      matchMethod: ['GET'],
      queryMatch: 'EXACT',
      pathMatch: 'PREFIX',
      linkMapId: 'map-1',
      priority: 0,
      domainGroupId: 'group-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);

  function configure(campaignMode = false) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DashboardOnboardingDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { campaignMode },
        },
        {
          provide: MatDialogRef,
          useValue: { close: vi.fn() },
        },
        {
          provide: AuthStore,
          useValue: {
            organization: () => ({ name: 'Acme' }),
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
            selectList: () => domainsSignal,
            searchList: vi.fn(),
          },
        },
        {
          provide: SubdomainStore,
          useValue: {
            selectList: () => subdomainsSignal,
            searchList: vi.fn(),
          },
        },
        {
          provide: LinkMapStore,
          useValue: {
            selectList: () => linkMapsSignal,
            selectListResult: () => signal({ data: ['map-1'], hasMore: false }),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: RedirectRuleStore,
          useValue: {
            selectList: () => redirectRulesSignal,
            selectListResult: () => signal({ data: ['rule-1'], hasMore: false }),
            isLoading: () => ({}),
            searchList: vi.fn(),
          },
        },
        {
          provide: APP_CONFIG,
          useValue: {
            APP_SUBDOMAIN_BASE_URL: 'https://go.linkshift.app',
            APP_BASE_URL: 'https://app.linkshift.app',
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(DashboardOnboardingDialogComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    domainsSignal.set([]);
    subdomainsSignal.set([
      {
        id: 'sub-1',
        name: 'launch',
        domainGroupId: 'group-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('formats subdomain preview displayHost and short URL pattern from subdomain base URL', () => {
    const component = configure();

    expect(component.subdomainPreview()).toEqual([
      {
        id: 'sub-1',
        name: 'launch',
        displayHost: 'launch.go.linkshift.app',
        shortUrlPattern: 'launch.go.linkshift.app/short/{key}',
      },
    ]);
  });

  it('exposes starter link map and /short redirect rule in advanced mode', () => {
    const component = configure(false);

    expect(component.starterLinkMap()?.name).toBe('First link map');
    expect(component.starterRedirectRule()?.source).toBe('/short');
    expect(component.starterRedirectRule()?.pathMatch).toBe('PREFIX');
    expect(component.starterRoutingPreview()).toEqual({
      linkMapName: 'First link map',
      ruleSource: '/short',
      rulePathMatch: 'PREFIX',
      ruleRoutesTo: 'First link map',
    });
  });

  it('exposes starter routing preview in campaign mode', () => {
    const component = configure(true);

    expect(component.starterRoutingPreview()?.linkMapName).toBe('First link map');
    expect(component.starterRoutingPreview()?.ruleSource).toBe('/short');
  });

  it('exposes two informational steps without complete flags in advanced mode (UX-209)', () => {
    const component = configure(false);

    expect(component.steps()).toHaveLength(2);
    expect(component.steps().map((step) => step.id)).toEqual(['welcome', 'next']);
    expect(component.steps().every((step) => step.complete === undefined)).toBe(true);
    expect(component.steps()[0].title).toContain('ready');
    expect(component.steps()[0].description).toContain('ready for you');
  });

  it('exposes campaign-specific copy in two steps (UX-209)', () => {
    const component = configure(true);

    expect(component.steps()).toHaveLength(2);
    expect(component.steps().map((step) => step.id)).toEqual(['welcome', 'next']);
    expect(component.steps()[0].title).toContain('ready');
    expect(component.steps()[0].description).toContain('ready for you');
    expect(component.steps()[1].label).toBe('Next steps');
  });

  it('detects when no hosts are connected', () => {
    domainsSignal.set([]);
    subdomainsSignal.set([]);

    const component = configure(false);

    expect(component.hasConnectedHosts()).toBe(false);
  });

  it('uses no-host copy in campaign mode when there are no connected hosts', () => {
    domainsSignal.set([]);
    subdomainsSignal.set([]);

    const component = configure(true);

    expect(component.steps()[0].description).toContain('short-link host');
    expect(component.steps()[0].description).not.toContain('starter subdomain');
    expect(component.steps()[1].description).toContain('Connect a domain');
  });

  it('uses no-host copy in advanced mode when there are no connected hosts', () => {
    domainsSignal.set([]);
    subdomainsSignal.set([]);

    const component = configure(false);

    expect(component.steps()[0].description).toContain('short-link host');
    expect(component.steps()[0].description).not.toContain('starter subdomain');
    expect(component.steps()[1].description).toContain('Connect a domain');
  });

  it('navigates to connect-domain flow on confirm in campaign mode when no hosts exist', () => {
    domainsSignal.set([]);
    subdomainsSignal.set([]);
    const component = configure(true);
    const close = vi.spyOn(component['dialogRef'], 'close');

    component.onConfirm();

    expect(close).toHaveBeenCalledWith({
      confirmed: true,
      navigateTo: `/links?${CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY}=1`,
    });
  });

  it('navigates to connect-domain flow on confirm in advanced mode when no hosts exist', () => {
    domainsSignal.set([]);
    subdomainsSignal.set([]);
    const component = configure(false);
    const close = vi.spyOn(component['dialogRef'], 'close');

    component.onConfirm();

    expect(close).toHaveBeenCalledWith({
      confirmed: true,
      navigateTo: `/links?${CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY}=1`,
    });
  });

  it('closes connect-domain flow when CTA is clicked with no hosts', () => {
    domainsSignal.set([]);
    subdomainsSignal.set([]);
    const component = configure(false);
    const close = vi.spyOn(component['dialogRef'], 'close');

    component.onConnectDomain();

    expect(close).toHaveBeenCalledWith({
      confirmed: true,
      navigateTo: `/links?${CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY}=1`,
    });
  });
});
