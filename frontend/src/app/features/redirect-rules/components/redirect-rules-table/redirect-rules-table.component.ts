import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResourcePillComponent } from '../../../../shared/components/resource-pill/resource-pill.component';
import type { RedirectRule } from '../../../../core/models/redirect-rule.model';

type GroupMap = Record<string, { name: string } | undefined>;

@Component({
  selector: 'app-redirect-rules-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ResourcePillComponent,
  ],
  templateUrl: './redirect-rules-table.component.html'
})
export class RedirectRulesTableComponent {
  readonly rules = input<RedirectRule[]>([]);
  readonly groupMap = input<GroupMap>({});

  @Output() edit = new EventEmitter<RedirectRule>();
  @Output() delete = new EventEmitter<string>();

  readonly columns = [
    'priority',
    'id',
    'matchMethod',
    'matchMode',
    'source',
    'destination',
    'statusCode',
    'state',
    'group',
    'createdAt',
    'actions'
  ];

  groupLabel(groupId: string): string {
    return this.groupMap()[groupId]?.name ?? groupId;
  }

  groupTooltip(groupId: string): string {
    const name = this.groupMap()[groupId]?.name;
    return name
      ? `Domain group: ${name} (${groupId})`
      : `Domain group Id: ${groupId}`;
  }

  formatMatchMethods(methods: string[] | undefined): string {
    if (!methods || methods.length === 0) {
      return 'All';
    }
    return methods.join(', ');
  }

  pathMatchIcon(rule: RedirectRule): string {
    return rule.pathMatch === 'prefix' ? 'call_split' : 'rule';
  }

  pathMatchTooltip(rule: RedirectRule): string {
    return rule.pathMatch === 'prefix'
      ? 'Path match: prefix (/v1/*)'
      : 'Path match: exact';
  }

  queryMatchIcon(rule: RedirectRule): string {
    if (rule.queryMatch === 'ignore') {
      return 'search_off';
    }
    if (rule.queryMatch === 'subset') {
      return 'filter_alt';
    }
    return 'manage_search';
  }

  queryMatchTooltip(rule: RedirectRule): string {
    if (rule.queryMatch === 'ignore') {
      return 'Query match: ignore';
    }
    if (rule.queryMatch === 'subset') {
      return 'Query match: subset (extra params allowed)';
    }
    return 'Query match: exact (includes query)';
  }

  stateLabel(rule: RedirectRule): string {
    return rule.isBlocked ? 'Blocked' : 'Active';
  }

  stateClass(rule: RedirectRule): string {
    const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]';
    return rule.isBlocked
      ? `${base} bg-red-50 text-red-700`
      : `${base} bg-emerald-50 text-emerald-700`;
  }

  onEdit(rule: RedirectRule): void {
    this.edit.emit(rule);
  }

  onDelete(ruleId: string): void {
    this.delete.emit(ruleId);
  }
}
