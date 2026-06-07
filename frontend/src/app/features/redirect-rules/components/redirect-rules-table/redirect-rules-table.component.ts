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
import type { RedirectRule } from '../../../../core/models/redirect-rule.model';

type GroupMap = Record<string, { name: string } | undefined>;

type RedirectRuleRowViewModel = {
  rule: RedirectRule;
  matchMethodsText: string;
  pathMatchIcon: string;
  pathMatchTooltip: string;
  queryMatchIcon: string;
  queryMatchTooltip: string;
  stateClass: string;
  stateLabel: string;
  groupLabel: string;
  groupTooltip: string;
};

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
  templateUrl: './redirect-rules-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectRulesTableComponent {
  readonly rules = input<RedirectRule[]>([]);
  readonly activeGroupId = input('');
  readonly groupMap = input<GroupMap>({});
  readonly loading = input(false);

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
    'actions',
  ];

  readonly rowViewModels = computed((): RedirectRuleRowViewModel[] => {
    const rules = this.rules();
    const groupMap = this.groupMap();

    return rules.map((rule) => ({
      rule,
      matchMethodsText: formatMatchMethods(rule.matchMethod),
      pathMatchIcon: pathMatchIcon(rule),
      pathMatchTooltip: pathMatchTooltip(rule),
      queryMatchIcon: queryMatchIcon(rule),
      queryMatchTooltip: queryMatchTooltip(rule),
      stateClass: stateClass(rule),
      stateLabel: stateLabel(rule),
      groupLabel: groupLabel(rule.domainGroupId, groupMap),
      groupTooltip: groupTooltip(rule.domainGroupId, groupMap),
    }));
  });

  onEdit(rule: RedirectRule): void {
    this.edit.emit(rule);
  }

  onDelete(ruleId: string): void {
    this.delete.emit(ruleId);
  }

  trackRow(_index: number, row: RedirectRuleRowViewModel): string {
    return row.rule.id;
  }
}

function formatMatchMethods(methods: string[] | undefined): string {
  if (!methods || methods.length === 0) {
    return 'All';
  }
  return methods.join(', ');
}

function pathMatchIcon(rule: RedirectRule): string {
  return rule.pathMatch === 'prefix' ? 'call_split' : 'rule';
}

function pathMatchTooltip(rule: RedirectRule): string {
  return rule.pathMatch === 'prefix'
    ? 'Path match: prefix (/v1/*)'
    : 'Path match: exact';
}

function queryMatchIcon(rule: RedirectRule): string {
  if (rule.queryMatch === 'ignore') {
    return 'search_off';
  }
  if (rule.queryMatch === 'subset') {
    return 'filter_alt';
  }
  return 'manage_search';
}

function queryMatchTooltip(rule: RedirectRule): string {
  if (rule.queryMatch === 'ignore') {
    return 'Query match: ignore';
  }
  if (rule.queryMatch === 'subset') {
    return 'Query match: subset (extra params allowed)';
  }
  return 'Query match: exact (includes query)';
}

function stateLabel(rule: RedirectRule): string {
  return rule.isBlocked ? 'Blocked' : 'Active';
}

function stateClass(rule: RedirectRule): string {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]';
  return rule.isBlocked
    ? `${base} bg-red-50 text-red-700`
    : `${base} bg-emerald-50 text-emerald-700`;
}

function groupLabel(groupId: string, groupMap: GroupMap): string {
  return groupMap[groupId]?.name ?? groupId;
}

function groupTooltip(groupId: string, groupMap: GroupMap): string {
  const name = groupMap[groupId]?.name;
  return name
    ? `Domain group: ${name} (${groupId})`
    : `Domain group Id: ${groupId}`;
}
