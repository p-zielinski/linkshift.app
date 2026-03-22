import { Component, OnInit, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import type { RedirectRuleAnalyticsQuery, TopRedirectRuleEntry } from '../../core/models/redirect-rule.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RuleAnalyticsDialogComponent } from '../dashboard/rule-analytics-dialog.component';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
} from 'ng-apexcharts';
import {
  AnalyticsQuickRange,
  RedirectRulesAnalyticsFiltersComponent,
} from './components/redirect-rules-analytics-filters.component';
import { RedirectRulesAnalyticsResultsComponent } from './components/redirect-rules-analytics-results.component';
import { RedirectRulesAnalyticsStore } from '../../core/store/redirect-rules-analytics.store';
import { getFilterKey } from '../../core/store/entity/entity-store.utils';
import { AuthStore } from '../../core/store/auth.store';
import { OrganizationConfiguration } from '@shared/models/organization-config.model';

const ANALYTICS_CHART_HEIGHT = 400;

@Component({
  selector: 'app-redirect-rules-analytics-page',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    PageHeaderComponent,
    RedirectRulesAnalyticsFiltersComponent,
    RedirectRulesAnalyticsResultsComponent,
  ],
  templateUrl: './redirect-rules-analytics-page.component.html',
  styleUrl: './redirect-rules-analytics-page.component.css',
})
export class RedirectRulesAnalyticsPageComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly analyticsStore = inject(RedirectRulesAnalyticsStore);
  private readonly authStore = inject(AuthStore);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly chartHeight = ANALYTICS_CHART_HEIGHT;
  readonly chartTheme = signal({
    base: '#c03762',
    strong: '#8f2045',
    grid: 'rgba(192, 55, 98, 0.2)',
  });
  readonly rangeError = signal<string | null>(null);
  readonly rangeStart = signal<string>('');
  readonly rangeEnd = signal<string>('');
  readonly quickRanges: AnalyticsQuickRange[] = [
    { label: 'Last 3 days', days: 3 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 14 days', days: 14 },
    { label: 'Last 30 days', days: 30 },
  ];
  readonly analyticsRetentionDays = computed(() => {
    const rawConfig = this.authStore.organization()?.configuration ?? undefined;
    const config = OrganizationConfiguration.fromJson(rawConfig);
    const days = Number(config.activeSubscription.limits.analyticsRetentionDays);
    if (!Number.isFinite(days) || days < 1) {
      return 30;
    }
    return Math.floor(days);
  });

  readonly analyticsQuery = computed<RedirectRuleAnalyticsQuery | null>(() => {
    const start = this.toIsoString(this.rangeStart());
    const end = this.toIsoString(this.rangeEnd());
    if (!start || !end) {
      return null;
    }
    return { start, end, limit: 50 };
  });

  readonly analyticsKey = computed(() => {
    const query = this.analyticsQuery();
    return query ? getFilterKey(query) : null;
  });

  readonly topRules = computed<TopRedirectRuleEntry[]>(() => {
    const key = this.analyticsKey();
    if (!key) {
      return [];
    }
    return this.analyticsStore.results()[key] ?? [];
  });

  readonly topRulesLoading = computed(() => {
    const key = this.analyticsKey();
    if (!key) {
      return false;
    }
    return !!this.analyticsStore.isLoading()[key];
  });

  readonly topRulesError = computed(() => {
    const rangeError = this.rangeError();
    if (rangeError) {
      return rangeError;
    }
    const key = this.analyticsKey();
    if (!key) {
      return null;
    }
    return this.analyticsStore.errors()[key] ?? null;
  });

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
    colors: string[];
    fill: ApexFill;
    stroke: ApexStroke;
  }>(() => ({
    chart: {
      type: 'bar',
      height: this.chartHeight,
      toolbar: { show: false },
    },
    xaxis: {
      categories: this.topRules().map((entry) => this.ruleChartLabel(entry)),
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
    colors: [this.chartTheme().base],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.35,
        opacityFrom: 0.92,
        opacityTo: 0.55,
        stops: [0, 70, 100],
      },
    },
    stroke: {
      colors: [this.chartTheme().strong],
      width: 1,
    },
    tooltip: {
      x: {
        formatter: (_value, opts) => this.destinationLabel(opts?.dataPointIndex ?? -1),
      },
      y: {
        formatter: (value) => `${value}`,
      },
    },
    grid: {
      strokeDashArray: 4,
      borderColor: this.chartTheme().grid,
      padding: {
        top: 8,
        right: 12,
        left: 12,
        bottom: 0,
      },
    },
  }));

  ngOnInit(): void {
    if (this.isBrowser) {
      this.chartTheme.set(this.buildChartTheme());
    }
    this.setQuickRange(7);
  }

  setQuickRange(days: number): void {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    this.rangeStart.set(this.toDateTimeInputValue(start));
    this.rangeEnd.set(this.toDateTimeInputValue(end));
    this.rangeError.set(null);
    this.fetchAnalytics();
  }

  applyCustomRange(): void {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    if ((start && !end) || (!start && end)) {
      this.rangeError.set('Provide both start and end date/time.');
      return;
    }
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
        if (startDate > endDate) {
          this.rangeError.set('Start must be before end.');
          return;
        }
      }
    }
    this.rangeError.set(null);
    this.fetchAnalytics();
  }

  openRuleDetails(entry: TopRedirectRuleEntry): void {
    this.dialog.open(RuleAnalyticsDialogComponent, {
      data: { entry },
      closeOnNavigation: true,
      maxWidth: '720px',
      width: 'min(720px, 96vw)',
    });
  }

  onRangeStartChange(value: string): void {
    this.rangeStart.set(value);
  }

  onRangeEndChange(value: string): void {
    this.rangeEnd.set(value);
  }

  private fetchAnalytics(): void {
    const query = this.analyticsQuery();
    if (!query) {
      return;
    }
    this.analyticsStore.searchAnalytics(query);
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
    if (trimmed.length <= 20) {
      return trimmed;
    }
    return `${trimmed.slice(0, 20)}…`;
  }

  private destinationLabel(index: number): string {
    const entry = this.topRules()[index];
    if (!entry) {
      return '';
    }
    const variantLabel = entry.topRequestVariants?.[0]?.destination?.trim();
    if (variantLabel) {
      return variantLabel;
    }
    return entry.rule.destination?.trim() || entry.rule.source;
  }

  private ruleChartLabel(entry: TopRedirectRuleEntry): string {
    if (entry.rule.linkMapId) {
      return `${entry.rule.source} (link map)`;
    }
    return entry.rule.destination?.trim() || entry.rule.source;
  }

  private buildChartTheme(): { base: string; strong: string; grid: string } {
    const base = this.readCssColor('--app-accent') ?? '#c03762';
    const strong =
      this.readCssColor('--app-accent-strong') ?? this.mixColor(base, '#000000', 0.18);
    const grid =
      this.readCssColor('--app-accent-soft') ?? this.mixColor(base, '#ffffff', 0.72);
    return { base, strong, grid };
  }

  private readCssColor(variable: string): string | null {
    if (!this.isBrowser) {
      return null;
    }
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || null;
  }

  private mixColor(color: string, mixWith: string, weight: number): string {
    const base = this.parseColor(color);
    const mix = this.parseColor(mixWith);
    if (!base || !mix) {
      return color;
    }
    const mixChannel = (a: number, b: number) => Math.round(a * (1 - weight) + b * weight);
    return `rgb(${mixChannel(base.r, mix.r)}, ${mixChannel(base.g, mix.g)}, ${mixChannel(base.b, mix.b)})`;
  }

  private parseColor(color: string): { r: number; g: number; b: number } | null {
    const hex = color.replace('#', '').trim();
    if (/^[0-9a-f]{3}$/i.test(hex)) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    const rgbMatch = color.match(/rgba?\\(([^)]+)\\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map((part) => Number.parseFloat(part.trim()));
      if (parts.length >= 3 && parts.every((value) => Number.isFinite(value))) {
        return { r: parts[0], g: parts[1], b: parts[2] };
      }
    }
    return null;
  }
}
