import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { SetupChecklistService } from '../../shared/components/setup-checklist/setup-checklist.service';
import { RedirectTraceTesterToolComponent } from './components/redirect-trace-tester-tool/redirect-trace-tester-tool.component';

@Component({
  selector: 'app-tools-redirect-tester-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    ResourceCardComponent,
    ResourcePageShellComponent,
    RedirectTraceTesterToolComponent,
  ],
  templateUrl: './tools-redirect-tester-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsRedirectTesterPageComponent {
  private readonly setupChecklist = inject(SetupChecklistService);

  onRedirectTraceCompleted(): void {
    this.setupChecklist.markRedirectTesterUsed();
  }
}
