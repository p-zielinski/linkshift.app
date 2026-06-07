import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounce, form, required, FormField } from '@angular/forms/signals';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { RedirectTestStore } from '../../core/store/redirect-test.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { RedirectTestResultsStore } from '../../core/store/redirect-test-results.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { RunPendingTestsDialogComponent } from '../tests/run-pending-tests-dialog.component';
import {
  RedirectTestFormDialogComponent,
  type RedirectTestDialogData,
  type RedirectTestFormPrefill
} from '../tests/redirect-test-form-dialog.component';
import type {
  RedirectTest,
  RedirectTestListQuery,
  RedirectTestResult
} from '../../core/models/redirect-test.model';
import {
  RedirectRuleFormDialogComponent,
  type RedirectRuleDialogData,
  type RedirectRuleDialogResult,
  type RedirectRuleDialogResumeData,
  type RedirectRuleLinkMapWizardRequest,
} from './redirect-rule-form-dialog.component';
import {
  LinkMapFormDialogComponent,
  type LinkMapDialogData,
  type LinkMapDialogResult,
} from '../link-maps/link-map-form-dialog.component';
import type { RedirectRule, RedirectRuleListQuery } from '../../core/models/redirect-rule.model';
import { AuthStore } from '../../core/store/auth.store';
import { getFilterKey } from '../../core/store/entity/entity-store.utils';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { ResourceTableCardComponent } from '../../shared/components/resource-table-card/resource-table-card.component';
import { attachPageWorkspaceFilter } from '../../core/layout/attach-page-workspace.util';
import { RedirectRulesTableComponent } from './components/redirect-rules-table/redirect-rules-table.component';
import {
  RedirectTestsSummaryCardComponent,
} from './components/redirect-tests-summary-card/redirect-tests-summary-card.component';
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
import {
  REDIRECT_RULES_LIST_LIMIT,
  nextRedirectRulePageFilterToFetch,
  planRedirectRulePages,
} from '../../core/utils/redirect-rules-list.util';
import { areRowsEqualByIdAndUpdatedAt } from '../../core/utils/signal-list-equality.util';
import { registerStoreRefreshOnVisibility } from '../../core/store/store-visibility-refresh.util';

@Component({
  selector: 'app-redirect-rules-page',
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
    RedirectRulesTableComponent,
    RedirectTestsSummaryCardComponent
  ],
  templateUrl: './redirect-rules-page.component.html',
  styleUrl: './redirect-rules-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectRulesPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly redirectTestResultsStore = inject(RedirectTestResultsStore);
  private readonly redirectTestStore = inject(RedirectTestStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly domainGroupFilterPersistence = inject(DomainGroupFilterPersistenceService);
  private readonly dashboardMode = inject(DashboardModeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly showPageLevelWorkspaceFilter = this.dashboardMode.showPageLevelWorkspaceFilter;
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly pageLimitOptions = [20, 50, REDIRECT_RULES_LIST_LIMIT];
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
  readonly activeGroupLabel = computed(() => {
    const groupId = this.activeGroupId();

    return this.groupMap()[groupId]?.name ?? groupId;
  });

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

  readonly filterParams = computed((): RedirectRuleListQuery | null => {
    const baseFilter = this.baseFilter();
    if (!baseFilter) {
      return null;
    }

    return buildCursorPageFilter(
      baseFilter,
      this.page(),
      Math.min(this.pageLimit(), REDIRECT_RULES_LIST_LIMIT),
      this.pageCursors(),
    );
  });

  readonly rules = computed(
    () => {
      const filter = this.filterParams();
      if (!filter) {
        return [];
      }
      return this.redirectRuleStore.selectList(filter)();
    },
    { equal: areRowsEqualByIdAndUpdatedAt },
  );

  readonly listResult = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return null;
    }
    return this.redirectRuleStore.selectListResult(filter)();
  });

  readonly listExpiration = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return null;
    }
    return this.redirectRuleStore.selectListExpiration(filter)();
  });

  readonly hasNextPage = computed(() => !!this.listResult()?.moreStartingAfterId);

  readonly loading = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return false;
    }
    const key = getFilterKey(filter);
    return !!this.redirectRuleStore.isLoading()[key];
  });

  readonly tests = computed(
    () => {
      const groupId = this.activeGroupId();
      if (!groupId) {
        return [] as RedirectTest[];
      }

      const tests: RedirectTest[] = [];
      for (const filter of this.redirectTestPageResultsForGroup(groupId).filters) {
        tests.push(...this.redirectTestStore.selectList(filter as RedirectTestListQuery)());
      }
      return tests;
    },
    { equal: areRowsEqualByIdAndUpdatedAt },
  );

  readonly testsLoading = computed(() => {
    const groupId = this.activeGroupId();
    if (!groupId) {
      return false;
    }

    const pageResults = this.redirectTestPageResultsForGroup(groupId);
    const firstResult = pageResults.results[0];
    if (firstResult === null || firstResult === undefined) {
      return true;
    }

    const loading = this.redirectTestStore.isLoading();
    for (const filter of pageResults.filters) {
      if (loading[getFilterKey(filter)]) {
        return true;
      }
    }

    const loadedKeys = new Set(
      pageResults.filters
        .filter((filter) => this.redirectTestStore.selectListResult(filter as RedirectTestListQuery)() !== null)
        .map((filter) => getFilterKey(filter)),
    );

    return (
      nextRedirectRulePageFilterToFetch(
        groupId,
        pageResults.results,
        loadedKeys,
        getFilterKey,
        (filter) => this.redirectTestStore.selectListExpiration(filter as RedirectTestListQuery)(),
      ) !== null
    );
  });

  readonly testsError = computed(() => {
    if (!this.activeGroupId()) {
      return null;
    }
    return this.redirectTestStore.lastError();
  });

  private readonly pendingDelete = createPendingCursorDeleteRefs();

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
        this.redirectRuleStore.searchList(filter);
      }
    });

    effect(() => {
      this.activeGroupId();
      untracked(() => this.redirectTestStore.clearError());
    });

    effect(() => {
      const groupId = this.activeGroupId();
      if (!groupId) {
        return;
      }

      const pageResults = this.redirectTestPageResultsForGroup(groupId);
      const loading = this.redirectTestStore.isLoading();

      untracked(() => {
        const loadedKeys = new Set(
          pageResults.filters
            .filter(
              (filter) =>
                this.redirectTestStore.selectListResult(filter as RedirectTestListQuery)() !== null,
            )
            .map((filter) => getFilterKey(filter)),
        );

        const nextFilter = nextRedirectRulePageFilterToFetch(
          groupId,
          pageResults.results,
          loadedKeys,
          getFilterKey,
          (filter) => this.redirectTestStore.selectListExpiration(filter as RedirectTestListQuery)(),
        );

        if (!nextFilter || loading[getFilterKey(nextFilter)]) {
          return;
        }

        this.redirectTestStore.searchList(nextFilter as RedirectTestListQuery);
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
      const error = this.redirectRuleStore.lastError();
      if (error) {
        untracked(() => {
          this.snackBar.open(error, 'Dismiss', { duration: 4000 });
          this.redirectRuleStore.clearError();
        });
      }
    });

    registerRefreshCursorListAfterDeleteEffect(
      this.pendingDelete,
      this.redirectRuleStore.isLoading,
      (currentPageItemCount) => this.refreshListAfterDelete(currentPageItemCount),
    );

    registerStoreRefreshOnVisibility(this.destroyRef, () => {
      const filter = this.filterParams();
      const listResult = this.listResult();
      const expiration = this.listExpiration();
      if (filter && needsCursorListFetch(listResult, expiration)) {
        this.redirectRuleStore.searchList(filter);
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

    this.openRuleDialog({
      domainGroupId: this.activeGroupId()
    });
  }

  openEditDialog(rule: RedirectRule): void {
    this.openRuleDialog({ rule });
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

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (confirmed) {
        beginPendingCursorDelete(this.pendingDelete, ruleId, this.rules().length);
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

  private openRuleDialog(data: RedirectRuleDialogData): void {
    const dialogRef = this.wizardDialog.openWizard<
      RedirectRuleFormDialogComponent,
      RedirectRuleDialogData,
      RedirectRuleDialogResult | boolean
    >(RedirectRuleFormDialogComponent, data);

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      this.handleRuleDialogClosed(result);
    });
  }

  private handleRuleDialogClosed(result: RedirectRuleDialogResult | boolean | undefined): void {
    if (result === false || result === undefined) {
      return;
    }

    const saved = typeof result === 'boolean' ? result : result.saved;
    if (saved) {
      this.refreshListAfterSave();
    }

    if (typeof result === 'boolean') {
      return;
    }

    if (result.openTestWizard && result.testPrefill) {
      this.openTestWizard(result.testPrefill);
      return;
    }

    if (result.openLinkMapWizard && result.resumeRuleDialog) {
      this.openLinkMapWizardThenResumeRuleDialog(result.openLinkMapWizard, result.resumeRuleDialog);
    }
  }

  private openLinkMapWizardThenResumeRuleDialog(
    request: RedirectRuleLinkMapWizardRequest,
    resume: RedirectRuleDialogResumeData,
  ): void {
    const dialogRef = this.wizardDialog.openWizard<
      LinkMapFormDialogComponent,
      LinkMapDialogData,
      LinkMapDialogResult
    >(LinkMapFormDialogComponent, {
      domainGroupId: request.domainGroupId,
      linkMapId: request.linkMapId,
    }, 0, { size: 'compact' });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((linkMapResult) => {
      if (linkMapResult?.saved) {
        this.linkMapStore.searchList({ domainGroupId: request.domainGroupId }, true);
        this.usageStore.invalidateUsage();
        this.usageStore.loadUsage(true);
      }

      const draft = { ...resume.draft };
      if (linkMapResult?.saved && linkMapResult.linkMapId && !request.linkMapId) {
        draft.linkMapId = linkMapResult.linkMapId;
      }

      this.openRuleDialog({
        rule: resume.rule,
        domainGroupId: resume.rule ? undefined : draft.domainGroupId,
        resumeDraft: draft,
        activeStepId: resume.activeStepId,
      });
    });
  }

  private openTestWizard(prefill: RedirectTestFormPrefill): void {
    const groupId = prefill.domainGroupId ?? this.activeGroupId();
    const dialogRef = this.wizardDialog.openWizard<
      RedirectTestFormDialogComponent,
      RedirectTestDialogData,
      boolean
    >(RedirectTestFormDialogComponent, {
      domainGroupId: groupId,
      prefill
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((created) => {
      if (created && groupId && this.activeGroupId() === groupId) {
        this.redirectTestStore.invalidateList();
        this.redirectTestStore.searchList(
          { domainGroupId: groupId, limit: REDIRECT_RULES_LIST_LIMIT },
          true,
        );
      }
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

    this.redirectRuleStore.invalidateList();
    this.page.set(1);
    this.pageCursors.set({ 1: null });
    this.redirectRuleStore.searchList(
      buildCursorPageFilter(
        baseFilter,
        1,
        Math.min(this.pageLimit(), REDIRECT_RULES_LIST_LIMIT),
        { 1: null },
      ),
      true,
    );
  }

  private refreshListAfterDelete(currentPageItemCount: number): void {
    refreshCursorListAfterDelete<
      { domainGroupId: string; search?: string },
      RedirectRuleListQuery
    >({
      baseFilter: this.baseFilter(),
      page: this.page,
      pageLimit: Math.min(this.pageLimit(), REDIRECT_RULES_LIST_LIMIT),
      pageCursors: this.pageCursors,
      currentPageItemCount,
      store: this.redirectRuleStore,
    });
  }

  private redirectTestPageResultsForGroup(domainGroupId: string) {
    return planRedirectRulePages(domainGroupId, (filter) =>
      this.redirectTestStore.selectListResult(filter as RedirectTestListQuery)(),
    );
  }

  private compareResults(expected: RedirectTestResult, actual: RedirectTestResult): boolean {
    return (
      expected.matched === actual.matched &&
      expected.statusCode === actual.statusCode &&
      (expected.target ?? null) === (actual.target ?? null)
    );
  }
}
