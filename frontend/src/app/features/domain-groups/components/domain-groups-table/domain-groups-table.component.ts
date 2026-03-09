import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResourcePillComponent } from '../../../../shared/components/resource-pill/resource-pill.component';
import type { DomainGroup } from '../../../../core/models/domain-group.model';

@Component({
  selector: 'app-domain-groups-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ResourcePillComponent,
  ],
  templateUrl: './domain-groups-table.component.html'
})
export class DomainGroupsTableComponent {
  readonly groups = input<DomainGroup[]>([]);
  readonly domainCounts = input<Record<string, number>>({});
  readonly domainsLoaded = input(false);

  @Output() edit = new EventEmitter<DomainGroup>();
  @Output() delete = new EventEmitter<string>();

  readonly columns = ['name', 'id', 'domains', 'createdAt', 'actions'];

  domainCount(groupId: string): number {
    return this.domainCounts()[groupId] ?? 0;
  }

  deleteTooltip(groupId: string): string {
    if (!this.domainsLoaded()) {
      return 'Domain data is still loading. Try again in a moment.';
    }
    return this.domainCount(groupId) > 0
      ? 'Remove linked domains before deleting this group.'
      : 'Delete domain group and its redirect rules.';
  }

  canDelete(groupId: string): boolean {
    return this.domainsLoaded() && this.domainCount(groupId) === 0;
  }

  onEdit(group: DomainGroup): void {
    this.edit.emit(group);
  }

  onDelete(groupId: string): void {
    this.delete.emit(groupId);
  }
}
