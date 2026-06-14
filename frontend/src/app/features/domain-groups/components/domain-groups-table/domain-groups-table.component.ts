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
import type { DomainGroup } from '../../../../core/models/domain-group.model';
import type { RedirectDeliveryMode } from '@shared/models/redirect-delivery-mode.model';

type DomainGroupRowViewModel = {
  group: DomainGroup;
  robotsLabel: string;
  robotsActive: boolean;
  robotsClass: string;
  redirectLabel: string;
  redirectClass: string;
  domainCount: number;
  domainCountTooltip: string;
  canDelete: boolean;
  deleteTooltip: string;
};

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
  templateUrl: './domain-groups-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainGroupsTableComponent {
  readonly groups = input<DomainGroup[]>([]);
  readonly domainCounts = input<Record<string, number>>({});
  readonly domainsLoaded = input(false);
  readonly loading = input(false);

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<DomainGroup>();
  @Output() delete = new EventEmitter<string>();

  readonly columns = ['name', 'redirect', 'robots', 'id', 'domains', 'createdAt', 'actions'];

  readonly rowViewModels = computed((): DomainGroupRowViewModel[] => {
    const groups = this.groups();
    const domainCounts = this.domainCounts();
    const domainsLoaded = this.domainsLoaded();

    return groups.map((group) => {
      const domainCount = domainCounts[group.id] ?? 0;
      const robotsActive = robotsPolicyActive(group.robotsPolicy);

      return {
        group,
        robotsLabel: robotsPolicyLabel(group.robotsPolicy),
        robotsActive,
        robotsClass: robotsActive
          ? 'bg-green-50 text-green-700'
          : 'bg-app-muted/10 text-app-muted',
        redirectLabel: redirectDeliveryModeLabel(group.redirectDeliveryMode),
        redirectClass:
          group.redirectDeliveryMode === 'WITH_NOTICE'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-app-muted/10 text-app-muted',
        domainCount,
        domainCountTooltip: `${domainCount} domains linked`,
        canDelete: domainsLoaded && domainCount === 0,
        deleteTooltip: deleteTooltip(domainsLoaded, domainCount),
      };
    });
  });

  onCreate(): void {
    this.create.emit();
  }

  onEdit(group: DomainGroup): void {
    this.edit.emit(group);
  }

  onDelete(groupId: string): void {
    this.delete.emit(groupId);
  }

  trackRow(_index: number, row: DomainGroupRowViewModel): string {
    return row.group.id;
  }
}

function robotsPolicyLabel(policy: DomainGroup['robotsPolicy']): string {
  switch (policy) {
    case 'ALLOW_ALL':
      return 'Allow all';
    case 'DISALLOW_ALL':
      return 'Disallow all';
    case 'DISALLOW_BAD_BOTS':
      return 'Disallow bad bots';
    case 'CUSTOM':
      return 'Custom';
    case 'NONE':
    default:
      return 'None';
  }
}

function robotsPolicyActive(policy: DomainGroup['robotsPolicy']): boolean {
  return policy !== 'NONE';
}

function redirectDeliveryModeLabel(mode: RedirectDeliveryMode): string {
  switch (mode) {
    case 'WITH_NOTICE':
      return 'With notice';
    case 'INSTANT':
    default:
      return 'Instant';
  }
}

function deleteTooltip(domainsLoaded: boolean, domainCount: number): string {
  if (!domainsLoaded) {
    return 'Domain data is still loading. Try again in a moment.';
  }
  return domainCount > 0
    ? 'Remove linked domains before deleting this group.'
    : 'Delete domain group and its redirect rules.';
}
