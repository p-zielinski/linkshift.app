import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResourcePillComponent } from '../../../../shared/components/resource-pill/resource-pill.component';
import type { Domain } from '../../../../core/models/domain.model';

type GroupMap = Record<string, { name: string } | undefined>;

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
  templateUrl: './domains-table.component.html'
})
export class DomainsTableComponent {
  readonly domains = input<Domain[]>([]);
  readonly groupMap = input<GroupMap>({});

  @Output() edit = new EventEmitter<Domain>();
  @Output() delete = new EventEmitter<string>();

  readonly columns = ['name', 'id', 'group', 'createdAt', 'actions'];

  groupLabel(groupId: string): string {
    return this.groupMap()[groupId]?.name ?? groupId;
  }

  groupTooltip(groupId: string): string {
    const name = this.groupMap()[groupId]?.name;
    return name
      ? `Domain group: ${name} (${groupId})`
      : `Domain group ID: ${groupId}`;
  }

  onEdit(domain: Domain): void {
    this.edit.emit(domain);
  }

  onDelete(domainId: string): void {
    this.delete.emit(domainId);
  }
}
