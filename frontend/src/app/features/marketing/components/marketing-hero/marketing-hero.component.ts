import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type MarketingMetric = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-marketing-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './marketing-hero.component.html',
  styleUrl: './marketing-hero.component.css'
})
export class MarketingHeroComponent {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly primaryCtaLabel = input.required<string>();
  readonly primaryCtaLink = input.required<string>();
  readonly secondaryCtaLabel = input<string | null>(null);
  readonly secondaryCtaLink = input<string | null>(null);
  readonly highlights = input<string[]>([]);
  readonly metrics = input<MarketingMetric[]>([]);
}
