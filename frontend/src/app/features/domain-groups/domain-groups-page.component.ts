import { Component, computed, effect, inject } from '@angular/core';
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
    ResourcePillComponent
  ],
  template: `
    <app-page-header
      title="Domain Groups"
      subtitle="Maintain grouping layers for domain routing rules."
    >
      <button mat-flat-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
        <span>Add group</span>
      </button>
    </app-page-header>

    <div class="table-card">
      <div class="table-scroll">
        <table mat-table [dataSource]="domainGroups()" class="mat-elevation-z0">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let group">{{ group.name }}</td>
          </ng-container>

          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>Identifier</th>
            <td mat-cell *matCellDef="let group">
              <app-resource-pill
                [label]="shortId(group.id)"
                [tooltip]="'Domain group ID: ' + group.id"
              ></app-resource-pill>
            </td>
          </ng-container>

          <ng-container matColumnDef="domains">
            <th mat-header-cell *matHeaderCellDef>Domains</th>
            <td mat-cell *matCellDef="let group">
              <span
                class="chip-muted"
                [matTooltip]="domainCount(group.id) + ' domains linked'"
              >
                {{ domainCount(group.id) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let group">
              <button
                mat-icon-button
                color="warn"
                [matTooltip]="deleteTooltip(group.id)"
                (click)="confirmDelete(group.id)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (domainGroups().length === 0) {
        <div class="subtle">No domain groups available yet.</div>
      }
    </div>
  `,
  styles: [
    `
      table {
        width: 100%;
      }

      th.mat-header-cell {
        font-weight: 600;
      }

      td.mat-cell {
        padding-top: 12px;
        padding-bottom: 12px;
      }

      .table-scroll {
        overflow: auto;
      }
    `
  ]
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
}
