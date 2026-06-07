import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { selectSiteInHeaderMenuToPreviewTestsCopy } from '../../../../core/layout/page-workspace-empty-state.copy';
import { ResourceCardComponent } from '../../../../shared/components/resource-card/resource-card.component';

export type RedirectTestsMetrics = {
  total: number;
  passed: number;
  failed: number;
  errored: number;
  notRun: number;
  runCount: number;
  passRate: number;
};

const EMPTY_METRICS: RedirectTestsMetrics = {
  total: 0,
  passed: 0,
  failed: 0,
  errored: 0,
  notRun: 0,
  runCount: 0,
  passRate: 0,
};

@Component({
  selector: 'app-redirect-tests-summary-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ResourceCardComponent],
  templateUrl: './redirect-tests-summary-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectTestsSummaryCardComponent {
  readonly noSiteSelectedCopy = selectSiteInHeaderMenuToPreviewTestsCopy();

  readonly activeGroupId = input('');
  readonly activeGroupLabel = input('');
  readonly metrics = input<RedirectTestsMetrics>(EMPTY_METRICS);
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  @Output() runTests = new EventEmitter<void>();

  onRunTests(): void {
    this.runTests.emit();
  }
}
