import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site-config';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './terms-page.component.html',
  styleUrl: './legal-page.component.css',
})
export class TermsPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);
  readonly updatedAt = '2026-05-31';

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Terms`,
      description: `Terms of service for ${this.siteConfig.name}.`,
      canonicalPath: '/terms',
      keywords: 'terms of service, legal terms',
      type: 'website',
    });
  }
}
