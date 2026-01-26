import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ResourcePillComponent } from '../../shared/components/resource-pill/resource-pill.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { DEFAULT_LIST_KEY } from '../../core/store/entity/entity-store.utils';
import { DomainGroupFormDialogComponent } from './domain-group-form-dialog.component';

@Component({
  selector: 'app-domain-groups-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    PageHeaderComponent,
    ResourcePillComponent,
    TablePaginatorComponent
  ],
  templateUrl: './domain-groups-page.component.html'
})
export class DomainGroupsPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly domainStore = inject(DomainStore);

  readonly columns = ['name', 'id', 'domains', 'actions'];
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly domains = this.domainStore.selectList();
  readonly domainsLoaded = computed(() => !!this.domainStore.list()[DEFAULT_LIST_KEY]);
  readonly pageLimitOptions = [10, 20, 50];
  readonly pageLimit = signal(20);
  readonly page = signal(1);

  readonly totalGroups = computed(() => this.domainGroups().length);
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalGroups() / this.pageLimit()))
  );
  readonly pagedGroups = computed(() => {
    const limit = this.pageLimit();
    const page = this.page();
    const start = (page - 1) * limit;
    return this.domainGroups().slice(start, start + limit);
  });
  readonly hasNextPage = computed(() => this.page() < this.pageCount());

  readonly domainCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const domain of this.domains()) {
      counts[domain.domainGroupId] = (counts[domain.domainGroupId] ?? 0) + 1;
    }
    return counts;
  });

  constructor() {
    this.domainGroupStore.searchList();
    this.domainStore.searchList();

    effect(() => {
      const error = this.domainGroupStore.lastError();
      if (error) {
        this.snackBar.open(error, 'Dismiss', { duration: 4000 });
        this.domainGroupStore.clearError();
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
    const dialogRef = this.dialog.open(DomainGroupFormDialogComponent, {
      width: '480px'
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.domainGroupStore.searchList(undefined, true);
      }
    });
  }

  confirmDelete(groupId: string): void {
    if (!this.domainsLoaded()) {
      this.snackBar.open('Domain data is still loading. Try again in a moment.', 'Dismiss', {
        duration: 4000
      });
      return;
    }

    if (this.domainCount(groupId) > 0) {
      this.snackBar.open(
        'Delete blocked: domain groups with linked domains cannot be removed.',
        'Dismiss',
        { duration: 5000 }
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete domain group',
        message: 'This will remove the domain group and all redirect rules linked to it.',
        confirmLabel: 'Delete',
        tone: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.domainGroupStore.remove(groupId);
      }
    });
  }

  domainCount(groupId: string): number {
    return this.domainCounts()[groupId] ?? 0;
  }

  deleteTooltip(groupId: string): string {
    return this.domainCount(groupId) > 0
      ? 'Remove linked domains before deleting this group.'
      : 'Delete domain group and its redirect rules.';
  }

  shortId(id: string): string {
    if (id.length <= 12) {
      return id;
    }
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  onPageLimitChange(limit: number): void {
    this.pageLimit.set(limit);
    this.page.set(1);
  }
}
