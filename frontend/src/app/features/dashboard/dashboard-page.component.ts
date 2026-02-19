import {
  AfterViewInit,
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
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import { OrganizationConfiguration } from '@shared/models/organization-config.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BillingApiService } from '../../core/api/billing-api.service';
import { UpgradeDialogComponent } from '../billing/upgrade-dialog/upgrade-dialog.component';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import type { TopRedirectRuleEntry } from '../../core/models/redirect-rule.model';
import { formatPlanLabel } from '../../core/utils/plan-label';
import { RuleAnalyticsDialogComponent } from './rule-analytics-dialog.component';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexTooltip,
  ApexGrid,
} from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatTooltipModule,
    ClipboardModule,
    PageHeaderComponent,
    NgApexchartsModule,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent implements OnInit, AfterViewInit {
  private readonly authStore = inject(AuthStore);
  private readonly billingApi = inject(BillingApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly clipboard = inject(Clipboard);
  private readonly redirectRulesApi = inject(RedirectRulesApiService);
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
  readonly config = computed(() => {
    const org = this.authStore.organization();
    const rawConfig = org?.configuration ?? undefined;
    return OrganizationConfiguration.fromJson(rawConfig);
  });
  readonly activeSubscription = computed(() => this.config().activeSubscription);
  readonly limits = computed(() => this.activeSubscription().limits);
  readonly usage = computed(() => this.usageStore.usage());
  readonly usageLoading = computed(() => this.usageStore.isLoading());
  readonly usageError = computed(() => this.usageStore.error());
  readonly topRules = signal<TopRedirectRuleEntry[]>([]);
  readonly topRulesLoading = signal(false);
  readonly topRulesError = signal<string | null>(null);
  readonly rangeStart = signal<string>('');
  readonly rangeEnd = signal<string>('');
  readonly quickRanges = [
    { label: 'Last 3 days', days: 3 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 14 days', days: 14 },
    { label: 'Last 30 days', days: 30 },
  ];
  readonly chartSeries = computed<ApexAxisChartSeries>(() => [
    {
      name: 'Hits',
      data: this.topRules().map((entry) => entry.hits),
    },
  ]);
  readonly chartOptions = computed<{
    chart: ApexChart;
    xaxis: ApexXAxis;
    plotOptions: ApexPlotOptions;
    dataLabels: ApexDataLabels;
    tooltip: ApexTooltip;
    grid: ApexGrid;
  }>(() => ({
    chart: {
      type: 'bar',
      height: 400,
      toolbar: { show: false },
    },
    xaxis: {
      categories: this.topRules().map((entry) => entry.rule.destination),
      labels: {
        rotate: -35,
        formatter: (value: string) => this.toLabel(value),
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        formatter: (_value, opts) => this.destinationLabel(opts?.dataPointIndex ?? -1),
      },
      y: {
        formatter: (value) => `${value} hits`,
      },
    },
    grid: {
      strokeDashArray: 4,
      padding: {
        top: 8,
        right: 12,
        left: 12,
        bottom: 0,
      },
    },
  }));
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
    if (usage.rules > limits.maxTotalRules) {
      details.push(`Rules ${usage.rules}/${limits.maxTotalRules}`);
    }
    if (usage.users > limits.maxUsers) {
      details.push(`Active users ${usage.users}/${limits.maxUsers}`);
    }
    return details;
  });

  readonly suspensionMessage = computed(() => {
    const details = this.overLimitDetails();
    if (details.length > 0) {
      return `Account is suspended until you upgrade or remove resources above limits. Overages: ${details.join(', ')}.`;
    }
    if (this.activeSubscription().status === 'SUSPENDED') {
      return 'Account is suspended. Please update billing or remove over-limit resources.';
    }
    return null;
  });

  constructor() {
    effect(() => {
      this.user();
      this.organization();
      this.scheduleOverflowCheck();
    });
  }

  ngOnInit(): void {
    this.usageStore.loadUsage();
    this.setQuickRange(7);
  }

  ngAfterViewInit(): void {
    this.scheduleOverflowCheck();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.scheduleOverflowCheck();
  }

  async openCustomerPortal(): Promise<void> {
    this.billingBusy.set(true);
    try {
      const response = await firstValueFrom(this.billingApi.getCustomerPortal());
      window.location.href = response.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to open portal.';
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
    this.dialog.open(UpgradeDialogComponent, {
      data: { currentPlan: this.activeSubscription().plan },
      closeOnNavigation: true,
      maxWidth: '960px',
      width: 'min(960px, 96vw)',
    });
  }

  async loadTopRules(): Promise<void> {
    this.topRulesLoading.set(true);
    this.topRulesError.set(null);
    try {
      const start = this.toIsoString(this.rangeStart());
      const end = this.toIsoString(this.rangeEnd());
      const response = await firstValueFrom(
        this.redirectRulesApi.analytics({
          start,
          end,
          limit: 50,
        }),
      );
      this.topRules.set(response.data ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load top rules.';
      this.topRulesError.set(message);
    } finally {
      this.topRulesLoading.set(false);
    }
  }

  setQuickRange(days: number): void {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    this.rangeStart.set(this.toDateTimeInputValue(start));
    this.rangeEnd.set(this.toDateTimeInputValue(end));
    this.loadTopRules();
  }

  applyCustomRange(): void {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    if ((start && !end) || (!start && end)) {
      this.topRulesError.set('Provide both start and end date/time.');
      return;
    }
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
        if (startDate > endDate) {
          this.topRulesError.set('Start must be before end.');
          return;
        }
      }
    }
    this.loadTopRules();
  }

  openRuleDetails(entry: TopRedirectRuleEntry): void {
    this.dialog.open(RuleAnalyticsDialogComponent, {
      data: { entry },
      closeOnNavigation: true,
      maxWidth: '720px',
      width: 'min(720px, 96vw)',
    });
  }

  onRangeStartChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.rangeStart.set(target?.value ?? '');
  }

  onRangeEndChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.rangeEnd.set(target?.value ?? '');
  }

  copyId(value: string): void {
    if (!value) {
      return;
    }
    const copied = this.clipboard.copy(value);
    const message = copied ? 'Copied to clipboard.' : 'Copy failed.';
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: copied ? ['bg-emerald-600', 'text-white'] : ['bg-red-600', 'text-white'],
    });
  }

  planLabel(plan: string, planName?: string | null): string {
    return formatPlanLabel(plan, planName);
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

  private toDateTimeInputValue(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toIsoString(value: string): string | undefined {
    if (!value) {
      return undefined;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }
    return parsed.toISOString();
  }

  private toLabel(value: string): string {
    const trimmed = value?.trim() ?? '';
    if (trimmed.length <= 18) {
      return trimmed || 'Rule';
    }
    return `${trimmed.slice(0, 18)}…`;
  }

  private destinationLabel(index: number): string {
    const entry = this.topRules()[index];
    const label = entry?.rule.destination?.trim() ?? '';
    return label || 'Rule';
  }
}
