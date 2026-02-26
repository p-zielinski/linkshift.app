import {
  Component,
  computed,
  effect,
  inject,
  signal,
  EnvironmentInjector,
  runInInjectionContext
} from '@angular/core';
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
import { toObservable } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ResourcePillComponent } from '../../shared/components/resource-pill/resource-pill.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { RedirectTestStore } from '../../core/store/redirect-test.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { RedirectTestResultsStore } from '../../core/store/redirect-test-results.store';
import { RunPendingTestsDialogComponent } from '../tests/run-pending-tests-dialog.component';
import {
  RedirectTestFormDialogComponent,
  type RedirectTestFormPrefill
} from '../tests/redirect-test-form-dialog.component';
import type {
  RedirectTest,
  RedirectTestListQuery,
  RedirectTestResult
} from '../../core/models/redirect-test.model';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { combineLatest, filter, firstValueFrom, take } from 'rxjs';
import { RedirectRuleFormDialogComponent } from './redirect-rule-form-dialog.component';
import type { RedirectRuleDialogResult } from './redirect-rule-form-dialog.component';
import type { RedirectRule } from '../../core/models/redirect-rule.model';
import { AuthStore } from '../../core/store/auth.store';
import { getFilterKey } from '../../core/store/entity/entity-store.utils';

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
  templateUrl: './redirect-rules-page.component.html',
  styleUrl: './redirect-rules-page.component.css'
})
export class RedirectRulesPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly redirectTestResultsStore = inject(RedirectTestResultsStore);
  private readonly redirectTestStore = inject(RedirectTestStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly envInjector = inject(EnvironmentInjector);

  readonly columns = [
    'priority',
    'id',
    'matchMethod',
    'matchMode',
    'source',
    'destination',
    'statusCode',
    'state',
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

  readonly tests = signal<RedirectTest[]>([]);
  readonly testsLoading = signal(false);
  readonly testsError = signal<string | null>(null);
  private testsLoadSequence = 0;

  readonly testsMetrics = computed(() => {
    const tests = this.tests();
    const results = this.redirectTestResultsStore.results();

    let passed = 0;
    let failed = 0;
    let errored = 0;
    let notRun = 0;

    tests.forEach((test) => {
      const runState = results[test.id];
      if (!runState) {
        notRun += 1;
        return;
      }
      if (runState.lastError) {
        errored += 1;
        return;
      }
      if (!runState.lastResult) {
        notRun += 1;
        return;
      }
      if (this.compareResults(test.expectedResult, runState.lastResult)) {
        passed += 1;
      } else {
        failed += 1;
      }
    });

    const total = tests.length;
    const runCount = passed + failed + errored;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      total,
      passed,
      failed,
      errored,
      notRun,
      runCount,
      passRate
    };
  });

  readonly groupMap = computed(() => {
    const map: Record<string, { name: string } | undefined> = {};
    for (const group of this.domainGroups()) {
      map[group.id] = { name: group.name };
    }
    return map;
  });

  constructor() {
    if (this.authStore.isAuthenticated()) {
      this.domainGroupStore.searchList();
    }

    effect(() => {
      this.baseFilter();
      this.page.set(1);
      this.pageCursors.set({ 1: null });
    });

    effect(() => {
      const filter = this.filterParams();
      const listResult = this.listResult();
      if (filter && !listResult) {
        this.redirectRuleStore.searchList(filter);
      }
    });

    effect(() => {
      const groupId = this.activeGroupId();
      if (!groupId) {
        this.tests.set([]);
        this.testsError.set(null);
        this.testsLoading.set(false);
        return;
      }
      queueMicrotask(() => {
        if (this.activeGroupId() !== groupId) {
          return;
        }
        this.loadTestsSnapshot(groupId);
      });
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

    dialogRef.afterClosed().subscribe((result: RedirectRuleDialogResult | boolean) => {
      const saved = typeof result === 'boolean' ? result : result?.saved;
      if (saved) {
        this.refreshListAfterSave();
      }
      if (typeof result !== 'boolean' && result?.openTestWizard && result.testPrefill) {
        this.openTestWizard(result.testPrefill);
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

    dialogRef.afterClosed().subscribe((result: RedirectRuleDialogResult | boolean) => {
      const saved = typeof result === 'boolean' ? result : result?.saved;
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
        this.redirectTestResultsStore.clearAll();
        this.redirectRuleStore.remove(ruleId);
      }
    });
  }

  runTests(): void {
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

  private openTestWizard(prefill: RedirectTestFormPrefill): void {
    const groupId = prefill.domainGroupId ?? this.activeGroupId();
    const dialogRef = this.dialog.open(RedirectTestFormDialogComponent, {
      width: 'calc(100vw - 60px)',
      maxWidth: 'calc(100vw - 60px)',
      height: 'calc(100vh - 60px)',
      maxHeight: 'calc(100vh - 60px)',
      data: {
        domainGroupId: groupId,
        prefill
      }
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created && groupId && this.activeGroupId() === groupId) {
        this.loadTestsSnapshot(groupId);
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

  pathMatchIcon(rule: RedirectRule): string {
    return rule.pathMatch === 'prefix' ? 'call_split' : 'rule';
  }

  pathMatchTooltip(rule: RedirectRule): string {
    return rule.pathMatch === 'prefix'
      ? 'Path match: prefix (/v1/*)'
      : 'Path match: exact';
  }

  queryMatchIcon(rule: RedirectRule): string {
    if (rule.queryMatch === 'ignore') {
      return 'search_off';
    }
    if (rule.queryMatch === 'subset') {
      return 'filter_alt';
    }
    return 'manage_search';
  }

  queryMatchTooltip(rule: RedirectRule): string {
    if (rule.queryMatch === 'ignore') {
      return 'Query match: ignore';
    }
    if (rule.queryMatch === 'subset') {
      return 'Query match: subset (extra params allowed)';
    }
    return 'Query match: exact (includes query)';
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

  private async loadTestsSnapshot(groupId: string): Promise<void> {
    const currentSequence = ++this.testsLoadSequence;
    this.testsLoading.set(true);
    this.testsError.set(null);
    this.tests.set([]);

    const collected: RedirectTest[] = [];
    let cursor: string | undefined;

    try {
      do {
        const filterParams: RedirectTestListQuery = {
          domainGroupId: groupId,
          limit: 100,
          ...(cursor ? { startAfterId: cursor } : {})
        };

        const filterKey = getFilterKey(filterParams);
        this.redirectTestStore.searchList(filterParams, true);
        const [result] = await firstValueFrom(
          runInInjectionContext(this.envInjector, () =>
            combineLatest([
              toObservable(this.redirectTestStore.selectListResult(filterParams)),
              toObservable(
                computed(() => this.redirectTestStore.isLoading()[filterKey] ?? false)
              )
            ]).pipe(
              filter(([value, loading]) => value !== null && !loading),
              take(1)
            )
          )
        );

        if (currentSequence !== this.testsLoadSequence) {
          return;
        }

        collected.push(...this.redirectTestStore.selectList(filterParams)());
        cursor = result?.moreStartingAfterId ?? undefined;

        const storeError = this.redirectTestStore.lastError();
        if (storeError) {
          this.testsError.set(storeError);
          this.redirectTestStore.clearError();
        }
      } while (cursor);

      if (currentSequence === this.testsLoadSequence) {
        this.tests.set(collected);
      }
    } catch (error) {
      if (currentSequence === this.testsLoadSequence) {
        this.tests.set([]);
        this.testsError.set(extractErrorMessage(error, 'Failed to load tests.'));
      }
    } finally {
      if (currentSequence === this.testsLoadSequence) {
        this.testsLoading.set(false);
      }
    }
  }

  private compareResults(expected: RedirectTestResult, actual: RedirectTestResult): boolean {
    return (
      expected.matched === actual.matched &&
      expected.statusCode === actual.statusCode &&
      (expected.target ?? null) === (actual.target ?? null)
    );
  }
}
