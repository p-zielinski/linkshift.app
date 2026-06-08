import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site-config';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-cookies-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookies-page.component.html',
  styleUrl: './legal-page.component.css',
})
export class CookiesPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);
  readonly updatedAt = '2026-06-08';

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Cookies`,
      description: `Cookie policy for ${this.siteConfig.name}.`,
      canonicalPath: '/cookies',
      keywords: 'cookie policy, cookies',
      type: 'website',
    });
  }
}
