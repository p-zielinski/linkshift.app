import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-card.component.html'
})
export class ResourceCardComponent {
  readonly className = input('');
  readonly padding = input('p-4');
}
