import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounce, form, required, FormField } from '@angular/forms/signals';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { RedirectTestStore } from '../../core/store/redirect-test.store';
import { RedirectTestResultsStore } from '../../core/store/redirect-test-results.store';
import {
  RedirectTestFormDialogComponent,
  type RedirectTestDialogData,
} from './redirect-test-form-dialog.component';
import { RedirectTestResultDialogComponent } from './redirect-test-result-dialog.component';
import { RunPendingTestsDialogComponent } from './run-pending-tests-dialog.component';
import type {
  RedirectTest,
  RedirectTestListQuery,
  RedirectTestResult,
} from '../../core/models/redirect-test.model';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import { buildSimulationEntry } from './redirect-test.utils';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { ResourceTableCardComponent } from '../../shared/components/resource-table-card/resource-table-card.component';
import { attachPageWorkspaceFilter } from '../../core/layout/attach-page-workspace.util';
import { TestsTableComponent } from './components/tests-table/tests-table.component';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import {
  beginPendingCursorDelete,
  buildCursorPageFilter,
  createPendingCursorDeleteRefs,
  needsCursorListFetch,
  refreshCursorListAfterDelete,
  registerRefreshCursorListAfterDeleteEffect,
} from '../../core/utils/cursor-list-pagination.util';
import { getFilterKey } from '../../core/store/entity/entity-store.utils';
import { areRowsEqualByIdAndUpdatedAt } from '../../core/utils/signal-list-equality.util';
import { registerStoreRefreshOnVisibility } from '../../core/store/store-visibility-refresh.util';

@Component({
  selector: 'app-tests-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormField,
    TablePaginatorComponent,
    ResourcePageShellComponent,
    ResourceCardComponent,
    ResourceTableCardComponent,
    TestsTableComponent,
  ],
  templateUrl: './tests-page.component.html',
  styleUrl: './tests-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestsPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly redirectTestStore = inject(RedirectTestStore);
  private readonly redirectTestResultsStore = inject(RedirectTestResultsStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly redirectRulesApi = inject(RedirectRulesApiService);
  private readonly domainGroupFilterPersistence = inject(DomainGroupFilterPersistenceService);
  private readonly dashboardMode = inject(DashboardModeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly showPageLevelWorkspaceFilter = this.dashboardMode.showPageLevelWorkspaceFilter;
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly pageLimitOptions = [10, 20, 50, 100];
  readonly pageLimit = signal(20);
  readonly page = signal(1);
  readonly pageCursors = signal<Record<number, string | null>>({ 1: null });
  readonly runningTestIds = signal<Set<string>>(new Set());
  private readonly pendingDelete = createPendingCursorDeleteRefs();

  filterModel = signal({
    domainGroupId: '',
    search: '',
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
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
    };
  });

  readonly filterParams = computed((): RedirectTestListQuery | null => {
    const baseFilter = this.baseFilter();
    if (!baseFilter) {
      return null;
    }

    return buildCursorPageFilter(
      baseFilter,
      this.page(),
      this.pageLimit(),
      this.pageCursors(),
    );
  });

  readonly tests = computed(
    () => {
      const filter = this.filterParams();
      if (!filter) {
        return [] as RedirectTest[];
      }
      return this.redirectTestStore.selectList(filter)();
    },
    { equal: areRowsEqualByIdAndUpdatedAt },
  );

  readonly listResult = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return null;
    }
    return this.redirectTestStore.selectListResult(filter)();
  });

  readonly listExpiration = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return null;
    }
    return this.redirectTestStore.selectListExpiration(filter)();
  });

  readonly listReady = computed(() => !!this.listResult());
  readonly hasNextPage = computed(() => !!this.listResult()?.moreStartingAfterId);

  readonly loading = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return false;
    }
    const key = getFilterKey(filter);
    return !!this.redirectTestStore.isLoading()[key];
  });
  readonly runStates = computed(() => this.redirectTestResultsStore.results());

  constructor() {
    if (this.authStore.isAuthenticated()) {
      this.domainGroupStore.searchList();
    }

    this.domainGroupFilterPersistence.bind(this.filterModel, this.domainGroups, {
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
      this.baseFilter();
      this.page.set(1);
      this.pageCursors.set({ 1: null });
    });

    effect(() => {
      const filter = this.filterParams();
      const listResult = this.listResult();
      const expiration = this.listExpiration();
      if (filter && needsCursorListFetch(listResult, expiration)) {
        this.redirectTestStore.searchList(filter);
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
      const error = this.redirectTestStore.lastError();
      if (error) {
        this.snackBar.open(error, 'Dismiss', { duration: 4000 });
        this.redirectTestStore.clearError();
      }
    });

    registerRefreshCursorListAfterDeleteEffect(
      this.pendingDelete,
      this.redirectTestStore.isLoading,
      (currentPageItemCount) => this.refreshListAfterDelete(currentPageItemCount),
    );

    registerStoreRefreshOnVisibility(this.destroyRef, () => {
      const filter = this.filterParams();
      const listResult = this.listResult();
      const expiration = this.listExpiration();
      if (filter && needsCursorListFetch(listResult, expiration)) {
        this.redirectTestStore.searchList(filter);
      }
    });
  }

  openCreateDialog(): void {
    if (!this.activeGroupId()) {
      this.snackBar.open('Select a domain group before creating a test.', 'Dismiss', {
        duration: 4000,
      });
      return;
    }

    const dialogRef = this.wizardDialog.openWizard<
      RedirectTestFormDialogComponent,
      RedirectTestDialogData,
      boolean
    >(RedirectTestFormDialogComponent, {
      domainGroupId: this.activeGroupId(),
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((created) => {
      if (created) {
        this.refreshListAfterSave();
      }
    });
  }

  openEditDialog(test: RedirectTest): void {
    const dialogRef = this.wizardDialog.openWizard<
      RedirectTestFormDialogComponent,
      RedirectTestDialogData,
      boolean
    >(RedirectTestFormDialogComponent, {
      test,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((saved) => {
      if (saved) {
        this.refreshListAfterSave();
      }
    });
  }

  confirmDelete(test: RedirectTest): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete redirect test',
        message: 'This test will be removed and no longer tracked.',
        confirmLabel: 'Delete',
        tone: 'warning',
      },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (confirmed) {
        beginPendingCursorDelete(this.pendingDelete, test.id, this.tests().length);
        this.redirectTestResultsStore.clearByIds([test.id]);
        this.redirectTestStore.remove(test.id);
      }
    });
  }

  openResultDialog(test: RedirectTest): void {
    this.dialog.open(RedirectTestResultDialogComponent, {
      width: 'min(720px, 94vw)',
      maxWidth: '94vw',
      data: {
        test,
        runState: this.runStates()[test.id] ?? null,
      },
    });
  }

  async runSingleTest(test: RedirectTest): Promise<void> {
    this.setRunning(test.id, true);
    try {
      const response = await firstValueFrom(
        this.redirectRulesApi.simulate([buildSimulationEntry(test)]),
      );
      const result = response?.results?.[0];
      if (!result) {
        throw new Error('No result returned.');
      }

      const lastResult: RedirectTestResult = {
        matched: result.matched,
        statusCode: result.statusCode,
        target: result.target ?? null,
      };

      this.redirectTestResultsStore.setSuccess(test.id, lastResult);

      const matches = this.compareResults(test.expectedResult, lastResult);
      const message = matches ? 'Test passed.' : "Test didn't pass. Review details for differences.";
      this.snackBar.open(message, 'Dismiss', { duration: 3000 });
    } catch (error) {
      const message = extractErrorMessage(error, "Couldn't run test.");
      this.redirectTestResultsStore.setFailure(test.id, message);
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    } finally {
      this.setRunning(test.id, false);
    }
  }

  runPendingTests(): void {
    if (!this.activeGroupId()) {
      return;
    }

    this.dialog.open(RunPendingTestsDialogComponent, {
      width: 'min(560px, 94vw)',
      maxWidth: '94vw',
      disableClose: true,
      data: {
        domainGroupId: this.activeGroupId(),
      },
    });
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

    this.redirectTestStore.invalidateList();
    this.page.set(1);
    this.pageCursors.set({ 1: null });
    this.redirectTestStore.searchList(
      buildCursorPageFilter(baseFilter, 1, this.pageLimit(), { 1: null }),
      true,
    );
  }

  private refreshListAfterDelete(currentPageItemCount: number): void {
    refreshCursorListAfterDelete<
      { domainGroupId: string; search?: string },
      RedirectTestListQuery
    >({
      baseFilter: this.baseFilter(),
      page: this.page,
      pageLimit: this.pageLimit(),
      pageCursors: this.pageCursors,
      currentPageItemCount,
      store: this.redirectTestStore,
    });
  }

  private setRunning(testId: string, running: boolean): void {
    this.runningTestIds.update((current) => {
      const next = new Set(current);
      if (running) {
        next.add(testId);
      } else {
        next.delete(testId);
      }
      return next;
    });
  }

  private compareResults(expected: RedirectTestResult, actual: RedirectTestResult): boolean {
    return (
      expected.matched === actual.matched &&
      expected.statusCode === actual.statusCode &&
      (expected.target ?? null) === (actual.target ?? null)
    );
  }
}
