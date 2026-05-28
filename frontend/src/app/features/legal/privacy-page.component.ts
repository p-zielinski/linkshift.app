import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SITE_CONFIG } from '../../core/config/site-config';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-page.component.html',
  styleUrl: './legal-page.component.css',
})
export class PrivacyPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);
  readonly updatedAt = '2026-05-28';

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Privacy`,
      description: `Privacy policy for ${this.siteConfig.name}.`,
      canonicalPath: '/privacy',
      keywords: 'privacy policy, data protection',
      type: 'website',
    });
  }
}
