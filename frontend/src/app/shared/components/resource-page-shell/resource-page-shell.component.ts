import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { PageHeaderComponent } from '../page-header/page-header.component';

@Component({
  selector: 'app-resource-page-shell',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './resource-page-shell.component.html'
})
export class ResourcePageShellComponent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly contentClass = input('');
}
