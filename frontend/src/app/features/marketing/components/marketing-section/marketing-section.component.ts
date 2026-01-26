import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-marketing-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketing-section.component.html',
  styleUrl: './marketing-section.component.css'
})
export class MarketingSectionComponent {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly center = input<boolean>(false);
}
