import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type MarketingScreenshotSlide = {
  src: string;
  alt: string;
  caption?: string;
};

@Component({
  selector: 'app-marketing-screenshot-carousel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './marketing-screenshot-carousel.component.html',
  styleUrl: './marketing-screenshot-carousel.component.css',
  host: {
    '[style.--carousel-offset]': 'activeIndex() * 100',
  },
})
export class MarketingScreenshotCarouselComponent {
  readonly slides = input.required<MarketingScreenshotSlide[]>();
  readonly ariaLabel = input('LinkShift product screenshots');

  readonly activeIndex = signal(0);

  readonly activeSlide = computed(() => this.slides()[this.activeIndex()] ?? null);
  readonly slideCount = computed(() => this.slides().length);

  goTo(index: number): void {
    const count = this.slideCount();
    if (count === 0) return;

    const normalized = ((index % count) + count) % count;
    this.activeIndex.set(normalized);
  }

  next(): void {
    this.goTo(this.activeIndex() + 1);
  }

  prev(): void {
    this.goTo(this.activeIndex() - 1);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    }
  }
}
