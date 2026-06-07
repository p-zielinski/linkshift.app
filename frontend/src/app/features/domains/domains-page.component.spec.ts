import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { DEFAULT_LIST_KEY } from '../../core/store/entity/entity-store.utils';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { DomainFormDialogComponent } from './domain-form-dialog.component';
import { DomainsPageComponent } from './domains-page.component';

describe('DomainsPageComponent', () => {
  let fixture: ComponentFixture<DomainsPageComponent>;
  let component: DomainsPageComponent;
  let openWizard: ReturnType<typeof vi.fn>;
  let isLoading: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    isLoading = signal(false);
    openWizard = vi.fn().mockReturnValue({ afterClosed: () => of(false) });

    await TestBed.configureTestingModule({
      imports: [DomainsPageComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => false,
          },
        },
        {
          provide: DomainStore,
          useValue: {
            selectList: () => signal([]),
            isLoading: () => ({ [DEFAULT_LIST_KEY]: isLoading() }),
            searchList: vi.fn(),
            lastError: () => null,
            clearError: vi.fn(),
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

    fixture = TestBed.createComponent(DomainsPageComponent);
    component = fixture.componentInstance;
  });

  it('opens domain form dialog with compact wizard sizing', () => {
    fixture.detectChanges();
    component.openCreateDialog();

    expect(openWizard).toHaveBeenCalledWith(
      DomainFormDialogComponent,
      { domainGroupId: undefined },
      0,
      { size: 'compact' },
    );
  });

  it('passes domain store loading state to the table', () => {
    isLoading.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading domains…');
  });
});
