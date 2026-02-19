import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import type { TopRedirectRuleEntry } from '../../core/models/redirect-rule.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RuleAnalyticsDialogComponent } from '../dashboard/rule-analytics-dialog.component';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
} from 'ng-apexcharts';
import {
  AnalyticsQuickRange,
  RedirectRulesAnalyticsFiltersComponent,
} from './components/redirect-rules-analytics-filters.component';
import { RedirectRulesAnalyticsResultsComponent } from './components/redirect-rules-analytics-results.component';

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
  private readonly redirectRulesApi = inject(RedirectRulesApiService);

  readonly chartHeight = ANALYTICS_CHART_HEIGHT;
  readonly topRules = signal<TopRedirectRuleEntry[]>([]);
  readonly topRulesLoading = signal(false);
  readonly topRulesError = signal<string | null>(null);
  readonly rangeStart = signal<string>('');
  readonly rangeEnd = signal<string>('');
  readonly quickRanges: AnalyticsQuickRange[] = [
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
      height: this.chartHeight,
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
        formatter: (value) => `${value}`,
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

  ngOnInit(): void {
    this.setQuickRange(7);
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

  onRangeStartChange(value: string): void {
    this.rangeStart.set(value);
  }

  onRangeEndChange(value: string): void {
    this.rangeEnd.set(value);
  }

  private async loadTopRules(): Promise<void> {
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
    const label = entry?.rule.destination?.trim() ?? '';
    return label;
  }
}
