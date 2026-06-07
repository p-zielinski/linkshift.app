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
import type { Domain } from '../../../../core/models/domain.model';

type GroupMap = Record<string, { name: string } | undefined>;

type DomainRowViewModel = {
  domain: Domain;
  groupLabel: string;
  groupTooltip: string;
};

@Component({
  selector: 'app-domains-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ResourcePillComponent,
  ],
  templateUrl: './domains-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainsTableComponent {
  readonly switchSiteOrAllSitesCopy = switchSiteOrAllSitesCopy();

  readonly domains = input<Domain[]>([]);
  readonly groupMap = input<GroupMap>({});
  readonly loading = input(false);
  readonly workspaceFilterActive = input(false);
  readonly totalUnfilteredCount = input<number | undefined>(undefined);

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Domain>();
  @Output() delete = new EventEmitter<string>();

  readonly columns = ['name', 'id', 'group', 'createdAt', 'actions'];

  readonly rowViewModels = computed((): DomainRowViewModel[] => {
    const groupMap = this.groupMap();

    return this.domains().map((domain) => ({
      domain,
      groupLabel: groupLabel(groupMap, domain.domainGroupId),
      groupTooltip: groupTooltip(groupMap, domain.domainGroupId),
    }));
  });

  onCreate(): void {
    this.create.emit();
  }

  onEdit(domain: Domain): void {
    this.edit.emit(domain);
  }

  onDelete(domainId: string): void {
    this.delete.emit(domainId);
  }

  trackRow(_index: number, row: DomainRowViewModel): string {
    return row.domain.id;
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
