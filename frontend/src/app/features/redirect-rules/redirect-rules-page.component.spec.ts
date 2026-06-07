import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { RedirectTestResultsStore } from '../../core/store/redirect-test-results.store';
import { RedirectTestStore } from '../../core/store/redirect-test.store';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { LinkMapFormDialogComponent } from '../link-maps/link-map-form-dialog.component';
import { HttpMethod } from '../../core/models/http-method.model';
import {
  RedirectRuleFormDialogComponent,
  type RedirectRuleDialogResult,
} from './redirect-rule-form-dialog.component';
import { RedirectRulesPageComponent } from './redirect-rules-page.component';

describe('RedirectRulesPageComponent', () => {
  let fixture: ComponentFixture<RedirectRulesPageComponent>;
  let component: RedirectRulesPageComponent;
  let openWizard: ReturnType<typeof vi.fn>;
  let linkMapSearchList: ReturnType<typeof vi.fn>;
  let usageInvalidate: ReturnType<typeof vi.fn>;
  let usageLoad: ReturnType<typeof vi.fn>;
  const domainGroupsSignal = signal<{ id: string; name: string }[]>([]);

  beforeEach(async () => {
    domainGroupsSignal.set([
      { id: 'group-1', name: 'Marketing' },
      { id: 'group-2', name: 'Product' },
    ]);
    openWizard = vi.fn().mockReturnValue({ afterClosed: () => of(false) });
    linkMapSearchList = vi.fn();
    usageInvalidate = vi.fn();
    usageLoad = vi.fn();

    await TestBed.configureTestingModule({
      imports: [RedirectRulesPageComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => false,
          },
        },
        {
          provide: RedirectRuleStore,
          useValue: {
            selectList: () => signal([]),
            selectListResult: () => signal(null),
            selectListExpiration: () => signal(null),
            isLoading: () => ({}),
            searchList: vi.fn(),
            lastError: () => null,
            clearError: vi.fn(),
            remove: vi.fn(),
            invalidateList: vi.fn(),
          },
        },
        {
          provide: RedirectTestResultsStore,
          useValue: {
            results: () => ({}),
            clearAll: vi.fn(),
          },
        },
        {
          provide: RedirectTestStore,
          useValue: {
            selectList: () => signal([]),
            selectListResult: () => signal(null),
            isLoading: () => ({}),
            searchList: vi.fn(),
            lastError: () => null,
            clearError: vi.fn(),
            invalidateList: vi.fn(),
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
          provide: LinkMapStore,
          useValue: {
            searchList: linkMapSearchList,
          },
        },
        {
          provide: OrganizationUsageStore,
          useValue: {
            invalidateUsage: usageInvalidate,
            loadUsage: usageLoad,
          },
        },
        {
          provide: DomainGroupFilterPersistenceService,
          useValue: { bind: vi.fn() },
        },
        {
          provide: MatDialog,
          useValue: { open: vi.fn() },
        },
        {
          provide: WizardDialogService,
          useValue: { openWizard },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        DashboardModeService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectRulesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('derives active group label from group map and active group id', () => {
    component.filterModel.set({ domainGroupId: 'group-1', search: '' });
    fixture.detectChanges();

    expect(component.activeGroupLabel()).toBe('Marketing');

    component.filterModel.set({ domainGroupId: 'group-2', search: '' });
    fixture.detectChanges();

    expect(component.activeGroupLabel()).toBe('Product');
  });

  it('falls back to group id when group is not in the map', () => {
    component.filterModel.set({ domainGroupId: 'unknown-group', search: '' });
    fixture.detectChanges();

    expect(component.activeGroupLabel()).toBe('unknown-group');
  });

  it('returns empty string when no group is selected', () => {
    component.filterModel.set({ domainGroupId: '', search: '' });
    fixture.detectChanges();

    expect(component.activeGroupLabel()).toBe('');
  });

  it('opens link map wizard then resumes rule dialog after nested create request', () => {
    const ruleClosed$ = new Subject<RedirectRuleDialogResult>();
    const linkMapClosed$ = new Subject<{ saved: boolean; linkMapId?: string }>();
    const resumeClosed$ = new Subject<boolean>();

    openWizard
      .mockReturnValueOnce({ afterClosed: () => ruleClosed$.asObservable() })
      .mockReturnValueOnce({ afterClosed: () => linkMapClosed$.asObservable() })
      .mockReturnValueOnce({ afterClosed: () => resumeClosed$.asObservable() });

    component.filterModel.set({ domainGroupId: 'group-1', search: '' });
    fixture.detectChanges();
    component.openCreateDialog();

    ruleClosed$.next({
      saved: false,
      openLinkMapWizard: { domainGroupId: 'group-1' },
      resumeRuleDialog: {
        draft: {
          domainGroupId: 'group-1',
          source: '/promo',
          destination: 'https://example.com',
          statusCode: '302',
          matchMethod: [HttpMethod.GET],
          queryMatch: 'exact',
          pathMatch: 'exact',
          linkMapId: null,
          priority: '0',
        },
        activeStepId: 'destination',
      },
    });
    ruleClosed$.complete();

    expect(openWizard).toHaveBeenCalledTimes(2);
    expect(openWizard).toHaveBeenNthCalledWith(
      2,
      LinkMapFormDialogComponent,
      { domainGroupId: 'group-1', linkMapId: undefined },
      0,
      { size: 'compact' },
    );

    linkMapClosed$.next({ saved: true, linkMapId: 'map-new' });
    linkMapClosed$.complete();

    expect(linkMapSearchList).toHaveBeenCalledWith({ domainGroupId: 'group-1' }, true);
    expect(usageInvalidate).toHaveBeenCalled();
    expect(usageLoad).toHaveBeenCalledWith(true);
    expect(openWizard).toHaveBeenCalledTimes(3);
    expect(openWizard).toHaveBeenNthCalledWith(
      3,
      RedirectRuleFormDialogComponent,
      expect.objectContaining({
        domainGroupId: 'group-1',
        resumeDraft: expect.objectContaining({ linkMapId: 'map-new', source: '/promo' }),
        activeStepId: 'destination',
      }),
    );
  });

  it('resumes rule dialog with original draft when link map wizard is cancelled', () => {
    const ruleClosed$ = new Subject<RedirectRuleDialogResult>();
    const linkMapClosed$ = new Subject<{ saved: boolean; linkMapId?: string }>();

    openWizard
      .mockReturnValueOnce({ afterClosed: () => ruleClosed$.asObservable() })
      .mockReturnValueOnce({ afterClosed: () => linkMapClosed$.asObservable() })
      .mockReturnValueOnce({ afterClosed: () => of(false) });

    component.filterModel.set({ domainGroupId: 'group-1', search: '' });
    fixture.detectChanges();
    component.openCreateDialog();

    const resumeDraft = {
      domainGroupId: 'group-1',
      source: '/promo',
      destination: 'https://example.com',
      statusCode: '302',
      matchMethod: [HttpMethod.GET],
      queryMatch: 'exact' as const,
      pathMatch: 'exact' as const,
      linkMapId: null,
      priority: '0',
    };

    ruleClosed$.next({
      saved: false,
      openLinkMapWizard: { domainGroupId: 'group-1' },
      resumeRuleDialog: {
        draft: resumeDraft,
        activeStepId: 'destination',
      },
    });
    ruleClosed$.complete();

    linkMapClosed$.next({ saved: false });
    linkMapClosed$.complete();

    expect(linkMapSearchList).not.toHaveBeenCalled();
    expect(openWizard).toHaveBeenCalledTimes(3);
    expect(openWizard).toHaveBeenNthCalledWith(
      3,
      RedirectRuleFormDialogComponent,
      expect.objectContaining({
        resumeDraft: expect.objectContaining({ linkMapId: null, source: '/promo' }),
        activeStepId: 'destination',
      }),
    );
  });
});
