import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resource-pill',
  standalone: true,
  imports: [MatTooltipModule, MatIconModule],
  templateUrl: './resource-pill.component.html'
})
export class ResourcePillComponent {
  @Input() label = '';
  @Input() tooltip = '';
}
