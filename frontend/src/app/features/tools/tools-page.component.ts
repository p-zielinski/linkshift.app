import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { resolveToolsPageCopy } from '../../core/layout/tools-page-copy.util';

@Component({
  selector: 'app-tools-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, ResourceCardComponent, ResourcePageShellComponent],
  templateUrl: './tools-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsPageComponent {
  private readonly dashboardModeService = inject(DashboardModeService);

  readonly pageCopy = computed(() => resolveToolsPageCopy(this.dashboardModeService.mode()));
}
