import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-table-paginator',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './table-paginator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePaginatorComponent {
  readonly position = input<'start' | 'center' | 'end'>('center');
  readonly showCurrentPage = input(true);
  readonly isLoading = input(false);
  readonly currentPage = input(1);
  readonly hasNextPage = input(false);
  readonly hasMore = input(false);
  readonly pageLimitOptions = input<number[]>([20]);
  readonly pageLimit = input(20);

  @Output() currentPageChange = new EventEmitter<number>();
  @Output() pageLimitChange = new EventEmitter<number>();

  readonly canGoPrevious = computed(() => this.currentPage() > 1 && !this.isLoading());
  readonly canGoNext = computed(
    () => (this.hasNextPage() || this.hasMore()) && !this.isLoading(),
  );

  onPreviousPage(): void {
    if (!this.canGoPrevious()) {
      return;
    }
    this.currentPageChange.emit(this.currentPage() - 1);
  }

  onNextPage(): void {
    if (!this.canGoNext()) {
      return;
    }
    this.currentPageChange.emit(this.currentPage() + 1);
  }

  onPageLimitChange(limit: number): void {
    if (limit === this.pageLimit()) {
      return;
    }
    this.pageLimitChange.emit(limit);
  }
}
