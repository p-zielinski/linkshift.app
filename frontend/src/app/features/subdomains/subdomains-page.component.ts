import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { AuthStore } from '../../core/store/auth.store';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceTableCardComponent } from '../../shared/components/resource-table-card/resource-table-card.component';
import type { Subdomain } from '../../core/models/subdomain.model';
import {
  SubdomainFormDialogComponent,
  type SubdomainDialogData
} from './subdomain-form-dialog.component';
import { SubdomainsTableComponent } from './components/subdomains-table/subdomains-table.component';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { APP_CONFIG } from '../../core/config/app-runtime-config';

@Component({
  selector: 'app-subdomains-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    TablePaginatorComponent,
    ResourcePageShellComponent,
    ResourceTableCardComponent,
    SubdomainsTableComponent
  ],
  templateUrl: './subdomains-page.component.html'
})
export class SubdomainsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly appConfig = inject(APP_CONFIG);

  readonly subdomains = this.subdomainStore.selectList();
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly pageLimitOptions = [10, 20, 50];
  readonly pageLimit = signal(20);
  readonly page = signal(1);

  readonly totalSubdomains = computed(() => this.subdomains().length);
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalSubdomains() / this.pageLimit()))
  );
  readonly pagedSubdomains = computed(() => {
    const limit = this.pageLimit();
    const page = this.page();
    const start = (page - 1) * limit;
    return this.subdomains().slice(start, start + limit);
  });
  readonly hasNextPage = computed(() => this.page() < this.pageCount());
  readonly groupMap = computed(() => {
    const map: Record<string, { name: string } | undefined> = {};
    for (const group of this.domainGroups()) {
      map[group.id] = { name: group.name };
    }
    return map;
  });
  readonly subdomainBaseHost = computed(() => {
    const configured = this.appConfig.APP_SUBDOMAIN_BASE_URL || this.appConfig.APP_BASE_URL;
    return configured
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');
  });

  constructor() {
    if (this.authStore.isAuthenticated()) {
      this.subdomainStore.searchList();
      this.domainGroupStore.searchList();
    }

    effect(() => {
      const error = this.subdomainStore.lastError();
      if (error) {
        this.snackBar.open(error, 'Dismiss', { duration: 4000 });
        this.subdomainStore.clearError();
      }
    });

    effect(() => {
      const maxPage = this.pageCount();
      if (this.page() > maxPage) {
        this.page.set(maxPage);
      }
    });
  }

  openCreateDialog(): void {
    this.wizardDialog.openWizard<
      SubdomainFormDialogComponent,
      SubdomainDialogData,
      boolean
    >(SubdomainFormDialogComponent, {});
  }

  openEditDialog(subdomain: Subdomain): void {
    this.wizardDialog.openWizard<
      SubdomainFormDialogComponent,
      SubdomainDialogData,
      boolean
    >(SubdomainFormDialogComponent, {
      subdomain
    });
  }

  confirmDelete(subdomainId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete subdomain',
        message: 'This removes the subdomain from the LinkShift base host routing.',
        confirmLabel: 'Delete',
        tone: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.subdomainStore.remove(subdomainId);
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
}