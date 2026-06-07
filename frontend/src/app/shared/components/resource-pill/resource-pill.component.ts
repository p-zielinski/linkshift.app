import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resource-pill',
  standalone: true,
  imports: [MatTooltipModule, MatIconModule],
  templateUrl: './resource-pill.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcePillComponent {
  readonly label = input('');
  readonly tooltip = input('');
}
