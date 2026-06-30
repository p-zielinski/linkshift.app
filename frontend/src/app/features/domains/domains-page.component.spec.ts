import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { DomainsApiService } from '../../core/api/domains-api.service';
import { DEFAULT_LIST_KEY } from '../../core/store/entity/entity-store.utils';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DomainFormDialogComponent } from './domain-form-dialog.component';
import { DomainsPageComponent } from './domains-page.component';

describe('DomainsPageComponent', () => {
  let fixture: ComponentFixture<DomainsPageComponent>;
  let component: DomainsPageComponent;
  let openWizard: ReturnType<typeof vi.fn>;
  let isLoading: ReturnType<typeof signal<boolean>>;
  let verifyDns: ReturnType<typeof vi.fn>;
  let searchDetails: ReturnType<typeof vi.fn>;
  let searchList: ReturnType<typeof vi.fn>;
  let snackBarOpen: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    isLoading = signal(false);
    openWizard = vi.fn().mockReturnValue({ afterClosed: () => of(false) });
    verifyDns = vi.fn();
    searchDetails = vi.fn();
    searchList = vi.fn();
    snackBarOpen = vi.fn().mockReturnValue({ onAction: () => of(undefined) });

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
            searchList,
            searchDetails,
            lastError: () => null,
            clearError: vi.fn(),
          },
        },
        {
          provide: DomainsApiService,
          useValue: { verifyDns },
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
          useValue: {
            open: () => ({ onAction: () => of(undefined) }),
          },
        },
        DashboardModeService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DomainsPageComponent);
    component = fixture.componentInstance;
    snackBarOpen = vi
      .spyOn(component['snackBar'], 'open')
      .mockReturnValue({ onAction: () => of(undefined) } as ReturnType<MatSnackBar['open']>);
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

  it('opens delete confirmation with stronger warning copy', () => {
    const dialogOpen = vi.spyOn(component['dialog'], 'open').mockReturnValue({
      afterClosed: () => of(false),
    } as ReturnType<MatDialog['open']>);

    fixture.detectChanges();
    component.confirmDelete('domain-1');

    expect(dialogOpen).toHaveBeenCalledWith(
      ConfirmDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Delete domain',
          message: expect.stringContaining('stop working'),
        }),
      }),
    );
    const dialogData = dialogOpen.mock.calls[0]?.[1] as { data: { message: string } };
    const message = dialogData.data.message;
    expect(message).toContain('7 days');
    expect(message).toContain('TLS certificate');
  });

  it('shows DNS setup snackbar after domain create', async () => {
    openWizard.mockReturnValue({ afterClosed: () => of(true) });
    vi.spyOn(component['dialog'], 'open').mockReturnValue({} as ReturnType<MatDialog['open']>);

    fixture.detectChanges();
    component.openCreateDialog();
    await fixture.whenStable();

    expect(snackBarOpen).toHaveBeenCalledWith(
      expect.stringContaining('Point DNS'),
      'Domain setup',
      expect.any(Object),
    );
  });

  it('refreshes domain state and shows success snackbar after DNS verification', async () => {
    verifyDns.mockReturnValue(
      of({
        id: 'domain-1',
        name: 'go.example.com',
        domainGroupId: 'group-1',
        dnsStatus: 'VERIFIED',
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      }),
    );

    fixture.detectChanges();
    component.verifyDns('domain-1');
    await fixture.whenStable();

    expect(verifyDns).toHaveBeenCalledWith('domain-1');
    expect(searchDetails).toHaveBeenCalledWith('domain-1', true);
    expect(searchList).toHaveBeenCalledWith(undefined, true);
    expect(snackBarOpen).toHaveBeenCalledWith(
      expect.stringContaining('DNS verified'),
      'Dismiss',
      expect.any(Object),
    );
    expect(component.verifyingDnsId()).toBeNull();
  });

  it('shows failure snackbar when DNS verification returns failed status', async () => {
    verifyDns.mockReturnValue(
      of({
        id: 'domain-1',
        name: 'go.example.com',
        domainGroupId: 'group-1',
        dnsStatus: 'FAILED',
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      }),
    );
    vi.spyOn(component['dialog'], 'open').mockReturnValue({} as ReturnType<MatDialog['open']>);
    snackBarOpen.mockReturnValue({
      onAction: () => of(undefined),
    } as ReturnType<MatSnackBar['open']>);

    fixture.detectChanges();
    component.verifyDns('domain-1');
    await fixture.whenStable();

    expect(snackBarOpen).toHaveBeenCalledWith(
      expect.stringContaining('DNS verification failed'),
      'Domain setup',
      expect.any(Object),
    );
  });

  it('shows error snackbar when DNS verification request fails', async () => {
    verifyDns.mockReturnValue(throwError(() => new Error('network')));

    fixture.detectChanges();
    component.verifyDns('domain-1');
    await fixture.whenStable();

    expect(snackBarOpen).toHaveBeenCalledWith(
      expect.stringContaining('request failed'),
      'Dismiss',
      expect.any(Object),
    );
    expect(component.verifyingDnsId()).toBeNull();
  });
});
