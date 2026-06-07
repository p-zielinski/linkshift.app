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
import { ResourcePillComponent } from '../../../../shared/components/resource-pill/resource-pill.component';
import { switchSiteOrAllSitesCopy } from '../../../../core/layout/page-workspace-empty-state.copy';
import type { Subdomain } from '../../../../core/models/subdomain.model';

type GroupMap = Record<string, { name: string } | undefined>;

type SubdomainRowViewModel = {
  subdomain: Subdomain;
  fullHost: string;
  groupLabel: string;
  groupTooltip: string;
};

@Component({
  selector: 'app-subdomains-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ResourcePillComponent,
  ],
  templateUrl: './subdomains-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubdomainsTableComponent {
  readonly switchSiteOrAllSitesCopy = switchSiteOrAllSitesCopy();

  readonly subdomains = input<Subdomain[]>([]);
  readonly groupMap = input<GroupMap>({});
  readonly loading = input(false);
  readonly workspaceFilterActive = input(false);
  readonly totalUnfilteredCount = input<number | undefined>(undefined);
  readonly baseHost = input('');

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Subdomain>();
  @Output() delete = new EventEmitter<string>();

  readonly columns = ['name', 'fullHost', 'id', 'group', 'createdAt', 'actions'];

  readonly rowViewModels = computed((): SubdomainRowViewModel[] => {
    const groupMap = this.groupMap();
    const baseHost = this.baseHost();

    return this.subdomains().map((subdomain) => ({
      subdomain,
      fullHost: toFullHost(baseHost, subdomain.name),
      groupLabel: groupLabel(groupMap, subdomain.domainGroupId),
      groupTooltip: groupTooltip(groupMap, subdomain.domainGroupId),
    }));
  });

  onCreate(): void {
    this.create.emit();
  }

  onEdit(subdomain: Subdomain): void {
    this.edit.emit(subdomain);
  }

  onDelete(subdomainId: string): void {
    this.delete.emit(subdomainId);
  }

  trackRow(_index: number, row: SubdomainRowViewModel): string {
    return row.subdomain.id;
  }
}

function groupLabel(groupMap: GroupMap, groupId: string): string {
  return groupMap[groupId]?.name ?? groupId;
}

function groupTooltip(groupMap: GroupMap, groupId: string): string {
  const name = groupMap[groupId]?.name;
  return name
    ? `Domain group: ${name} (${groupId})`
    : `Domain group ID: ${groupId}`;
}

function toFullHost(baseHost: string, name: string): string {
  const normalizedBaseHost = baseHost.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  if (!normalizedBaseHost) {
    return name;
  }
  return `${name}.${normalizedBaseHost}`;
}
