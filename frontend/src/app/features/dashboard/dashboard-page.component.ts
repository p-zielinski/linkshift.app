import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import {
  BillingInterval,
  OrganizationPlan,
  OrganizationStatus,
} from '@shared/models/organization-config.model';
import { resolveOrganizationConfig } from '../../core/utils/organization-config.util';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { SetupChecklistComponent } from '../../shared/components/setup-checklist/setup-checklist.component';
import { BillingApiService } from '../../core/api/billing-api.service';
import { UpgradeDialogComponent } from '../billing/upgrade-dialog/upgrade-dialog.component';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { formatPlanLabel } from '../../core/utils/plan-label';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTooltipModule,
    MatExpansionModule,
    ClipboardModule,
    ResourcePageShellComponent,
    ResourceCardComponent,
    SetupChecklistComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit, AfterViewInit {
  private readonly authStore = inject(AuthStore);
  private readonly billingApi = inject(BillingApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly clipboard = inject(Clipboard);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('userIdText', { read: ElementRef })
  private readonly userIdText?: ElementRef<HTMLElement>;
  @ViewChild('orgIdText', { read: ElementRef })
  private readonly orgIdText?: ElementRef<HTMLElement>;

  readonly billingBusy = signal(false);
  readonly userIdOverflow = signal(false);
  readonly orgIdOverflow = signal(false);
  readonly user = computed(() => this.authStore.user());
  readonly organization = computed(() => this.authStore.organization());
  private readonly userId = computed(() => this.authStore.user()?.id);
  private readonly organizationId = computed(() => this.authStore.organization()?.id);
  readonly config = computed(() =>
    resolveOrganizationConfig(this.authStore.organization()?.configuration),
  );
  readonly OrganizationPlan = OrganizationPlan;
  readonly activeSubscription = computed(() => this.config().activeSubscription);
  readonly subscriptionPlanLabel = computed(() => {
    const subscription = this.activeSubscription();

    return formatPlanLabel(subscription.plan, subscription.planName);
  });
  readonly limits = computed(() => this.activeSubscription().limits);
  readonly usage = computed(() => this.usageStore.usage());
  readonly usageLoading = computed(() => this.usageStore.isLoading());
  readonly usageError = computed(() => this.usageStore.error());
  readonly domainGroupLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.domainGroups >= this.limits().maxDomainGroups;
  });
  readonly domainLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.domains >= this.limits().maxTotalDomains;
  });
  readonly subdomainLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.subdomains >= this.limits().maxTotalSubdomains;
  });
  readonly ruleLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.rules >= this.limits().maxTotalRules;
  });
  readonly testLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.tests >= this.limits().maxTotalTests;
  });
  readonly apiKeyLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    const limit = this.limits().maxApiKeys;
    if (limit === null) {
      return false;
    }
    return usage.apiKeys >= limit;
  });
  readonly linkMapLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.linkMaps >= this.limits().maxLinkMaps;
  });
  readonly linkMapEntriesLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.linkMapEntries >= this.limits().maxLinkMapEntriesTotal;
  });
  readonly userLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.users >= this.limits().maxUsers;
  });

  readonly overLimitDetails = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return [];
    }
    const limits = this.limits();
    const details: string[] = [];
    if (usage.domainGroups > limits.maxDomainGroups) {
      details.push(`Domain groups ${usage.domainGroups}/${limits.maxDomainGroups}`);
    }
    if (usage.domains > limits.maxTotalDomains) {
      details.push(`Domains ${usage.domains}/${limits.maxTotalDomains}`);
    }
    if (usage.subdomains > limits.maxTotalSubdomains) {
      details.push(`Subdomains ${usage.subdomains}/${limits.maxTotalSubdomains}`);
    }
    if (usage.rules > limits.maxTotalRules) {
      details.push(`Rules ${usage.rules}/${limits.maxTotalRules}`);
    }
    if (usage.users > limits.maxUsers) {
      details.push(`Active users ${usage.users}/${limits.maxUsers}`);
    }
    if (limits.maxApiKeys !== null && usage.apiKeys > limits.maxApiKeys) {
      details.push(`API keys ${usage.apiKeys}/${limits.maxApiKeys}`);
    }
    if (usage.linkMaps > limits.maxLinkMaps) {
      details.push(`Link maps ${usage.linkMaps}/${limits.maxLinkMaps}`);
    }
    if (usage.linkMapEntries > limits.maxLinkMapEntriesTotal) {
      details.push(`Link map entries ${usage.linkMapEntries}/${limits.maxLinkMapEntriesTotal}`);
    }
    return details;
  });

  readonly suspensionMessage = computed(() => {
    const details = this.overLimitDetails();
    if (details.length > 0) {
      return `Account is suspended until you upgrade or remove resources above limits. Overages: ${details.join(', ')}.`;
    }
    if (this.activeSubscription().status === 'SUSPENDED') {
      return 'Account is suspended. Update billing or remove over-limit resources.';
    }
    return null;
  });

  constructor() {
    effect(() => {
      this.userId();
      this.organizationId();
      this.scheduleOverflowCheck();
    });
  }

  ngOnInit(): void {
    this.usageStore.loadUsage();
  }

  retryLoadUsage(): void {
    this.usageStore.loadUsage(true);
  }

  ngAfterViewInit(): void {
    this.scheduleOverflowCheck();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.scheduleOverflowCheck();
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

  copyId(value: string): void {
    if (!value) {
      return;
    }
    const copied = this.clipboard.copy(value);
    const message = copied ? 'Copied to clipboard.' : "Couldn't copy to clipboard.";
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: copied ? ['bg-emerald-600', 'text-white'] : ['bg-red-600', 'text-white'],
    });
  }

  private scheduleOverflowCheck(): void {
    if (!this.isBrowser) {
      return;
    }
    requestAnimationFrame(() => this.updateOverflowFlags());
  }

  private updateOverflowFlags(): void {
    this.userIdOverflow.set(this.isOverflowing(this.userIdText?.nativeElement));
    this.orgIdOverflow.set(this.isOverflowing(this.orgIdText?.nativeElement));
  }

  private isOverflowing(element?: HTMLElement): boolean {
    if (!element) {
      return false;
    }
    return element.scrollWidth > element.clientWidth;
  }

}
