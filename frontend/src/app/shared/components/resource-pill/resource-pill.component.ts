import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resource-pill',
  standalone: true,
  imports: [MatTooltipModule, MatIconModule],
  template: `
    <span class="resource-pill" [matTooltip]="tooltip">
      <mat-icon>link</mat-icon>
      <span>{{ label }}</span>
    </span>
  `,
  styles: [
    `
      .resource-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(59, 47, 54, 0.1);
        font-size: 12px;
        color: #3b2f36;
      }

      mat-icon {
        font-size: 14px;
        height: 14px;
        width: 14px;
      }
    `
  ]
})
export class ResourcePillComponent {
  @Input() label = '';
  @Input() tooltip = '';
}
