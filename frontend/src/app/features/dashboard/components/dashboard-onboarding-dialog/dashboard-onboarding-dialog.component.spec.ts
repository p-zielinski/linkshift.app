import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { APP_CONFIG } from '../../../../core/config/app-runtime-config';
import { AuthStore } from '../../../../core/store/auth.store';
import { DomainGroupStore } from '../../../../core/store/domain-group.store';
import { SubdomainStore } from '../../../../core/store/subdomain.store';
import { DashboardOnboardingDialogComponent } from './dashboard-onboarding-dialog.component';

describe('DashboardOnboardingDialogComponent', () => {
  const subdomainsSignal = signal([
    {
      id: 'sub-1',
      name: 'launch',
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
            selectList: () => signal([]),
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

  it('formats subdomain preview displayHost from subdomain base URL', () => {
    const component = configure();

    expect(component.subdomainPreview()).toEqual([
      {
        id: 'sub-1',
        name: 'launch',
        displayHost: 'launch.go.linkshift.app',
      },
    ]);
  });

  it('exposes two informational steps without complete flags in advanced mode (UX-209)', () => {
    const component = configure(false);

    expect(component.steps()).toHaveLength(2);
    expect(component.steps().map((step) => step.id)).toEqual(['welcome', 'next']);
    expect(component.steps().every((step) => step.complete === undefined)).toBe(true);
    expect(component.steps()[0].title).toContain('redirects');
  });

  it('exposes campaign-specific copy in two steps (UX-209)', () => {
    const component = configure(true);

    expect(component.steps()).toHaveLength(2);
    expect(component.steps().map((step) => step.id)).toEqual(['welcome', 'next']);
    expect(component.steps()[0].title).toContain('short links');
    expect(component.steps()[1].label).toBe('Next steps');
  });
});
