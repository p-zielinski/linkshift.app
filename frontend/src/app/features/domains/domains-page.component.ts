import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { form } from '@angular/forms/signals';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { DomainStore } from '../../core/store/domain.store';
import { DomainsApiService } from '../../core/api/domains-api.service';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainFormDialogComponent, type DomainDialogData } from './domain-form-dialog.component';
import type { Domain } from '../../core/models/domain.model';
import { AuthStore } from '../../core/store/auth.store';
import { DomainSetupDialogComponent } from './domain-setup-dialog.component';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceTableCardComponent } from '../../shared/components/resource-table-card/resource-table-card.component';
import { attachPageWorkspaceFilter } from '../../core/layout/attach-page-workspace.util';
import { DomainsTableComponent } from './components/domains-table/domains-table.component';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { DEFAULT_LIST_KEY } from '../../core/store/entity/entity-store.utils';
import { areRowsEqualByIdAndUpdatedAt } from '../../core/utils/signal-list-equality.util';

@Component({
  selector: 'app-domains-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    TablePaginatorComponent,
    ResourcePageShellComponent,
    ResourceTableCardComponent,
    DomainsTableComponent
  ],
  templateUrl: './domains-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly domainStore = inject(DomainStore);
  private readonly domainsApi = inject(DomainsApiService);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly domainGroupFilterPersistence = inject(DomainGroupFilterPersistenceService);
  private readonly dashboardMode = inject(DashboardModeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly showPageLevelWorkspaceFilter = this.dashboardMode.showPageLevelWorkspaceFilter;
  readonly domains = this.domainStore.selectList();
  readonly loading = computed(() => this.domainStore.isLoading()[DEFAULT_LIST_KEY] ?? false);
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly pageLimitOptions = [10, 20, 50];
  readonly pageLimit = signal(20);
  readonly page = signal(1);
  readonly verifyingDnsId = signal<string | null>(null);

  filterModel = signal({
    domainGroupId: ''
  });

  filterForm = form(this.filterModel, () => {});

  readonly activeGroupId = computed(() => this.filterModel().domainGroupId);
  readonly filteredDomains = computed(() => {
    const groupId = this.activeGroupId();
    if (!groupId) {
      return this.domains();
    }
    return this.domains().filter((domain) => domain.domainGroupId === groupId);
  });

  readonly totalDomains = computed(() => this.filteredDomains().length);
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalDomains() / this.pageLimit()))
  );
  readonly pagedDomains = computed(
    () => {
      const limit = this.pageLimit();
      const page = this.page();
      const start = (page - 1) * limit;
      return this.filteredDomains().slice(start, start + limit);
    },
    { equal: areRowsEqualByIdAndUpdatedAt },
  );
  readonly hasNextPage = computed(() => this.page() < this.pageCount());
  readonly groupMap = computed(() => {
    const map: Record<string, { name: string } | undefined> = {};
    for (const group of this.domainGroups()) {
      map[group.id] = { name: group.name };
    }
    return map;
  });

  constructor() {
    if (this.authStore.isAuthenticated()) {
      this.domainStore.searchList();
      this.domainGroupStore.searchList();
    }

    this.domainGroupFilterPersistence.bind(this.filterModel, this.domainGroups, {
      allowEmptySelection: this.showPageLevelWorkspaceFilter,
      syncFromDashboardContext: computed(() => this.dashboardMode.isAdvanced()),
    });

    attachPageWorkspaceFilter({
      destroyRef: this.destroyRef,
      filterModel: () => this.filterModel(),
      updateFilterModel: (domainGroupId) => {
        this.filterModel.update((model) => ({ ...model, domainGroupId }));
      },
      groups: this.domainGroups,
      allowEmptySelection: this.showPageLevelWorkspaceFilter,
    });

    effect(() => {
      const error = this.domainStore.lastError();
      if (error) {
        this.snackBar.open(error, 'Dismiss', { duration: 4000 });
        this.domainStore.clearError();
      }
    });

    effect(() => {
      const maxPage = this.pageCount();
      if (this.page() > maxPage) {
        this.page.set(maxPage);
      }
    });

    effect(() => {
      this.activeGroupId();
      this.page.set(1);
    });

  }

  openCreateDialog(): void {
    const dialogRef = this.wizardDialog.openWizard<
      DomainFormDialogComponent,
      DomainDialogData,
      boolean
    >(DomainFormDialogComponent, {
      domainGroupId: this.activeGroupId() || undefined
    }, 0, { size: 'compact' });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((created) => {
      if (created) {
        this.snackBar
          .open('Domain added. Point DNS to the target IP, then verify when ready.', 'Domain setup', {
            duration: 6000,
          })
          .onAction()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.openSetupDialog());
        this.openSetupDialog();
      }
    });
  }

  openEditDialog(domain: Domain): void {
    this.wizardDialog.openWizard<
      DomainFormDialogComponent,
      DomainDialogData,
      boolean
    >(DomainFormDialogComponent, {
      domain
    }, 0, { size: 'compact' });
  }

  confirmDelete(domainId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete domain',
        message:
          'Published short links using this domain will stop working. Update your DNS records accordingly. The domain name is reserved for 7 days and cannot be reused immediately. Adding a new domain requires issuing a new TLS certificate.',
        confirmLabel: 'Delete',
        tone: 'warning'
      }
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (confirmed) {
        this.domainStore.remove(domainId);
      }
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  onPageLimitChange(limit: number): void {
    this.pageLimit.set(limit);
    this.page.set(1);
  }

  openSetupDialog(): void {
    this.dialog.open(DomainSetupDialogComponent, {
      width: '480px'
    });
  }

  verifyDns(domainId: string): void {
    if (this.verifyingDnsId()) {
      return;
    }

    this.verifyingDnsId.set(domainId);
    this.domainsApi.verifyDns(domainId).subscribe({
        next: (domain) => {
          this.verifyingDnsId.set(null);
          this.domainStore.searchDetails(domain.id, true);
          this.domainStore.searchList(undefined, true);

          if (domain.dnsStatus === 'VERIFIED') {
            this.snackBar.open('DNS verified. Redirects are ready for this domain.', 'Dismiss', {
              duration: 4000,
            });
            return;
          }

          if (domain.dnsStatus === 'FAILED') {
            this.snackBar
              .open(
                'DNS verification failed. Ensure your A record points to the target IP.',
                'Domain setup',
                { duration: 6000 },
              )
              .onAction()
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(() => this.openSetupDialog());
            return;
          }

          this.snackBar.open('DNS check complete. Verification is still pending.', 'Dismiss', {
            duration: 4000,
          });
        },
        error: () => {
          this.verifyingDnsId.set(null);
          this.snackBar.open('DNS verification request failed. Try again shortly.', 'Dismiss', {
            duration: 4000,
          });
        },
      });
  }
}
