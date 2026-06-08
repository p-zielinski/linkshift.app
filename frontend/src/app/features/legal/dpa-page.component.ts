import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site-config';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-dpa-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dpa-page.component.html',
  styleUrl: './legal-page.component.css',
})
export class DpaPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);
  readonly updatedAt = '2026-06-08';

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Data Processing Agreement`,
      description: `Data Processing Agreement summary for ${this.siteConfig.name} customers.`,
      canonicalPath: '/dpa',
      keywords: 'data processing agreement, dpa, gdpr',
      type: 'website',
    });
  }
}
