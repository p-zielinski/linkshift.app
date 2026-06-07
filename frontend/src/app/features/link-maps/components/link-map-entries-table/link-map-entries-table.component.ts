import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { LinkMapEntry } from '../../../../core/models/link-map.model';

type LinkMapEntryRowViewModel = {
  entry: LinkMapEntry;
  isSelected: boolean;
};

@Component({
  selector: 'app-link-map-entries-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './link-map-entries-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkMapEntriesTableComponent {
  readonly entries = input<LinkMapEntry[]>([]);
  readonly loading = input(false);
  readonly allSelected = input(false);
  readonly someSelected = input(false);
  readonly selectedIds = input<Set<string>>(new Set<string>());

  @Output() toggleAll = new EventEmitter<boolean>();
  @Output() toggleOne = new EventEmitter<{ id: string; checked: boolean }>();
  @Output() edit = new EventEmitter<LinkMapEntry>();

  readonly columns = ['select', 'key', 'destination', 'actions'];

  readonly rowViewModels = computed((): LinkMapEntryRowViewModel[] => {
    const selectedIds = this.selectedIds();

    return this.entries().map((entry) => ({
      entry,
      isSelected: selectedIds.has(entry.id),
    }));
  });

  onToggleAll(checked: boolean): void {
    this.toggleAll.emit(checked);
  }

  onToggleOne(id: string, checked: boolean): void {
    this.toggleOne.emit({ id, checked });
  }

  onEdit(entry: LinkMapEntry): void {
    this.edit.emit(entry);
  }

  trackRow(_index: number, row: LinkMapEntryRowViewModel): string {
    return row.entry.id;
  }
}
