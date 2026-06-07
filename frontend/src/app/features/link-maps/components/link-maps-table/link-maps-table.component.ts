import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  input,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { selectSiteInHeaderMenuCopy } from '../../../../core/layout/page-workspace-empty-state.copy';
import type { LinkMap } from '../../../../core/models/link-map.model';

type LinkMapRowViewModel = {
  map: LinkMap;
  queryMatchIcon: string;
  queryMatchTooltip: string;
  queryMatchLabel: string;
  canDelete: boolean;
  deleteTooltip: string;
};

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
  templateUrl: './link-maps-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkMapsTableComponent {
  readonly noSiteSelectedCopy = selectSiteInHeaderMenuCopy('link maps');

  readonly maps = input<LinkMap[]>([]);
  readonly activeGroupId = input('');
  readonly loading = input(false);

  @Output() manage = new EventEmitter<LinkMap>();
  @Output() edit = new EventEmitter<LinkMap>();
  @Output() delete = new EventEmitter<LinkMap>();

  readonly columns = ['name', 'entriesCount', 'queryMatch', 'caseSensitive', 'fallback', 'actions'];

  readonly rowViewModels = computed((): LinkMapRowViewModel[] => {
    return this.maps().map((map) => {
      const canDelete = map.entriesCount === 0;

      return {
        map,
        queryMatchIcon: queryMatchIcon(map),
        queryMatchTooltip: queryMatchTooltip(map),
        queryMatchLabel: queryMatchLabel(map),
        canDelete,
        deleteTooltip: deleteTooltip(canDelete),
      };
    });
  });

  onManage(map: LinkMap): void {
    this.manage.emit(map);
  }

  onEdit(map: LinkMap): void {
    this.edit.emit(map);
  }

  onDelete(map: LinkMap): void {
    if (map.entriesCount !== 0) {
      return;
    }
    this.delete.emit(map);
  }

  trackRow(_index: number, row: LinkMapRowViewModel): string {
    return row.map.id;
  }
}

function queryMatchLabel(map: LinkMap): string {
  if (map.queryMatch === 'ignore') {
    return 'Ignore';
  }
  if (map.queryMatch === 'subset') {
    return 'Subset';
  }
  return 'Exact';
}

function queryMatchIcon(map: LinkMap): string {
  if (map.queryMatch === 'ignore') {
    return 'search_off';
  }
  if (map.queryMatch === 'subset') {
    return 'filter_alt';
  }
  return 'manage_search';
}

function queryMatchTooltip(map: LinkMap): string {
  if (map.queryMatch === 'ignore') {
    return 'Query match: ignore (path only)';
  }
  if (map.queryMatch === 'subset') {
    return 'Query match: subset (extra params allowed)';
  }
  return 'Query match: exact (path + query)';
}

function deleteTooltip(canDelete: boolean): string {
  return canDelete
    ? 'Delete link map'
    : 'This link map cannot be deleted while it contains entries. Remove all entries first.';
}
