import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DashboardPageWorkspaceRegistry } from '../../../core/layout/dashboard-page-workspace.registry';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { WorkspaceSwitcherComponent } from '../workspace-switcher/workspace-switcher.component';

@Component({
  selector: 'app-resource-page-shell',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, WorkspaceSwitcherComponent],
  templateUrl: './resource-page-shell.component.html',
  styleUrl: './resource-page-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcePageShellComponent {
  readonly pageWorkspace = inject(DashboardPageWorkspaceRegistry);

  readonly title = input('');
  readonly subtitle = input('');
  readonly contentClass = input('');
  /** When true (default), body scrolls as one block. When false, body is overflow-hidden for fill-table layouts. */
  readonly bodyScroll = input(true);

  readonly workspaceBinding = computed(() => this.pageWorkspace.binding());

  onWorkspaceChange(id: string): void {
    this.pageWorkspace.binding()?.setSelectedId(id);
  }
}
