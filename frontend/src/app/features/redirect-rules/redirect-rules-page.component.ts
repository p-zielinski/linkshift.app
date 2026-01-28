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
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { RedirectRuleFormDialogComponent } from './redirect-rule-form-dialog.component';
import type { RedirectRule } from '../../core/models/redirect-rule.model';

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
    ResourcePillComponent,
    TablePaginatorComponent
  ],
  templateUrl: './redirect-rules-page.component.html'
})
export class RedirectRulesPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly columns = [
    'priority',
    'id',
    'matchMethod',
    'source',
    'destination',
    'statusCode',
    'group',
    'createdAt',
    'actions'
  ];
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly pageLimitOptions = [20];
  readonly pageLimit = signal(20);
  readonly page = signal(1);
  readonly pageCursors = signal<Record<number, string | null>>({ 1: null });

  filterModel = signal({
    domainGroupId: '',
    search: ''
  });

  filterForm = form(this.filterModel, (f) => {
    required(f.domainGroupId);
    debounce(f.search, 350);
  });

  readonly activeGroupId = computed(() => this.filterModel().domainGroupId || '');

  readonly baseFilter = computed(() => {
    const { domainGroupId, search } = this.filterModel();
    if (!domainGroupId) {
      return null;
    }

    const trimmedSearch = search.trim();
    return {
      domainGroupId,
      ...(trimmedSearch ? { search: trimmedSearch } : {})
    };
  });

  readonly filterParams = computed(() => {
    const baseFilter = this.baseFilter();
    if (!baseFilter) {
      return null;
    }

    const cursor = this.pageCursors()[this.page()];
    return {
      ...baseFilter,
      limit: this.pageLimit(),
      ...(cursor ? { startAfterId: cursor } : {})
    };
  });

  readonly rules = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return [];
    }
    return this.redirectRuleStore.selectList(filter)();
  });

  readonly listResult = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return null;
    }
    return this.redirectRuleStore.selectListResult(filter)();
  });

  readonly hasNextPage = computed(() => !!this.listResult()?.moreStartingAfterId);

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
      this.baseFilter();
      this.page.set(1);
      this.pageCursors.set({ 1: null });
    });

    effect(() => {
      const filter = this.filterParams();
      if (filter) {
        this.redirectRuleStore.searchList(filter);
      }
    });

    effect(() => {
      const result = this.listResult();
      const currentPage = this.page();
      if (!result?.moreStartingAfterId) {
        return;
      }

      const nextCursor = result.moreStartingAfterId;
      this.pageCursors.update((cursors) => {
        const nextPage = currentPage + 1;
        if (cursors[nextPage] === nextCursor) {
          return cursors;
        }
        return { ...cursors, [nextPage]: nextCursor };
      });
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
      width: 'calc(100vw - 60px)',
      maxWidth: 'calc(100vw - 60px)',
      height: 'calc(100vh - 60px)',
      maxHeight: 'calc(100vh - 60px)',
      data: {
        domainGroupId: this.activeGroupId()
      }
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.refreshListAfterSave();
      }
    });
  }

  openEditDialog(rule: RedirectRule): void {
    const dialogRef = this.dialog.open(RedirectRuleFormDialogComponent, {
      width: 'calc(100vw - 60px)',
      maxWidth: 'calc(100vw - 60px)',
      height: 'calc(100vh - 60px)',
      maxHeight: 'calc(100vh - 60px)',
      data: {
        rule
      }
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshListAfterSave();
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
    return this.groupMap()[groupId]?.name ?? groupId;
  }

  groupTooltip(groupId: string): string {
    const name = this.groupMap()[groupId]?.name;
    return name
      ? `Domain group: ${name} (${groupId})`
      : `Domain group Id: ${groupId}`;
  }

  formatMatchMethods(methods: string[] | undefined): string {
    if (!methods || methods.length === 0) {
      return 'All';
    }
    return methods.join(', ');
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  onPageLimitChange(limit: number): void {
    this.pageLimit.set(limit);
    this.page.set(1);
    this.pageCursors.set({ 1: null });
  }

  private refreshListAfterSave(): void {
    const baseFilter = this.baseFilter();
    if (!baseFilter) {
      return;
    }

    this.redirectRuleStore.invalidateList();
    this.page.set(1);
    this.pageCursors.set({ 1: null });
    this.redirectRuleStore.searchList(
      {
        ...baseFilter,
        limit: this.pageLimit()
      },
      true
    );
  }
}
