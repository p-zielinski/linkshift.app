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
import { DomainStore } from '../../core/store/domain.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainFormDialogComponent } from './domain-form-dialog.component';

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
    PageHeaderComponent,
    ResourcePillComponent
  ],
  template: `
    <app-page-header
      title="Domains"
      subtitle="Registered hostnames available for redirect routing."
    >
      <button mat-flat-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
        <span>Add domain</span>
      </button>
    </app-page-header>

    <div class="table-card">
      <div class="table-scroll">
        <table mat-table [dataSource]="domains()" class="mat-elevation-z0">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Domain</th>
            <td mat-cell *matCellDef="let domain">{{ domain.name }}</td>
          </ng-container>

          <ng-container matColumnDef="group">
            <th mat-header-cell *matHeaderCellDef>Domain group</th>
            <td mat-cell *matCellDef="let domain">
              <app-resource-pill
                [label]="groupLabel(domain.domainGroupId)"
                [tooltip]="groupTooltip(domain.domainGroupId)"
              ></app-resource-pill>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let domain">
              <button
                mat-icon-button
                color="warn"
                matTooltip="Delete domain"
                (click)="confirmDelete(domain.id)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (domains().length === 0) {
        <div class="subtle">No domains registered yet.</div>
      }
    </div>
  `
})
export class DomainsPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly domainStore = inject(DomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly columns = ['name', 'group', 'actions'];
  readonly domains = this.domainStore.selectList();
  readonly domainGroups = this.domainGroupStore.selectList();

  readonly groupMap = computed(() => {
    const map: Record<string, { name: string } | undefined> = {};
    for (const group of this.domainGroups()) {
      map[group.id] = { name: group.name };
    }
    return map;
  });

  constructor() {
    this.domainStore.searchList();
    this.domainGroupStore.searchList();

    effect(() => {
      const error = this.domainStore.lastError();
      if (error) {
        this.snackBar.open(error, 'Dismiss', { duration: 4000 });
        this.domainStore.clearError();
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(DomainFormDialogComponent, {
      width: '480px'
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.domainStore.searchList(undefined, true);
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
    return this.groupMap()[groupId]?.name ?? shortId(groupId);
  }

  groupTooltip(groupId: string): string {
    const name = this.groupMap()[groupId]?.name;
    return name
      ? `Domain group: ${name} (${groupId})`
      : `Domain group ID: ${groupId}`;
  }
}

function shortId(id: string): string {
  if (id.length <= 12) {
    return id;
  }
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}
