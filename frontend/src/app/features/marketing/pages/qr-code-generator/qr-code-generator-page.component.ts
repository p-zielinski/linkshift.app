import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { QrCodeGeneratorToolComponent } from '../../../tools/components/qr-code-generator-tool/qr-code-generator-tool.component';
import { MarketingSectionComponent } from '../../components/marketing-section/marketing-section.component';

@Component({
  selector: 'app-qr-code-generator-page',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MarketingSectionComponent,
    QrCodeGeneratorToolComponent,
  ],
  templateUrl: './qr-code-generator-page.component.html',
  styleUrl: './qr-code-generator-page.component.css',
})
export class QrCodeGeneratorPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | QR Code Generator (PNG, SVG, EPS)`,
      description:
        'Generate a QR code for any URL and export it as PNG, SVG, or EPS. Shareable URL state and secure backend rate limiting included.',
      canonicalPath: '/qr-code-generator',
      keywords:
        'qr code generator, qr code png, qr code svg, qr code eps, dynamic qr code redirects',
      type: 'website',
    });
  }
}
