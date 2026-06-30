import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
import { debounce, form, FormField } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import type { LinkMapEntry } from '../../core/models/link-map.model';
import type { AggregatedLinkRow, LinksListQuery } from '../../core/models/links-list.model';
import type { QueryResult } from '../../core/models/query-result.model';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import { LinksListStore } from '../../core/store/links-list.store';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { DEFAULT_LIST_KEY, getFilterKey } from '../../core/store/entity/entity-store.utils';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceTableCardComponent } from '../../shared/components/resource-table-card/resource-table-card.component';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import {
  buildGroupHostOptions,
  expandAggregatedLinkRowShortUrls,
  formatShortUrlsForClipboard,
  resolveSubdomainBaseHost,
  type LinksHostOption,
} from './links-aggregation.util';
import type { LinkMap } from '../../core/models/link-map.model';
import type { RedirectRule } from '../../core/models/redirect-rule.model';
import {
  CreateLinkWizardDialogComponent,
  type CreateLinkWizardDialogData,
  type CreateLinkWizardDialogResult,
} from './create-link-wizard-dialog.component';
import { LinkMapEntryFormDialogComponent } from '../link-maps/link-map-entry-form-dialog.component';
import {
  type LinkMapEntryDialogData,
  type LinkMapEntryDialogResult,
} from '../link-maps/link-map-entry-form-dialog.component';
import {
  EditLinkDialogComponent,
  type EditLinkDialogData,
  type EditLinkDialogResult,
} from './edit-link-dialog.component';
import { resolveLinksEditDialogTarget } from './links-edit-dialog.util';
import { LinksTableComponent } from './components/links-table/links-table.component';
import { DashboardContextService } from '../../core/layout/dashboard-context.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { resolveDashboardAnalyticsPath, LINK_MAP_ID_QUERY_PARAM } from '../../core/layout/dashboard-mode-toggle-navigation.util';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { attachPageWorkspaceFilter } from '../../core/layout/attach-page-workspace.util';
import { CampaignConnectDomainService } from '../campaign-connect-domain/campaign-connect-domain.service';
import { DashboardDialogQueueService } from '../dashboard/services/dashboard-dialog-queue.service';
import {
  CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY,
  resolveConnectDomainSuccessMessage,
} from '../campaign-connect-domain/campaign-connect-domain.util';
import type {
  CampaignConnectDomainDialogData,
  CampaignConnectDomainDialogResult,
} from '../campaign-connect-domain/campaign-connect-domain-dialog.component';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { AuthStore } from '../../core/store/auth.store';
import type { RedirectRuleListQuery } from '../../core/models/redirect-rule.model';
import {
  buildRedirectRuleListFilter,
  collectPaginatedRedirectRules,
  planRedirectRulePages,
} from '../../core/utils/redirect-rules-list.util';
import { needsCursorListFetch } from '../../core/utils/cursor-list-pagination.util';
import { areSortedIdListsEqual } from '../../core/utils/signal-list-equality.util';
import { refetchLoadedRedirectRulePagesForGroup } from './links-list-refresh.util';
import {
  isWaitingForDomainGroupsBeforeDialog,
  resolveLinksOpenCreateQueryAction,
  resolveLinksWaitingForDomainGroups,
  resolveLinksPageActiveGroupId,
  resolveLinksSyncFromDashboardContext,
  resolveLinksDataScopeGroupIds,
  isLinksAllSitesScope,
  collectLinkMapsForGroupIds,
  areAggregatedLinkRowsEqual,
  buildLinksListBaseFilter,
  resolveLinksListStartAfterId,
} from './links-page-scope.util';
import {
  countOrganizationHosts,
  organizationHasConnectedHosts,
} from '../../shared/components/setup-checklist/setup-checklist.auto-complete.util';

@Component({
  selector: 'app-links-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormField,
    ResourceCardComponent,
    ResourcePageShellComponent,
    ResourceTableCardComponent,
    LinksTableComponent,
    TablePaginatorComponent,
  ],
  templateUrl: './links-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinksPageComponent {
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly linksListStore = inject(LinksListStore);
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly domainStore = inject(DomainStore);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardContext = inject(DashboardContextService);
  private readonly dashboardModeService = inject(DashboardModeService);
  private readonly domainGroupFilterPersistence = inject(DomainGroupFilterPersistenceService);
  private readonly campaignConnectDomain = inject(CampaignConnectDomainService);
  private readonly dialogQueue = inject(DashboardDialogQueueService);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly authStore = inject(AuthStore);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly domainGroupsListLoaded = computed(
    () => !!this.domainGroupStore.list()[DEFAULT_LIST_KEY],
  );
  readonly hasDomainGroups = computed(() => this.domainGroups().length > 0);
  readonly isCampaignMode = computed(() => this.dashboardModeService.isCampaign());
  readonly showPageLevelWorkspaceFilter = this.dashboardModeService.showPageLevelWorkspaceFilter;
  /** /links is the only advanced page that may select "All sites" when multiple groups exist. */
  readonly allowAllSitesSelection = computed(() => this.domainGroups().length > 1);
  readonly subdomains = this.subdomainStore.selectList();
  readonly domains = this.domainStore.selectList();

  readonly filterModel = signal({ search: '', domainGroupId: '' });
  readonly linkMapFilterId = signal('');
  readonly filterForm = form(this.filterModel, (f) => {
    debounce(f.search, 300);
  });

  readonly activeGroupId = computed(() =>
    resolveLinksPageActiveGroupId({
      isCampaignMode: this.isCampaignMode(),
      pageFilterGroupId: this.filterModel().domainGroupId,
      shellSelectedGroupId: this.dashboardContext.selectedDomainGroupId(),
    }),
  );

  readonly isAllSitesScope = computed(() => isLinksAllSitesScope(this.activeGroupId()));

  readonly dataScopeGroupIds = computed(
    () => resolveLinksDataScopeGroupIds(this.domainGroups(), this.activeGroupId()),
    { equal: areSortedIdListsEqual },
  );

  readonly paginationResetKey = computed(
    () =>
      `${this.filterModel().search}\0${this.filterModel().domainGroupId}\0${this.activeGroupId()}\0${this.linkMapFilterId()}`,
  );

  private readonly pendingOpenCreateFromQuery = signal(false);
  private readonly pendingOpenConnectDomainFromQuery = signal(false);

  readonly subdomainBaseHost = computed(() => {
    const configuredBaseUrl = this.appConfig.APP_SUBDOMAIN_BASE_URL || this.appConfig.APP_BASE_URL;
    return resolveSubdomainBaseHost(configuredBaseUrl);
  });

  readonly hostCount = computed(() =>
    countOrganizationHosts(
      this.domainGroups(),
      this.subdomains(),
      this.domains(),
      this.subdomainBaseHost(),
    ),
  );
  readonly hasConnectedHosts = computed(() =>
    organizationHasConnectedHosts(this.domainGroups().length, this.hostCount()),
  );

  readonly hostOptions = computed(() =>
    buildGroupHostOptions(
      this.domainGroups(),
      this.subdomains(),
      this.domains(),
      this.subdomainBaseHost(),
    ),
  );

  readonly hostsByDomainGroupId = computed(() => {
    const grouped: Record<string, LinksHostOption[]> = {};
    for (const option of this.hostOptions()) {
      if (!grouped[option.domainGroupId]) {
        grouped[option.domainGroupId] = [];
      }
      grouped[option.domainGroupId].push(option);
    }
    return grouped;
  });

  readonly linkMaps = computed(() =>
    collectLinkMapsForGroupIds(this.dataScopeGroupIds(), (groupId) =>
      this.linkMapStore.selectList({ domainGroupId: groupId })(),
    ),
  );

  readonly linkMapById = computed(() => {
    const byId: Record<string, LinkMap | undefined> = {};
    for (const map of this.linkMaps()) {
      byId[map.id] = map;
    }
    return byId;
  });

  readonly linkMapFilterTarget = computed(() => {
    const filterId = this.linkMapFilterId();
    if (!filterId) {
      return undefined;
    }

    const scoped = this.linkMapById()[filterId];
    if (scoped) {
      return scoped;
    }

    if (this.isAllSitesScope()) {
      for (const group of this.domainGroups()) {
        const map = this.linkMapStore
          .selectList({ domainGroupId: group.id })()
          .find((entry) => entry.id === filterId);
        if (map) {
          return map;
        }
      }
    }

    return undefined;
  });

  readonly redirectRules = computed(() => {
    const rules: RedirectRule[] = [];
    for (const groupId of this.dataScopeGroupIds()) {
      const pages = this.redirectRulePageResultsForGroup(groupId).filters.map(
        (filter) => this.redirectRuleStore.selectList(filter)(),
      );
      rules.push(...collectPaginatedRedirectRules(pages));
    }
    return rules;
  });

  readonly pageLimitOptions = [10, 20, 50];
  readonly pageLimit = signal(20);
  readonly page = signal(1);
  readonly pageCursors = signal<(string | undefined)[]>([]);

  readonly linksListBaseFilter = computed(() =>
    buildLinksListBaseFilter({
      activeGroupId: this.activeGroupId(),
      linkMapId: this.linkMapFilterId(),
      search: this.filterModel().search,
    }),
  );

  readonly linksListQuery = computed((): LinksListQuery => {
    const startAfterId = resolveLinksListStartAfterId(this.page(), this.pageCursors());

    return {
      ...this.linksListBaseFilter(),
      limit: this.pageLimit(),
      ...(startAfterId ? { startAfterId } : {}),
    };
  });

  readonly listResult = computed(() =>
    this.linksListStore.selectListResult(this.linksListQuery())(),
  );

  readonly listExpiration = computed(() =>
    this.linksListStore.selectListExpiration(this.linksListQuery())(),
  );

  readonly paginatedLinks = computed(
    () => {
      const hostsByDomainGroupId = this.hostsByDomainGroupId();
      return this.linksListStore
        .selectList(this.linksListQuery())()
        .map((row) => expandAggregatedLinkRowShortUrls(row, hostsByDomainGroupId));
    },
    { equal: areAggregatedLinkRowsEqual },
  );

  readonly hasNextPage = computed(() => !!this.listResult()?.hasMore);
  readonly organizationWideLinkCount = computed(
    () => this.usageStore.usage()?.linkMapEntries ?? 0,
  );

  readonly loading = computed(
    () =>
      this.domainGroupStore.isLoading()[DEFAULT_LIST_KEY] ||
      this.subdomainStore.isLoading()[DEFAULT_LIST_KEY] ||
      this.domainStore.isLoading()[DEFAULT_LIST_KEY],
  );

  readonly listLoading = computed(() => {
    const key = getFilterKey(this.linksListQuery());
    return !!this.linksListStore.isLoading()[key];
  });

  readonly isWaitingForDomainGroups = computed(() =>
    resolveLinksWaitingForDomainGroups({
      openCreateRequested: this.pendingOpenCreateFromQuery(),
      authLoaded: this.authStore.isAuthenticated() && !this.authStore.isLoading(),
      domainGroupsLoading: this.domainGroupStore.isLoading()[DEFAULT_LIST_KEY] ?? false,
      domainGroupsListLoaded: this.domainGroupsListLoaded(),
    }) ||
    isWaitingForDomainGroupsBeforeDialog({
      dialogRequested: this.pendingOpenConnectDomainFromQuery(),
      authLoaded: this.authStore.isAuthenticated() && !this.authStore.isLoading(),
      domainGroupsLoading: this.domainGroupStore.isLoading()[DEFAULT_LIST_KEY] ?? false,
      domainGroupsListLoaded: this.domainGroupsListLoaded(),
    }),
  );

  constructor() {
    this.domainGroupFilterPersistence.bind(this.filterModel, this.domainGroups, {
      allowEmptySelection: this.allowAllSitesSelection,
      syncFromDashboardContext: computed(() =>
        resolveLinksSyncFromDashboardContext({
          isAdvancedMode: this.dashboardModeService.isAdvanced(),
          pageFilterGroupId: this.filterModel().domainGroupId,
          shellSelectedGroupId: this.dashboardContext.selectedDomainGroupId(),
        }),
      ),
    });

    attachPageWorkspaceFilter({
      destroyRef: this.destroyRef,
      filterModel: () => this.filterModel(),
      updateFilterModel: (domainGroupId) => {
        this.filterModel.update((model) => ({ ...model, domainGroupId }));
      },
      groups: this.domainGroups,
      allowEmptySelection: this.allowAllSitesSelection,
    });

    this.domainGroupStore.searchList();
    this.subdomainStore.searchList();
    this.domainStore.searchList();
    this.usageStore.loadUsage();

    // Scope change: ensure link maps and first redirect-rule page per group (respect store TTL).
    effect(() => {
      const groupIds = this.dataScopeGroupIds();
      untracked(() => this.loadScopedBaseData(groupIds));
    });

    effect(() => {
      const query = this.linksListQuery();
      const listResult = this.listResult();
      const expiration = this.listExpiration();

      untracked(() => {
        if (needsCursorListFetch(listResult, expiration)) {
          this.linksListStore.searchList(query);
        }
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
        const nextIndex = currentPage;
        if (cursors[nextIndex] === nextCursor) {
          return cursors;
        }

        const next = [...cursors];
        next[nextIndex] = nextCursor;
        return next;
      });
    });

    effect(() => {
      const error = this.linksListStore.lastError();
      if (error) {
        untracked(() => {
          this.snackBar.open(error, 'Dismiss', { duration: 5000 });
          this.linksListStore.clearError();
        });
      }
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((query) => {
      this.pendingOpenCreateFromQuery.set(query.get('openCreate') === '1');
      this.pendingOpenConnectDomainFromQuery.set(
        query.get(CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY) === '1',
      );
      this.linkMapFilterId.set(query.get(LINK_MAP_ID_QUERY_PARAM) ?? '');
    });

    effect(() => {
      const map = this.linkMapFilterTarget();
      if (!map) {
        return;
      }

      untracked(() => {
        if (this.isCampaignMode()) {
          this.filterModel.update((model) =>
            model.domainGroupId === map.domainGroupId
              ? model
              : { ...model, domainGroupId: map.domainGroupId },
          );
        } else if (this.dashboardContext.selectedDomainGroupId() !== map.domainGroupId) {
          this.dashboardContext.setSelectedDomainGroupId(map.domainGroupId);
        }

        this.linkMapStore.searchList({ domainGroupId: map.domainGroupId });
      });
    });

    effect(() => {
      if (!this.pendingOpenConnectDomainFromQuery()) {
        return;
      }
      if (!this.isCampaignMode()) {
        return;
      }

      const listLoaded = this.domainGroupsListLoaded();
      const error = this.domainGroupStore.lastError();
      if (listLoaded && error) {
        untracked(() => {
          this.pendingOpenConnectDomainFromQuery.set(false);
          this.clearConnectDomainQueryParam();
          this.snackBar.open(error, 'Dismiss', { duration: 5000 });
          this.domainGroupStore.clearError();
        });
        return;
      }

      if (
        isWaitingForDomainGroupsBeforeDialog({
          dialogRequested: true,
          authLoaded: this.authStore.isAuthenticated() && !this.authStore.isLoading(),
          domainGroupsLoading: this.domainGroupStore.isLoading()[DEFAULT_LIST_KEY] ?? false,
          domainGroupsListLoaded: listLoaded,
        })
      ) {
        return;
      }

      this.pendingOpenConnectDomainFromQuery.set(false);

      this.dialogQueue.runWhenIdle(() => {
        this.openConnectDomainDialog();
        this.clearConnectDomainQueryParam();
      });
    });

    effect(() => {
      if (!this.pendingOpenCreateFromQuery()) {
        return;
      }

      const listLoaded = this.domainGroupsListLoaded();
      const error = this.domainGroupStore.lastError();
      if (listLoaded && error) {
        untracked(() => {
          this.pendingOpenCreateFromQuery.set(false);
          this.clearOpenCreateQueryParam();
          this.snackBar.open(error, 'Dismiss', { duration: 5000 });
          this.domainGroupStore.clearError();
        });
        return;
      }

      const resolution = resolveLinksOpenCreateQueryAction(
        true,
        this.domainGroups().length,
        this.hostCount(),
      );

      if (resolution === 'none' || resolution === 'pending-groups') {
        return;
      }

      this.pendingOpenCreateFromQuery.set(false);

      this.dialogQueue.runWhenIdle(() => {
        if (resolution === 'open-connect-domain') {
          this.openConnectDomainDialog();
        } else {
          this.openCreateDialog();
        }
        this.clearOpenCreateQueryParam();
      });
    });

    effect(() => {
      this.paginationResetKey();
      this.page.set(1);
      this.pageCursors.set([]);
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  onPageLimitChange(limit: number): void {
    this.pageLimit.set(limit);
    this.page.set(1);
    this.pageCursors.set([]);
  }

  clearLinkMapFilter(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [LINK_MAP_ID_QUERY_PARAM]: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openConnectDomainDialog(explicitDomainGroupId?: string): void {
    const dialogRef = this.campaignConnectDomain.openDialog(
      this.buildConnectDomainDialogData(explicitDomainGroupId),
    );
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      this.handleConnectDomainResult(result);
    });
  }

  openCreateDialog(): void {
    if (!this.hasConnectedHosts()) {
      this.openConnectDomainDialog();
      return;
    }

    const dialogRef = this.dialogQueue.openBlocking(() =>
      this.wizardDialog.openWizard<
        CreateLinkWizardDialogComponent,
        CreateLinkWizardDialogData,
        CreateLinkWizardDialogResult
      >(CreateLinkWizardDialogComponent, {
        domainGroups: this.domainGroups(),
        hostOptions: this.hostOptions(),
        linkMaps: this.linkMaps(),
        redirectRules: this.redirectRules(),
        initialDomainGroupId: this.dashboardContext.selectedDomainGroupId() || undefined,
      }),
    );

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (!result) {
        return;
      }

      if (result.created) {
        this.snackBar.open('Link created.', 'Dismiss', { duration: 3000 });
        this.usageStore.loadUsage(true);
        this.refreshLinksList();
      }

      if (result.domainGroupId) {
        this.dashboardContext.setSelectedDomainGroupId(result.domainGroupId);
        this.linkMapStore.searchList({ domainGroupId: result.domainGroupId }, true);
        refetchLoadedRedirectRulePagesForGroup(
          result.domainGroupId,
          (filter) => this.redirectRuleStore.selectListResult(filter)(),
          (filter, force) => this.redirectRuleStore.searchList(filter, force),
        );
      }

      if (result.openConnectDomain) {
        this.openConnectDomainDialog(result.domainGroupId);
      }

      if (result.openAdvanced) {
        void this.dashboardModeService.enterAdvancedMode(this.router, '/redirect-rules');
      }
    });
  }

  openEditDialog(row: AggregatedLinkRow): void {
    const expandedRow = expandAggregatedLinkRowShortUrls(row, this.hostsByDomainGroupId());
    const map = this.linkMapById()[row.linkMapId];

    if (!map) {
      this.snackBar.open("Couldn't load link details for editing.", 'Dismiss', { duration: 4000 });
      return;
    }

    const target = resolveLinksEditDialogTarget(this.isCampaignMode());

    if (target === 'campaign-simplified') {
      this.openCampaignEditDialog(map, expandedRow);
      return;
    }

    this.openAdvancedEditDialog(map, expandedRow);
  }

  private openCampaignEditDialog(map: LinkMap, row: AggregatedLinkRow): void {
    const dialogRef = this.wizardDialog.openWizard<
      EditLinkDialogComponent,
      EditLinkDialogData,
      EditLinkDialogResult
    >(EditLinkDialogComponent, {
      entryId: row.id,
      key: row.key,
      destination: row.destination,
      shortPath: row.shortPath,
      shortUrls: row.shortUrls,
      caseSensitive: map.caseSensitive,
    }, 0, { size: 'compact' });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result?.saved) {
        this.snackBar.open('Link updated.', 'Dismiss', { duration: 3000 });
        this.refreshLinksList();
      }

      if (result?.openAdvanced) {
        void this.dashboardModeService.enterAdvancedMode(this.router, '/redirect-rules');
      }
    });
  }

  private openAdvancedEditDialog(map: LinkMap, row: AggregatedLinkRow): void {
    const entry: LinkMapEntry = {
      id: row.id,
      linkMapId: row.linkMapId,
      key: row.key,
      destination: row.destination,
      createdAt: row.updatedAt,
      updatedAt: row.updatedAt,
    };

    const dialogRef = this.wizardDialog.openWizard<
      LinkMapEntryFormDialogComponent,
      LinkMapEntryDialogData,
      LinkMapEntryDialogResult
    >(LinkMapEntryFormDialogComponent, {
      linkMapId: map.id,
      caseSensitive: map.caseSensitive,
      entry,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result?.saved) {
        this.refreshLinksList();
      }
    });
  }

  copyLink(row: AggregatedLinkRow): void {
    const payload =
      row.shortUrls.length > 0 ? formatShortUrlsForClipboard(row.shortUrls) : row.shortPath;
    const copied = this.clipboard.copy(payload);
    this.snackBar.open(copied ? 'Copied to clipboard.' : "Couldn't copy link. Copy it manually.", 'Dismiss', {
      duration: 3000,
    });
  }

  openAnalytics(row: AggregatedLinkRow): void {
    this.dashboardContext.setSelectedDomainGroupId(row.domainGroupId);
    void this.router.navigate([resolveDashboardAnalyticsPath(this.dashboardModeService.mode())], {
      queryParams: {
        workspace: row.domainGroupId,
        ruleId: row.redirectRuleId ?? undefined,
        linkMapId: row.linkMapId,
        linkKey: row.key,
      },
    });
  }

  private clearOpenCreateQueryParam(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { openCreate: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private clearConnectDomainQueryParam(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY]: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /** Load link maps and the first redirect-rule page for the current scope (cached when fresh). */
  private loadScopedBaseData(groupIds: readonly string[]): void {
    for (const groupId of groupIds) {
      this.linkMapStore.searchList({ domainGroupId: groupId });
      this.redirectRuleStore.searchList(buildRedirectRuleListFilter(groupId));
    }
  }

  private refreshLinksList(): void {
    this.linksListStore.searchList(this.linksListQuery(), true);
  }

  private redirectRulePageResultsForGroup(domainGroupId: string): {
    filters: RedirectRuleListQuery[];
    results: (QueryResult<string> | null | undefined)[];
  } {
    return planRedirectRulePages(domainGroupId, (filter) =>
      this.redirectRuleStore.selectListResult(filter)(),
    );
  }

  private buildConnectDomainDialogData(
    explicitDomainGroupId?: string,
  ): Partial<CampaignConnectDomainDialogData> {
    const domainGroups = this.domainGroups();

    if (explicitDomainGroupId) {
      const group = domainGroups.find((entry) => entry.id === explicitDomainGroupId);
      return {
        domainGroups,
        domainGroupId: explicitDomainGroupId,
        existingWorkspaceName: group?.name,
      };
    }

    const initialDomainGroupId =
      this.activeGroupId() || this.dashboardContext.selectedDomainGroupId() || undefined;
    return {
      domainGroups,
      ...(initialDomainGroupId ? { initialDomainGroupId } : {}),
    };
  }

  private handleConnectDomainResult(result: CampaignConnectDomainDialogResult | undefined): void {
    if (!result?.connected) {
      return;
    }

    this.dashboardContext.setSelectedDomainGroupId(result.domainGroupId);
    this.usageStore.loadUsage(true);
    this.snackBar.open(resolveConnectDomainSuccessMessage(result), 'Dismiss', { duration: 3000 });

    if (result.openCreateLink) {
      void this.router.navigate(['/links'], {
        queryParams: { openCreate: '1' },
        queryParamsHandling: 'merge',
      });
    }
  }

}
