import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resource-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceCardComponent {
  readonly className = input('');
  readonly padding = input('p-4');
  /** Stretch card to fill a flex parent (table shells). */
  readonly fillHeight = input(false);
}
