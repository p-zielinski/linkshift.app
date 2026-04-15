import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { QrCodeGeneratorToolComponent } from './components/qr-code-generator-tool/qr-code-generator-tool.component';

@Component({
  selector: 'app-tools-qr-code-generator-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    PageHeaderComponent,
    QrCodeGeneratorToolComponent,
  ],
  templateUrl: './tools-qr-code-generator-page.component.html',
})
export class ToolsQrCodeGeneratorPageComponent {}
