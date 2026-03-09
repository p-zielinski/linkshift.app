import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { LinkMap } from '../../../../core/models/link-map.model';

@Component({
  selector: 'app-link-maps-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './link-maps-table.component.html'
})
export class LinkMapsTableComponent {
  readonly maps = input<LinkMap[]>([]);
  readonly activeGroupId = input('');
  readonly loading = input(false);

  @Output() edit = new EventEmitter<LinkMap>();
  @Output() delete = new EventEmitter<LinkMap>();

  readonly columns = ['name', 'queryMatch', 'caseSensitive', 'fallback', 'actions'];

  formatQueryMatch(map: LinkMap): string {
    if (map.queryMatch === 'ignore') {
      return 'Ignore';
    }
    if (map.queryMatch === 'subset') {
      return 'Subset';
    }
    return 'Exact';
  }

  queryMatchIcon(map: LinkMap): string {
    if (map.queryMatch === 'ignore') {
      return 'search_off';
    }
    if (map.queryMatch === 'subset') {
      return 'filter_alt';
    }
    return 'manage_search';
  }

  queryMatchTooltip(map: LinkMap): string {
    if (map.queryMatch === 'ignore') {
      return 'Query match: ignore (path only)';
    }
    if (map.queryMatch === 'subset') {
      return 'Query match: subset (extra params allowed)';
    }
    return 'Query match: exact (path + query)';
  }

  onEdit(map: LinkMap): void {
    this.edit.emit(map);
  }

  onDelete(map: LinkMap): void {
    this.delete.emit(map);
  }
}
