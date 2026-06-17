import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { LinkMapsPageComponent } from './link-maps-page.component';

describe('LinkMapsPageComponent list cache wiring', () => {
  let searchList: ReturnType<typeof vi.fn>;
  let fixture: ComponentFixture<LinkMapsPageComponent>;

  async function createFixture(options?: {
    listResult?: { data: string[]; hasMore: boolean } | null;
    expiration?: number | null;
    domainGroupId?: string;
  }) {
    searchList = vi.fn();
    const listResult = signal(options?.listResult ?? null);
    const expiration = signal(options?.expiration ?? null);
    const domainGroupId = options?.domainGroupId ?? 'group-1';

    await TestBed.configureTestingModule({
      imports: [LinkMapsPageComponent],
      providers: [
        {
          provide: DomainGroupStore,
          useValue: {
            selectList: () => signal([{ id: 'group-1', name: 'Marketing' }]),
            searchList: vi.fn(),
          },
        },
        {
          provide: LinkMapStore,
          useValue: {
            selectList: () => signal([]),
            selectListResult: () => listResult,
            selectListExpiration: () => expiration,
            isLoading: () => ({}),
            searchList,
            errorSequence: () => 0,
            lastError: () => null,
            clearError: vi.fn(),
            remove: vi.fn(),
          },
        },
        {
          provide: DomainGroupFilterPersistenceService,
          useValue: { bind: vi.fn() },
        },
        {
          provide: DashboardModeService,
          useValue: {
            isCampaign: () => false,
            isAdvanced: () => false,
            showPageLevelWorkspaceFilter: signal(false),
          },
        },
        {
          provide: WizardDialogService,
          useValue: { openWizard: vi.fn() },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkMapsPageComponent);
    fixture.componentInstance.filterModel.set({ domainGroupId });
    fixture.detectChanges();
    return fixture;
  }

  it('requests link maps when cache is missing', async () => {
    await createFixture({ listResult: null, expiration: null });

    expect(searchList).toHaveBeenCalledTimes(1);
    expect(searchList).toHaveBeenCalledWith({ domainGroupId: 'group-1' });
  });

  it('does not refetch when cached list result is still valid', async () => {
    await createFixture({
      listResult: { data: ['map-1'], hasMore: false },
      expiration: Date.now() + 60_000,
    });

    expect(searchList).not.toHaveBeenCalled();
  });

  it('does not refetch after a simulated successful list load', async () => {
    const listResult = signal<{ data: string[]; hasMore: boolean } | null>(null);
    const expiration = signal<number | null>(null);

    searchList = vi.fn(() => {
      listResult.set({ data: ['map-1'], hasMore: false });
      expiration.set(Date.now() + 60_000);
    });

    await TestBed.configureTestingModule({
      imports: [LinkMapsPageComponent],
      providers: [
        {
          provide: DomainGroupStore,
          useValue: {
            selectList: () => signal([{ id: 'group-1', name: 'Marketing' }]),
            searchList: vi.fn(),
          },
        },
        {
          provide: LinkMapStore,
          useValue: {
            selectList: () => signal([]),
            selectListResult: () => listResult,
            selectListExpiration: () => expiration,
            isLoading: () => ({}),
            searchList,
            errorSequence: () => 0,
            lastError: () => null,
            clearError: vi.fn(),
            remove: vi.fn(),
          },
        },
        {
          provide: DomainGroupFilterPersistenceService,
          useValue: { bind: vi.fn() },
        },
        {
          provide: DashboardModeService,
          useValue: {
            isCampaign: () => false,
            isAdvanced: () => false,
            showPageLevelWorkspaceFilter: signal(false),
          },
        },
        {
          provide: WizardDialogService,
          useValue: { openWizard: vi.fn() },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkMapsPageComponent);
    fixture.componentInstance.filterModel.set({ domainGroupId: 'group-1' });
    fixture.detectChanges();

    expect(searchList).toHaveBeenCalledTimes(1);

    fixture.detectChanges();

    expect(searchList).toHaveBeenCalledTimes(1);
  });
});
