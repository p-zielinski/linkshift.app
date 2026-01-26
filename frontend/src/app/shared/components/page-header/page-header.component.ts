import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ title }}</h2>
        @if (subtitle) {
          <div class="subtle">{{ subtitle }}</div>
        }
      </div>
      <ng-content></ng-content>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
