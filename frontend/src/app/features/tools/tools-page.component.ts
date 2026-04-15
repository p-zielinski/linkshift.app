import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-tools-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule, PageHeaderComponent],
  templateUrl: './tools-page.component.html',
})
export class ToolsPageComponent {}
