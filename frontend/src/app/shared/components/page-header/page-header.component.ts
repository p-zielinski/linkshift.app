import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [],
  templateUrl: './page-header.component.html'
})
export class PageHeaderComponent {
  readonly title = input('');
  readonly subtitle = input('');
}
