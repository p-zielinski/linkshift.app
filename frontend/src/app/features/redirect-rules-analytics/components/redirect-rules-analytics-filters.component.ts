import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type AnalyticsQuickRange = {
  label: string;
  days: number;
};

@Component({
  selector: 'app-redirect-rules-analytics-filters',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './redirect-rules-analytics-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectRulesAnalyticsFiltersComponent {
  @Input() quickRanges: AnalyticsQuickRange[] = [];
  @Input() rangeStart = '';
  @Input() rangeEnd = '';

  @Output() quickRangeSelected = new EventEmitter<number>();
  @Output() rangeStartChange = new EventEmitter<string>();
  @Output() rangeEndChange = new EventEmitter<string>();
  @Output() applyRange = new EventEmitter<void>();

  onRangeStartChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.rangeStartChange.emit(target?.value ?? '');
  }

  onRangeEndChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.rangeEndChange.emit(target?.value ?? '');
  }
}
