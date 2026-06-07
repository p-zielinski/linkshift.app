import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, AfterViewInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import {
  BillingInterval,
  OrganizationPlan,
  OrganizationStatus,
} from '@shared/models/organization-config.model';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { AuthStore } from '../../core/store/auth.store';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import {
  isPlanLimitReached,
  resolvePlanLimitView,
  type PlanLimitTileConfig,
} from '../../core/layout/plan-limit-labels.util';
import type { OrganizationUsage } from '../../core/models/organization-usage.model';
import type { PlanLimits } from '@shared/models/plan-limits.model';
import { BillingApiService } from '../../core/api/billing-api.service';
import { UpgradeDialogComponent } from '../billing/upgrade-dialog/upgrade-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { formatPlanLabel } from '../../core/utils/plan-label';
import { resolveOrganizationConfig } from '../../core/utils/organization-config.util';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { DashboardContextService } from '../../core/layout/dashboard-context.service';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { DEFAULT_LIST_KEY } from '../../core/store/entity/entity-store.utils';
import {
  buildGroupHostOptions,
  resolveSubdomainBaseHost,
  type LinksHostOption,
} from '../links/links-aggregation.util';
import { CampaignConnectDomainService } from '../campaign-connect-domain/campaign-connect-domain.service';
import type {
  CampaignConnectDomainDialogData,
  CampaignConnectDomainDialogResult,
} from '../campaign-connect-domain/campaign-connect-domain-dialog.component';
import { resolveConnectDomainSuccessMessage } from '../campaign-connect-domain/campaign-connect-domain.util';

export type PlanLimitTileView = {
  tile: PlanLimitTileConfig;
  usage: number | undefined;
  limit: number | string;
  limitReached: boolean;
};

function toPlanLimitTileView(
  tile: PlanLimitTileConfig,
  usage: OrganizationUsage | null,
  limits: PlanLimits,
): PlanLimitTileView {
  const max = limits[tile.limitField];

  return {
    tile,
    usage: usage?.[tile.usageField],
    limit: typeof max === 'number' ? max : '-',
    limitReached: isPlanLimitReached(usage, limits, tile),
  };
}

@Component({
  selector: 'app-campaign-settings-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    ResourcePageShellComponent,
    ResourceCardComponent,
  ],
  templateUrl: './campaign-settings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignSettingsPageComponent implements OnInit, AfterViewInit {
  private readonly authStore = inject(AuthStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly dashboardModeService = inject(DashboardModeService);
  private readonly billingApi = inject(BillingApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly domainStore = inject(DomainStore);
  private readonly dashboardContext = inject(DashboardContextService);
  private readonly campaignConnectDomain = inject(CampaignConnectDomainService);
  private readonly destroyRef = inject(DestroyRef);

  readonly billingBusy = signal(false);
  readonly OrganizationPlan = OrganizationPlan;

  readonly user = computed(() => this.authStore.user());
  readonly organization = computed(() => this.authStore.organization());
  readonly config = computed(() =>
    resolveOrganizationConfig(this.authStore.organization()?.configuration),
  );
  readonly activeSubscription = computed(() => this.config().activeSubscription);
  readonly limits = computed(() => this.config().activeSubscription.limits);
  readonly usage = computed(() => this.usageStore.usage());
  readonly activeUsers = computed(() => this.usageStore.usage()?.users ?? null);
  readonly usageLoading = computed(() => this.usageStore.isLoading());
  readonly usageError = computed(() => this.usageStore.error());
  readonly planLimitView = computed(() => resolvePlanLimitView(this.dashboardModeService.mode()));
  readonly primaryTileViews = computed(() => {
    const usage = this.usage();
    const limits = this.limits();

    return this.planLimitView().primaryTiles.map((tile) => toPlanLimitTileView(tile, usage, limits));
  });
  readonly technicalTileViews = computed(() => {
    const usage = this.usage();
    const limits = this.limits();

    return this.planLimitView().technicalTiles.map((tile) => toPlanLimitTileView(tile, usage, limits));
  });
  readonly subscriptionPlanLabel = computed(() => {
    const subscription = this.activeSubscription();

    return formatPlanLabel(subscription.plan, subscription.planName);
  });
  readonly showTechnicalLimits = computed(() => this.technicalTileViews().length > 0);
  readonly isCampaignMode = computed(() => this.dashboardModeService.isCampaign());

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly subdomains = this.subdomainStore.selectList();
  readonly domains = this.domainStore.selectList();
  readonly hostsLoading = computed(
    () =>
      (this.domainGroupStore.isLoading()[DEFAULT_LIST_KEY] ?? false) ||
      (this.subdomainStore.isLoading()[DEFAULT_LIST_KEY] ?? false) ||
      (this.domainStore.isLoading()[DEFAULT_LIST_KEY] ?? false),
  );
  readonly subdomainBaseHost = computed(() => {
    const configuredBaseUrl = this.appConfig.APP_SUBDOMAIN_BASE_URL || this.appConfig.APP_BASE_URL;
    return resolveSubdomainBaseHost(configuredBaseUrl);
  });
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
  readonly hasDomainGroups = computed(() => this.domainGroups().length > 0);
  readonly hasConnectedHosts = computed(() => this.hostOptions().length > 0);

  ngOnInit(): void {
    this.usageStore.loadUsage();
    this.domainGroupStore.searchList();
    this.subdomainStore.searchList();
    this.domainStore.searchList();
  }

  ngAfterViewInit(): void {
    this.scrollToFragmentIfNeeded(this.route.snapshot.fragment);
    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fragment) => {
      this.scrollToFragmentIfNeeded(fragment);
    });
  }

  retryLoadUsage(): void {
    this.usageStore.loadUsage(true);
  }

  openUpgradeDialog(): void {
    const activeSubscription = this.activeSubscription();
    const currentInterval: BillingInterval =
      activeSubscription.interval === 'YEARLY' ? 'YEARLY' : 'MONTHLY';

    this.dialog.open(UpgradeDialogComponent, {
      data: {
        currentPlan: activeSubscription.plan,
        currentInterval,
        currentStatus: activeSubscription.status as OrganizationStatus,
        hasProviderSubscription: !!activeSubscription.providerSubscriptionId,
      },
      closeOnNavigation: true,
      maxWidth: '960px',
      width: 'min(960px, 96vw)',
    });
  }

  async openManageSubscription(): Promise<void> {
    await this.openCustomerPortal();
  }

  async openCancelSubscription(): Promise<void> {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel subscription',
        message: 'You will be redirected to Paddle to confirm cancellation details. Continue?',
        confirmLabel: 'Continue',
        cancelLabel: 'Back',
        tone: 'warning',
      },
      maxWidth: '480px',
      width: 'min(480px, 92vw)',
    });

    const confirmed = await firstValueFrom(confirmDialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    await this.openCustomerPortal();
  }

  private async openCustomerPortal(): Promise<void> {
    this.billingBusy.set(true);
    try {
      const response = await firstValueFrom(this.billingApi.getCustomerPortal());
      window.location.href = response.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn't open portal.";
      this.snackBar.open(message, 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['bg-red-600', 'text-white'],
      });
    } finally {
      this.billingBusy.set(false);
    }
  }

  switchToAdvancedView(): void {
    void this.dashboardModeService.enterAdvancedMode(this.router, '/dashboard');
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
    this.domainGroupStore.searchList(undefined, true);
    this.subdomainStore.searchList(undefined, true);
    this.domainStore.searchList(undefined, true);
    this.snackBar.open(resolveConnectDomainSuccessMessage(result), 'Dismiss', { duration: 3000 });
  }

  private scrollToFragmentIfNeeded(fragment: string | null): void {
    if (fragment !== 'hosts') {
      return;
    }

    queueMicrotask(() => {
      document.getElementById('hosts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
