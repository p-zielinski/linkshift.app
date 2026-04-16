import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RedirectTraceTesterToolComponent } from './components/redirect-trace-tester-tool/redirect-trace-tester-tool.component';

@Component({
  selector: 'app-tools-redirect-tester-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    PageHeaderComponent,
    RedirectTraceTesterToolComponent,
  ],
  templateUrl: './tools-redirect-tester-page.component.html',
})
export class ToolsRedirectTesterPageComponent {}
