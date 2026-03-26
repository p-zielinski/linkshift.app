import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SITE_CONFIG } from '../../core/config/site-config';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-do-not-sell-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './do-not-sell-page.component.html',
  styleUrl: './legal-page.component.css',
})
export class DoNotSellPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);
  readonly updatedAt = '2026-02-05';

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Do Not Sell or Share`,
      description: `Do not sell or share policy for ${this.siteConfig.name}.`,
      canonicalPath: '/do-not-sell',
      keywords: 'do not sell, data sharing preferences',
      type: 'website',
    });
  }
}
