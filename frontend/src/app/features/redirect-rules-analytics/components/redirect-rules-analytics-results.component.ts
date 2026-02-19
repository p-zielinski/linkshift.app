import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import type { TopRedirectRuleEntry } from '../../../core/models/redirect-rule.model';

@Component({
  selector: 'app-redirect-rules-analytics-results',
  standalone: true,
  imports: [CommonModule, MatButtonModule, NgApexchartsModule],
  templateUrl: './redirect-rules-analytics-results.component.html',
})
export class RedirectRulesAnalyticsResultsComponent {
  @Input() entries: TopRedirectRuleEntry[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() chartSeries: ApexAxisChartSeries = [];
  @Input() chartOptions!: {
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
  @Input() chartHeight = 400;

  @Output() openDetails = new EventEmitter<TopRedirectRuleEntry>();
}
