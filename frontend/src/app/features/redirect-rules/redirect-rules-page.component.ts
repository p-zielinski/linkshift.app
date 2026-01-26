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
  templateUrl: './redirect-rules-page.component.html'
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
