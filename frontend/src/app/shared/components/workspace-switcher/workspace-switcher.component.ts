import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

type WorkspaceGroup = { id: string; name: string };

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './workspace-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceSwitcherComponent {
  readonly label = input('Site');
  readonly groups = input<readonly WorkspaceGroup[]>([]);
  readonly selectedId = input('');
  readonly includeAllOption = input(false);
  readonly allOptionLabel = input('All sites');

  readonly selectedLabel = computed(() => {
    const selectedId = this.selectedId();
    if (!selectedId) {
      return this.includeAllOption()
        ? this.allOptionLabel()
        : `Select ${this.label().toLowerCase()}`;
    }

    return this.groups().find((group) => group.id === selectedId)?.name ?? this.label();
  });

  readonly triggerAriaLabel = computed(
    () => `${this.label()}: ${this.selectedLabel()}. Open menu to change.`,
  );

  readonly selectedIdChange = output<string>();

  select(id: string): void {
    this.selectedIdChange.emit(id);
  }
}
