import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { QrCodeGeneratorToolComponent } from './components/qr-code-generator-tool/qr-code-generator-tool.component';

@Component({
  selector: 'app-tools-qr-code-generator-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    ResourceCardComponent,
    ResourcePageShellComponent,
    QrCodeGeneratorToolComponent,
  ],
  templateUrl: './tools-qr-code-generator-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolsQrCodeGeneratorPageComponent {}
