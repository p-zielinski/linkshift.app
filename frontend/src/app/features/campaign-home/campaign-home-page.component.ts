import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { SetupChecklistComponent } from '../../shared/components/setup-checklist/setup-checklist.component';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { DashboardContextService } from '../../core/layout/dashboard-context.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { resolveDashboardAnalyticsPath } from '../../core/layout/dashboard-mode-toggle-navigation.util';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { LinksListStore } from '../../core/store/links-list.store';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { DEFAULT_LIST_KEY } from '../../core/store/entity/entity-store.utils';
import {
  buildGroupHostOptions,
  expandAggregatedLinkRowShortUrls,
  formatShortUrlsForClipboard,
  formatShortUrlsTooltip,
  resolveSubdomainBaseHost,
  type AggregatedLinkRow,
  type LinksHostOption,
} from '../links/links-aggregation.util';
import { CampaignConnectDomainService } from '../campaign-connect-domain/campaign-connect-domain.service';
import type {
  CampaignConnectDomainDialogData,
  CampaignConnectDomainDialogResult,
} from '../campaign-connect-domain/campaign-connect-domain-dialog.component';
import { resolveConnectDomainSuccessMessage } from '../campaign-connect-domain/campaign-connect-domain.util';
import {
  countOrganizationHosts,
  organizationHasConnectedHosts,
} from '../../shared/components/setup-checklist/setup-checklist.auto-complete.util';
import {
  CAMPAIGN_HOME_QR_GENERATOR_NO_DOMAIN_SUBTITLE,
  CAMPAIGN_HOME_QR_GENERATOR_NO_HOST_SUBTITLE,
  CAMPAIGN_HOME_QR_GENERATOR_SUBTITLE,
  CAMPAIGN_HOME_RECENT_LINKS_LOAD_ERROR,
  CAMPAIGN_HOME_RECENT_LINKS_SUBTITLE,
  resolveCampaignHomePrimaryQuickAction,
  resolveCampaignHomeRecentLinksEmptyCta,
} from './campaign-home-page.util';
import {
  resolveCampaignHomeRecentLinksLoading,
  shouldFetchCampaignHomeRecentLinks,
  shouldShowCampaignHomeRecentLinksEmpty,
  shouldShowCampaignHomeRecentLinksLoadFailed,
} from './campaign-home-recent-links-loading.util';

const RECENT_LINKS_LIMIT = 5;
const RECENT_LINKS_QUERY = { limit: RECENT_LINKS_LIMIT } as const;

@Component({
  selector: 'app-campaign-home-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    ResourcePageShellComponent,
    ResourceCardComponent,
    SetupChecklistComponent,
  ],
  templateUrl: './campaign-home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignHomePageComponent implements OnInit {
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly linksListStore = inject(LinksListStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly domainStore = inject(DomainStore);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly dashboardContext = inject(DashboardContextService);
  private readonly dashboardModeService = inject(DashboardModeService);
  private readonly campaignConnectDomain = inject(CampaignConnectDomainService);
  private readonly destroyRef = inject(DestroyRef);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly hasDomainGroups = computed(() => this.domainGroups().length > 0);
  readonly subdomains = this.subdomainStore.selectList();
  readonly domains = this.domainStore.selectList();

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
  readonly primaryQuickAction = computed(() =>
    resolveCampaignHomePrimaryQuickAction(this.domainGroups().length, this.hostCount()),
  );
  readonly recentLinksEmptyCta = computed(() =>
    resolveCampaignHomeRecentLinksEmptyCta(this.domainGroups().length, this.hostCount()),
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

  readonly recentLinksListResult = computed(() =>
    this.linksListStore.selectListResult(RECENT_LINKS_QUERY)(),
  );

  readonly recentLinksListExpiration = computed(() =>
    this.linksListStore.selectListExpiration(RECENT_LINKS_QUERY)(),
  );

  readonly recentLinks = computed(() => {
    const hostsByDomainGroupId = this.hostsByDomainGroupId();
    return this.linksListStore
      .selectList(RECENT_LINKS_QUERY)()
      .map((row) => expandAggregatedLinkRowShortUrls(row, hostsByDomainGroupId));
  });

  readonly hasLinkMapEntries = computed(() => (this.usageStore.usage()?.linkMapEntries ?? 0) > 0);

  private readonly recentLinksFetchFailed = signal(false);

  readonly recentLinksLoading = computed(() =>
    resolveCampaignHomeRecentLinksLoading({
      usageLoading: this.usageStore.isLoading(),
      domainGroupsLoading: this.domainGroupStore.isLoading()[DEFAULT_LIST_KEY] ?? false,
      linkMapEntryCount: this.usageStore.usage()?.linkMapEntries ?? 0,
      linksListLoaded: this.recentLinksListResult() !== null,
    }),
  );

  readonly showRecentLinksLoadFailed = computed(() =>
    shouldShowCampaignHomeRecentLinksLoadFailed({
      hasLinkMapEntries: this.hasLinkMapEntries(),
      linksListLoaded: this.recentLinksListResult() !== null,
      linksListEmpty: this.recentLinks().length === 0,
      fetchFailed: this.recentLinksFetchFailed(),
    }),
  );

  readonly showRecentLinksEmpty = computed(() =>
    shouldShowCampaignHomeRecentLinksEmpty({
      recentLinksLoading: this.recentLinksLoading(),
      linksListEmpty: this.recentLinks().length === 0,
      fetchFailed: this.recentLinksFetchFailed(),
    }),
  );

  readonly recentLinksSubtitle = CAMPAIGN_HOME_RECENT_LINKS_SUBTITLE;
  readonly recentLinksLoadErrorMessage = CAMPAIGN_HOME_RECENT_LINKS_LOAD_ERROR;
  readonly qrGeneratorSubtitle = CAMPAIGN_HOME_QR_GENERATOR_SUBTITLE;
  readonly qrGeneratorNoDomainSubtitle = CAMPAIGN_HOME_QR_GENERATOR_NO_DOMAIN_SUBTITLE;
  readonly qrGeneratorNoHostSubtitle = CAMPAIGN_HOME_QR_GENERATOR_NO_HOST_SUBTITLE;

  constructor() {
    effect(() => {
      const shouldFetch = shouldFetchCampaignHomeRecentLinks({
        hasLinkMapEntries: this.hasLinkMapEntries(),
        listResult: this.recentLinksListResult(),
        expiration: this.recentLinksListExpiration(),
      });

      untracked(() => {
        if (shouldFetch) {
          this.linksListStore.searchList(RECENT_LINKS_QUERY);
        }
      });
    });

    effect(() => {
      const error = this.linksListStore.lastError();
      if (error) {
        untracked(() => {
          this.recentLinksFetchFailed.set(true);
          this.snackBar.open(error, 'Dismiss', { duration: 5000 });
          this.linksListStore.clearError();
        });
      }
    });

    effect(() => {
      if (this.recentLinks().length > 0) {
        untracked(() => this.recentLinksFetchFailed.set(false));
      }
    });
  }

  ngOnInit(): void {
    this.domainGroupStore.searchList();
    this.subdomainStore.searchList();
    this.domainStore.searchList();
    this.usageStore.loadUsage();
  }

  copyLink(row: AggregatedLinkRow): void {
    const payload =
      row.shortUrls.length > 0 ? formatShortUrlsForClipboard(row.shortUrls) : row.shortPath;
    const copied = this.clipboard.copy(payload);
    this.snackBar.open(copied ? 'Copied to clipboard.' : "Couldn't copy to clipboard.", 'Dismiss', {
      duration: 3000,
    });
  }

  shortPathTooltip(row: AggregatedLinkRow): string {
    return formatShortUrlsTooltip(row.shortPath, row.shortUrls);
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

  retryRecentLinks(): void {
    this.recentLinksFetchFailed.set(false);
    this.linksListStore.searchList(RECENT_LINKS_QUERY, true);
  }

  openConnectDomainDialog(): void {
    const dialogRef = this.campaignConnectDomain.openDialog(this.buildConnectDomainDialogData());
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      this.handleConnectDomainResult(result);
    });
  }

  private buildConnectDomainDialogData(): Partial<CampaignConnectDomainDialogData> {
    const initialDomainGroupId = this.dashboardContext.selectedDomainGroupId() || undefined;
    return {
      domainGroups: this.domainGroups(),
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
      });
    }
  }
}
