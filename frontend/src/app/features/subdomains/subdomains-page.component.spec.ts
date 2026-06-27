import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { AuthStore } from '../../core/store/auth.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DEFAULT_LIST_KEY } from '../../core/store/entity/entity-store.utils';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SubdomainsPageComponent } from './subdomains-page.component';

describe('SubdomainsPageComponent', () => {
  let fixture: ComponentFixture<SubdomainsPageComponent>;
  let component: SubdomainsPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubdomainsPageComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: APP_CONFIG,
          useValue: {
            APP_SUBDOMAIN_BASE_URL: 'https://example.com',
            APP_BASE_URL: 'https://example.com',
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => false,
          },
        },
        {
          provide: SubdomainStore,
          useValue: {
            selectList: () => signal([]),
            isLoading: () => ({ [DEFAULT_LIST_KEY]: false }),
            searchList: vi.fn(),
            lastError: () => null,
            clearError: vi.fn(),
            remove: vi.fn(),
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
          useValue: { openWizard: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) },
        },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
        DashboardModeService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubdomainsPageComponent);
    component = fixture.componentInstance;
  });

  it('opens delete confirmation with stronger warning copy', () => {
    const dialogOpen = vi.spyOn(component['dialog'], 'open').mockReturnValue({
      afterClosed: () => of(false),
    } as ReturnType<MatDialog['open']>);

    fixture.detectChanges();
    component.confirmDelete('subdomain-1');

    expect(dialogOpen).toHaveBeenCalledWith(
      ConfirmDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Delete subdomain',
          message: expect.stringContaining('stop working'),
        }),
      }),
    );
    const dialogData = dialogOpen.mock.calls[0]?.[1] as { data: { message: string } };
    expect(dialogData.data.message).toContain('7 days');
  });
});
