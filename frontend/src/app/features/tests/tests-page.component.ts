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
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { RedirectTestStore } from '../../core/store/redirect-test.store';
import {
  RedirectTestResultsStore,
  type RedirectTestRunState
} from '../../core/store/redirect-test-results.store';
import { RedirectTestFormDialogComponent } from './redirect-test-form-dialog.component';
import { RedirectTestResultDialogComponent } from './redirect-test-result-dialog.component';
import { RunPendingTestsDialogComponent } from './run-pending-tests-dialog.component';
import type { RedirectTest, RedirectTestResult } from '../../core/models/redirect-test.model';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import { buildSimulationEntry } from './redirect-test.utils';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tests-page',
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
    TablePaginatorComponent
  ],
  templateUrl: './tests-page.component.html',
  styleUrl: './tests-page.component.css'
})
export class TestsPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly redirectTestStore = inject(RedirectTestStore);
  private readonly redirectTestResultsStore = inject(RedirectTestResultsStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly redirectRulesApi = inject(RedirectRulesApiService);

  readonly columns = ['path', 'expected', 'result', 'actions'];
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly pageLimitOptions = [100];
  readonly pageLimit = signal(100);
  readonly page = signal(1);
  readonly pageCursors = signal<Record<number, string | null>>({ 1: null });
  readonly runningTestIds = signal<Set<string>>(new Set());

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

  readonly tests = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return [] as RedirectTest[];
    }
    return this.redirectTestStore.selectList(filter)();
  });

  readonly listResult = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return null;
    }
    return this.redirectTestStore.selectListResult(filter)();
  });

  readonly hasNextPage = computed(() => !!this.listResult()?.moreStartingAfterId);

  constructor() {
    this.domainGroupStore.searchList();

    effect(() => {
      this.baseFilter();
      this.page.set(1);
      this.pageCursors.set({ 1: null });
    });

    effect(() => {
      const filter = this.filterParams();
      const listResult = this.listResult();
      if (filter && !listResult) {
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
      const error = this.redirectTestStore.lastError();
      if (error) {
        this.snackBar.open(error, 'Dismiss', { duration: 4000 });
        this.redirectTestStore.clearError();
      }
    });
  }

  openCreateDialog(): void {
    if (!this.activeGroupId()) {
      this.snackBar.open('Select a domain group before creating a test.', 'Dismiss', {
        duration: 4000
      });
      return;
    }

    const dialogRef = this.dialog.open(RedirectTestFormDialogComponent, {
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

  openEditDialog(test: RedirectTest): void {
    const dialogRef = this.dialog.open(RedirectTestFormDialogComponent, {
      width: 'calc(100vw - 60px)',
      maxWidth: 'calc(100vw - 60px)',
      height: 'calc(100vh - 60px)',
      maxHeight: 'calc(100vh - 60px)',
      data: {
        test
      }
    });

    dialogRef.afterClosed().subscribe((saved) => {
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
        tone: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
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
        runState: this.resolveRunState(test)
      }
    });
  }

  async runSingleTest(test: RedirectTest): Promise<void> {
    if (!this.canRunTest(test)) {
      return;
    }

    this.setRunning(test.id, true);
    try {
      const response = await firstValueFrom(
        this.redirectRulesApi.simulate([buildSimulationEntry(test)])
      );
      const result = response?.results?.[0];
      if (!result) {
        throw new Error('No result returned.');
      }

      const lastResult: RedirectTestResult = {
        matched: result.matched,
        statusCode: result.statusCode,
        target: result.target ?? null
      };

      this.redirectTestResultsStore.setSuccess(test.id, lastResult);

      const matches = this.compareResults(test.expectedResult, lastResult);
      const message = matches
        ? 'Test passed.'
        : 'Test failed. Review details for differences.';
      this.snackBar.open(message, 'Dismiss', { duration: 3000 });
    } catch (error) {
      const message = extractErrorMessage(error, 'Test run failed.');
      this.redirectTestResultsStore.setFailure(test.id, message);
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    } finally {
      this.setRunning(test.id, false);
    }
  }

  canRunTest(test: RedirectTest): boolean {
    return !this.showResultDetails(test) && !this.runningTestIds().has(test.id);
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
        domainGroupId: this.activeGroupId()
      }
    });
  }

  formatExpectedResult(test: RedirectTest): string {
    const expected = test.expectedResult;
    if (!expected) {
      return 'Expectation not set';
    }
    if (!expected.matched) {
      return 'No redirect (404)';
    }
    if (!expected.target) {
      return `${expected.statusCode} (missing target)`;
    }
    return `${expected.statusCode} -> ${expected.target}`;
  }

  formatActualResult(test: RedirectTest): string {
    const runState = this.resolveRunState(test);
    if (runState?.lastError) {
      return runState.lastError;
    }
    if (!runState?.lastResult) {
      return '';
    }

    const { statusCode, target, matched } = runState.lastResult;
    if (!matched) {
      return 'No redirect (404)';
    }
    if (!target) {
      return `${statusCode} (no target)`;
    }
    return `${statusCode} -> ${target}`;
  }

  statusLabel(test: RedirectTest): string {
    const status = this.computeStatus(test);
    return status.label;
  }

  statusClass(test: RedirectTest): string {
    const status = this.computeStatus(test);
    return status.tone;
  }

  showResultDetails(test: RedirectTest): boolean {
    const status = this.computeStatus(test);
    return status.kind !== 'pending';
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
      {
        ...baseFilter,
        limit: this.pageLimit()
      },
      true
    );
  }

  private resolveRunState(test: RedirectTest): RedirectTestRunState | null {
    return this.redirectTestResultsStore.results()[test.id] ?? null;
  }

  private computeStatus(test: RedirectTest): {
    label: string;
    kind: 'pending' | 'success' | 'warning' | 'danger';
    tone: string;
  } {
    const runState = this.resolveRunState(test);
    const expected = test.expectedResult;

    if (!runState || (!runState.lastRunAt && !runState.lastResult && !runState.lastError)) {
      return {
        label: 'Not run',
        kind: 'pending',
        tone: 'status-pill status-pill--pending'
      };
    }

    if (runState.lastError) {
      return {
        label: 'Error',
        kind: 'danger',
        tone: 'status-pill status-pill--danger'
      };
    }

    if (!runState.lastResult || !expected) {
      return {
        label: 'Needs review',
        kind: 'warning',
        tone: 'status-pill status-pill--warning'
      };
    }

    const matches = this.compareResults(expected, runState.lastResult);
    if (matches) {
      return {
        label: 'Passed',
        kind: 'success',
        tone: 'status-pill status-pill--success'
      };
    }

    return {
      label: 'Failed',
      kind: 'danger',
      tone: 'status-pill status-pill--danger'
    };
  }

  private compareResults(expected: RedirectTestResult, actual: RedirectTestResult): boolean {
    return (
      expected.matched === actual.matched &&
      expected.statusCode === actual.statusCode &&
      (expected.target ?? null) === (actual.target ?? null)
    );
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
}
