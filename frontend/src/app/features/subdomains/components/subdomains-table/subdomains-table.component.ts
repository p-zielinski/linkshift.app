import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResourcePillComponent } from '../../../../shared/components/resource-pill/resource-pill.component';
import type { Subdomain } from '../../../../core/models/subdomain.model';

type GroupMap = Record<string, { name: string } | undefined>;

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
  templateUrl: './subdomains-table.component.html'
})
export class SubdomainsTableComponent {
  readonly subdomains = input<Subdomain[]>([]);
  readonly groupMap = input<GroupMap>({});

  @Output() edit = new EventEmitter<Subdomain>();
  @Output() delete = new EventEmitter<string>();

  readonly columns = ['name', 'fullHost', 'id', 'group', 'createdAt', 'actions'];

  readonly baseHost = input('');

  groupLabel(groupId: string): string {
    return this.groupMap()[groupId]?.name ?? groupId;
  }

  groupTooltip(groupId: string): string {
    const name = this.groupMap()[groupId]?.name;
    return name
      ? `Domain group: ${name} (${groupId})`
      : `Domain group ID: ${groupId}`;
  }

  toFullHost(name: string): string {
    const baseHost = this.baseHost().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    if (!baseHost) {
      return name;
    }
    return `${name}.${baseHost}`;
  }

  onEdit(subdomain: Subdomain): void {
    this.edit.emit(subdomain);
  }

  onDelete(subdomainId: string): void {
    this.delete.emit(subdomainId);
  }
}
