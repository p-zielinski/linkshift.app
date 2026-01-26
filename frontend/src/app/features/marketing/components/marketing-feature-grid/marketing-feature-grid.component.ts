import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type MarketingFeature = {
  icon: string;
  title: string;
  description: string;
};

@Component({
  selector: 'app-marketing-feature-grid',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './marketing-feature-grid.component.html',
  styleUrl: './marketing-feature-grid.component.css'
})
export class MarketingFeatureGridComponent {
  readonly features = input<MarketingFeature[]>([]);
}
