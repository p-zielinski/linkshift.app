import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounce, form, required, FormField } from '@angular/forms/signals';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ResourcePillComponent } from '../../shared/components/resource-pill/resource-pill.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { RedirectRuleFormDialogComponent } from './redirect-rule-form-dialog.component';

@Component({
  selector: 'app-redirect-rules-page',
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
    MatInputModule,
    MatSelectModule,
    FormField,
    PageHeaderComponent,
    ResourcePillComponent
  ],
  template: `
    <app-page-header
      title="Redirect Rules"
      subtitle="Define path-level routing actions for each domain group."
    >
      <button
        mat-flat-button
        color="primary"
        (click)="openCreateDialog()"
        [disabled]="!activeGroupId()"
      >
        <mat-icon>add</mat-icon>
        <span>Add rule</span>
      </button>
    </app-page-header>

    <div class="table-card filter-bar">
      <mat-form-field appearance="outline">
        <mat-label>Domain group</mat-label>
        <mat-select [formField]="filterForm.domainGroupId">
          @for (group of domainGroups(); track group.id) {
            <mat-option [value]="group.id">{{ group.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Search source or destination</mat-label>
        <input matInput type="text" [formField]="filterForm.search" />
      </mat-form-field>
    </div>

    <div class="table-card">
      <div class="table-scroll">
        <table mat-table [dataSource]="rules()" class="mat-elevation-z0">
          <ng-container matColumnDef="source">
            <th mat-header-cell *matHeaderCellDef>Source</th>
            <td mat-cell *matCellDef="let rule" [matTooltip]="rule.source">
              {{ rule.source }}
            </td>
          </ng-container>

          <ng-container matColumnDef="destination">
            <th mat-header-cell *matHeaderCellDef>Destination</th>
            <td mat-cell *matCellDef="let rule" [matTooltip]="rule.destination">
              {{ rule.destination }}
            </td>
          </ng-container>

          <ng-container matColumnDef="statusCode">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let rule">{{ rule.statusCode }}</td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Priority</th>
            <td mat-cell *matCellDef="let rule">{{ rule.priority }}</td>
          </ng-container>

          <ng-container matColumnDef="group">
            <th mat-header-cell *matHeaderCellDef>Domain group</th>
            <td mat-cell *matCellDef="let rule">
              <app-resource-pill
                [label]="groupLabel(rule.domainGroupId)"
                [tooltip]="groupTooltip(rule.domainGroupId)"
              ></app-resource-pill>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let rule">
              <button
                mat-icon-button
                color="warn"
                matTooltip="Delete rule"
                (click)="confirmDelete(rule.id)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      @if (!activeGroupId()) {
        <div class="subtle">Select a domain group to load rules.</div>
      }
      @if (activeGroupId() && rules().length === 0) {
        <div class="subtle">No redirect rules for this domain group.</div>
      }
    </div>
  `,
  styles: [
    `
      .filter-bar {
        display: grid;
        grid-template-columns: minmax(220px, 1fr) 2fr;
        gap: 16px;
        margin-bottom: 16px;
      }

      table {
        width: 100%;
      }

      td.mat-cell {
        padding-top: 12px;
        padding-bottom: 12px;
      }
    `
  ]
})
export class RedirectRulesPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly columns = ['source', 'destination', 'statusCode', 'priority', 'group', 'actions'];
  readonly domainGroups = this.domainGroupStore.selectList();

  filterModel = signal({
    domainGroupId: '',
    search: ''
  });

  filterForm = form(this.filterModel, (f) => {
    required(f.domainGroupId);
    debounce(f.search, 350);
  });

  readonly activeGroupId = computed(() => this.filterModel().domainGroupId || '');

  readonly filterParams = computed(() => {
    const { domainGroupId, search } = this.filterModel();
    if (!domainGroupId) {
      return null;
    }

    const trimmedSearch = search.trim();
    return {
      domainGroupId,
      limit: 50,
      page: 1,
      ...(trimmedSearch ? { search: trimmedSearch } : {})
    };
  });

  readonly rules = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return [];
    }
    return this.redirectRuleStore.selectList(filter)();
  });

  readonly groupMap = computed(() => {
    const map: Record<string, { name: string } | undefined> = {};
    for (const group of this.domainGroups()) {
      map[group.id] = { name: group.name };
    }
    return map;
  });

  constructor() {
    this.domainGroupStore.searchList();

    effect(() => {
      const filter = this.filterParams();
      if (filter) {
        this.redirectRuleStore.searchList(filter, true);
      }
    });

    effect(() => {
      const error = this.redirectRuleStore.lastError();
      if (error) {
        this.snackBar.open(error, 'Dismiss', { duration: 4000 });
        this.redirectRuleStore.clearError();
      }
    });
  }

  openCreateDialog(): void {
    if (!this.activeGroupId()) {
      this.snackBar.open('Select a domain group before creating a rule.', 'Dismiss', {
        duration: 4000
      });
      return;
    }

    const dialogRef = this.dialog.open(RedirectRuleFormDialogComponent, {
      width: '520px',
      data: {
        domainGroupId: this.activeGroupId()
      }
    });

    dialogRef.afterClosed().subscribe((created) => {
      const filter = this.filterParams();
      if (created && filter) {
        this.redirectRuleStore.searchList(filter, true);
      }
    });
  }

  confirmDelete(ruleId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete redirect rule',
        message: 'This rule will no longer be evaluated during routing.',
        confirmLabel: 'Delete',
        tone: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.redirectRuleStore.remove(ruleId);
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
