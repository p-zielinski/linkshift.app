import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardModeService } from '../../../../core/layout/dashboard-mode.service';
import { switchSiteOrAllSitesCopy } from '../../../../core/layout/page-workspace-empty-state.copy';
import {
  formatShortUrlsTooltip,
  type AggregatedLinkRow,
} from '../../links-aggregation.util';

@Component({
  selector: 'app-links-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './links-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinksTableComponent {
  private readonly dashboardModeService = inject(DashboardModeService);

  readonly switchSiteOrAllSitesCopy = switchSiteOrAllSitesCopy();

  readonly rows = input<AggregatedLinkRow[]>([]);
  readonly loading = input(false);
  readonly searchTerm = input('');
  readonly workspaceFilterActive = input(false);
  readonly totalUnfilteredCount = input<number | undefined>(undefined);

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<AggregatedLinkRow>();
  @Output() copy = new EventEmitter<AggregatedLinkRow>();
  @Output() stats = new EventEmitter<AggregatedLinkRow>();

  private readonly campaignColumns = ['shortPath', 'destination', 'actions'];
  private readonly advancedColumns = ['shortPath', 'destination', 'linkMapName', 'actions'];

  readonly columns = computed(() =>
    this.dashboardModeService.isCampaignMode() ? this.campaignColumns : this.advancedColumns,
  );

  shortPathTooltip(row: AggregatedLinkRow): string {
    return formatShortUrlsTooltip(row.shortPath, row.shortUrls);
  }

  rowActionLabel(row: AggregatedLinkRow): string {
    return row.shortPath;
  }

  onCreate(): void {
    this.create.emit();
  }

  onEdit(row: AggregatedLinkRow): void {
    this.edit.emit(row);
  }

  onCopy(row: AggregatedLinkRow): void {
    this.copy.emit(row);
  }

  onStats(row: AggregatedLinkRow): void {
    this.stats.emit(row);
  }

  trackRow(_index: number, row: AggregatedLinkRow): string {
    return row.id;
  }
}
