import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  NgApexchartsModule,
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
import type {
  RedirectRuleAnalyticsRequestVariant,
  TopRedirectRuleEntry,
} from '../../../core/models/redirect-rule.model';

export type RedirectRulesAnalyticsEntryRowView = {
  entry: TopRedirectRuleEntry;
  destinationValue: string;
  isHighlighted: boolean;
  topRequestVariantsPreview: RedirectRuleAnalyticsRequestVariant[];
  sourceRowLabel: string;
  linkKeysRowLabel: string;
};

type ChartOptions = {
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  colors: string[];
  fill: ApexFill;
  stroke: ApexStroke;
};

@Component({
  selector: 'app-redirect-rules-analytics-results',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, NgApexchartsModule],
  templateUrl: './redirect-rules-analytics-results.component.html',
  styleUrl: './redirect-rules-analytics-results.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-0 flex-1 flex-col',
    '[style.--chart-height.px]': 'chartHeight()',
  },
})
export class RedirectRulesAnalyticsResultsComponent {
  readonly entries = input<TopRedirectRuleEntry[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly chartSeries = input<ApexAxisChartSeries>([]);
  readonly chartOptions = input.required<ChartOptions>();
  readonly chartHeight = input(400);
  readonly campaignMode = input(false);
  readonly highlightedRuleId = input<string | null>(null);
  readonly highlightedLinkKey = input<string | null>(null);

  @Output() openDetails = new EventEmitter<TopRedirectRuleEntry>();
  @Output() retry = new EventEmitter<void>();

  readonly sourceRowLabel = computed(() => (this.campaignMode() ? 'Short link' : 'Source'));

  readonly linkKeysRowLabel = computed(() => (this.campaignMode() ? 'Top keys' : 'Link keys'));

  readonly entryRowViews = computed((): RedirectRulesAnalyticsEntryRowView[] => {
    const campaignMode = this.campaignMode();
    const highlightedRuleId = this.highlightedRuleId();
    const highlightedLinkKey = this.highlightedLinkKey();

    const sourceRowLabel = campaignMode ? 'Short link' : 'Source';
    const linkKeysRowLabel = campaignMode ? 'Top keys' : 'Link keys';

    return this.entries().map((entry) => ({
      entry,
      destinationValue: resolveDestinationValue(entry, campaignMode),
      isHighlighted: isEntryHighlighted(entry, highlightedRuleId, highlightedLinkKey),
      topRequestVariantsPreview: entry.topRequestVariants.slice(0, 3),
      sourceRowLabel,
      linkKeysRowLabel,
    }));
  });

  readonly chartAriaLabel = computed(() => {
    const count = this.entries().length;
    const noun = this.campaignMode() ? 'links' : 'rules';
    return `Bar chart of top ${count} ${noun} by hits`;
  });

  readonly chartSummary = computed(() => {
    const entries = this.entries();
    if (entries.length === 0) {
      return '';
    }

    const topEntries = entries
      .slice(0, 3)
      .map((entry) => `${entry.rule.source}: ${entry.hits} hits`)
      .join(', ');

    return `${this.chartAriaLabel()}. Top performers: ${topEntries}.`;
  });
}

function resolveDestinationValue(entry: TopRedirectRuleEntry, campaignMode: boolean): string {
  const destination = entry.rule.destination?.trim();
  if (destination) {
    return destination;
  }
  if (campaignMode) {
    return 'Set by link key';
  }
  return 'Dynamic / link map destination';
}

function isEntryHighlighted(
  entry: TopRedirectRuleEntry,
  highlightedRuleId: string | null,
  highlightedLinkKey: string | null,
): boolean {
  if (highlightedRuleId && entry.rule.id === highlightedRuleId) {
    return true;
  }

  if (!highlightedLinkKey) {
    return false;
  }

  return entry.topLinkMapKeys.some((keyEntry) => keyEntry.key === highlightedLinkKey);
}
