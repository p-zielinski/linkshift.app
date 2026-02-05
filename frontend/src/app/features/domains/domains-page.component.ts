import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { form, FormField } from '@angular/forms/signals';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ResourcePillComponent } from '../../shared/components/resource-pill/resource-pill.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { DomainStore } from '../../core/store/domain.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainFormDialogComponent } from './domain-form-dialog.component';
import type { Domain } from '../../core/models/domain.model';
import { AuthStore } from '../../core/store/auth.store';
import { DomainSetupDialogComponent } from './domain-setup-dialog.component';

@Component({
  selector: 'app-domains-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    FormField,
    PageHeaderComponent,
    ResourcePillComponent,
    TablePaginatorComponent
  ],
  templateUrl: './domains-page.component.html'
})
export class DomainsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly domainStore = inject(DomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly columns = ['name', 'id', 'group', 'createdAt', 'actions'];
  readonly domains = this.domainStore.selectList();
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly pageLimitOptions = [10, 20, 50];
  readonly pageLimit = signal(20);
  readonly page = signal(1);

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
  readonly pagedDomains = computed(() => {
    const limit = this.pageLimit();
    const page = this.page();
    const start = (page - 1) * limit;
    return this.filteredDomains().slice(start, start + limit);
  });
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

    effect(() => {
      const groups = this.domainGroups();
      const current = this.activeGroupId();
      const hasCurrent = groups.some((group) => group.id === current);

      if (!current && groups.length === 1) {
        this.filterModel.update((model) => ({
          ...model,
          domainGroupId: groups[0].id
        }));
        return;
      }

      if (current && !hasCurrent) {
        this.filterModel.update((model) => ({
          ...model,
          domainGroupId: groups.length === 1 ? groups[0].id : ''
        }));
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(DomainFormDialogComponent, {
      width: '480px',
      data: {
        domainGroupId: this.activeGroupId() || undefined
      }
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.openSetupDialog();
      }
    });
  }

  openEditDialog(domain: Domain): void {
    this.dialog.open(DomainFormDialogComponent, {
      width: '480px',
      data: {
        domain
      }
    });
  }

  confirmDelete(domainId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete domain',
        message: 'This removes the domain from the routing configuration.',
        confirmLabel: 'Delete',
        tone: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.domainStore.remove(domainId);
      }
    });
  }

  groupLabel(groupId: string): string {
    return this.groupMap()[groupId]?.name ?? groupId;
  }

  groupTooltip(groupId: string): string {
    const name = this.groupMap()[groupId]?.name;
    return name
      ? `Domain group: ${name} (${groupId})`
      : `Domain group ID: ${groupId}`;
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
}
