import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-marketing-cta',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './marketing-cta.component.html',
  styleUrl: './marketing-cta.component.css'
})
export class MarketingCtaComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly primaryLabel = input.required<string>();
  readonly primaryLink = input.required<string>();
  readonly secondaryLabel = input<string | null>(null);
  readonly secondaryLink = input<string | null>(null);
  readonly note = input<string | null>(null);
}
