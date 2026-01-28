import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { MarketingCtaComponent } from '../../components/marketing-cta/marketing-cta.component';
import { MarketingSectionComponent } from '../../components/marketing-section/marketing-section.component';
import { PricingPlansComponent } from '../../components/pricing-plans/pricing-plans.component';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MarketingSectionComponent,
    PricingPlansComponent,
    MarketingCtaComponent,
  ],
  templateUrl: './pricing-page.component.html',
  styleUrl: './pricing-page.component.css',
})
export class PricingPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Pricing`,
      description:
        'Compare plans for redirect governance, domain group management, and audit-ready routing workflows.',
      canonicalPath: '/pricing',
      keywords:
        'redirect management pricing, domain group governance, redirect rules plans',
    });
  }
}
