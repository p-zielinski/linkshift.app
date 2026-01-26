import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type MarketingRuleExample = {
  title: string;
  description: string;
  source: string;
  destination: string;
  condition?: string;
  note?: string;
};

@Component({
  selector: 'app-marketing-example-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './marketing-example-card.component.html',
  styleUrl: './marketing-example-card.component.css'
})
export class MarketingExampleCardComponent {
  readonly example = input.required<MarketingRuleExample>();
}
