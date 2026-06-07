import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ResourceCardComponent } from '../resource-card/resource-card.component';

@Component({
  selector: 'app-resource-table-card',
  standalone: true,
  imports: [CommonModule, ResourceCardComponent],
  templateUrl: './resource-table-card.component.html',
  styleUrl: './resource-table-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceTableCardComponent {
  readonly showFooter = input(false);
  readonly className = input('');
  readonly tableClass = input('');
  readonly footerClass = input('');
}
