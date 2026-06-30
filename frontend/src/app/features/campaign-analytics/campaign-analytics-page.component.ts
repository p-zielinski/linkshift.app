import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Signal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { RedirectRulesAnalyticsFiltersComponent } from '../redirect-rules-analytics/components/redirect-rules-analytics-filters.component';
import { RedirectRulesAnalyticsResultsComponent } from '../redirect-rules-analytics/components/redirect-rules-analytics-results.component';
import { RedirectRulesAnalyticsPageBase } from '../redirect-rules-analytics/redirect-rules-analytics-page.base';
import { CampaignConnectDomainService } from '../campaign-connect-domain/campaign-connect-domain.service';
import {
  CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY,
  resolveConnectDomainSuccessMessage,
} from '../campaign-connect-domain/campaign-connect-domain.util';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { DashboardDialogQueueService } from '../dashboard/services/dashboard-dialog-queue.service';
import type {
  CampaignConnectDomainDialogData,
  CampaignConnectDomainDialogResult,
} from '../campaign-connect-domain/campaign-connect-domain-dialog.component';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { DomainStore } from '../../core/store/domain.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { DEFAULT_LIST_KEY } from '../../core/store/entity/entity-store.utils';
import { isWaitingForDomainGroupsBeforeDialog } from '../links/links-page-scope.util';
import { resolveSubdomainBaseHost } from '../links/links-aggregation.util';
import {
  countOrganizationHosts,
  organizationHasConnectedHosts,
} from '../../shared/components/setup-checklist/setup-checklist.auto-complete.util';

@Component({
  selector: 'app-campaign-analytics-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    ResourcePageShellComponent,
    RedirectRulesAnalyticsFiltersComponent,
    RedirectRulesAnalyticsResultsComponent,
  ],
  templateUrl: './campaign-analytics-page.component.html',
  styleUrl: '../redirect-rules-analytics/redirect-rules-analytics-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignAnalyticsPageComponent extends RedirectRulesAnalyticsPageBase implements OnInit {
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly domainStore = inject(DomainStore);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly campaignConnectDomain = inject(CampaignConnectDomainService);
  private readonly dashboardModeService = inject(DashboardModeService);
  private readonly dialogQueue = inject(DashboardDialogQueueService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  private readonly pendingOpenConnectDomainFromQuery = signal(false);

  readonly isCampaignMode = computed(() => this.dashboardModeService.isCampaign());

  /** Campaign analytics may scope to one site or all sites when multiple exist. */
  readonly allowAllSitesSelection = computed(() => this.domainGroups().length > 1);
  readonly showPageLevelWorkspaceFilter = computed(
    () => this.isCampaignMode() && this.allowAllSitesSelection(),
  );

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
  readonly domainGroupsListLoaded = computed(
    () => !!this.domainGroupStore.list()[DEFAULT_LIST_KEY],
  );

  protected override resolveAllowEmptyWorkspaceSelection(): Signal<boolean> {
    return this.allowAllSitesSelection;
  }

  constructor() {
    super();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((query) => {
      this.pendingOpenConnectDomainFromQuery.set(
        query.get(CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY) === '1',
      );
    });

    effect(() => {
      if (!this.pendingOpenConnectDomainFromQuery()) {
        return;
      }
      if (!this.isCampaignMode()) {
        this.pendingOpenConnectDomainFromQuery.set(false);
        this.clearConnectDomainQueryParam();
        return;
      }

      const listLoaded = this.domainGroupsListLoaded();
      const error = this.domainGroupStore.lastError();
      if (listLoaded && error) {
        this.pendingOpenConnectDomainFromQuery.set(false);
        this.clearConnectDomainQueryParam();
        this.snackBar.open(error, 'Dismiss', { duration: 5000 });
        this.domainGroupStore.clearError();
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
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.subdomainStore.searchList();
    this.domainStore.searchList();
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
    this.snackBar.open(resolveConnectDomainSuccessMessage(result), 'Dismiss', { duration: 3000 });

    if (result.openCreateLink) {
      void this.router.navigate(['/links'], {
        queryParams: { openCreate: '1' },
      });
    }
  }

  private clearConnectDomainQueryParam(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY]: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
