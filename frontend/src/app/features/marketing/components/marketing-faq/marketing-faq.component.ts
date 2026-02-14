import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

export type MarketingFaqItem = {
  question: string;
  answer: string;
};

@Component({
  selector: 'app-marketing-faq',
  standalone: true,
  imports: [CommonModule, MatExpansionModule],
  templateUrl: './marketing-faq.component.html',
  styleUrl: './marketing-faq.component.css'
})
export class MarketingFaqComponent {
  readonly items = input<MarketingFaqItem[]>([]);
}
