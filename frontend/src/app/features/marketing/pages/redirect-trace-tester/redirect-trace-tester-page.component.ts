import { Component, OnInit, inject } from '@angular/core';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { RedirectTraceTesterToolComponent } from '../../../tools/components/redirect-trace-tester-tool/redirect-trace-tester-tool.component';
import { MarketingSectionComponent } from '../../components/marketing-section/marketing-section.component';

@Component({
  selector: 'app-redirect-trace-tester-page',
  standalone: true,
  imports: [MarketingSectionComponent, RedirectTraceTesterToolComponent],
  templateUrl: './redirect-trace-tester-page.component.html',
})
export class RedirectTraceTesterPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Redirect Trace Tester`,
      description:
        'Trace every redirect hop with status code, latency, destination, and response headers. Test full redirect journeys with custom User-Agent.',
      canonicalPath: '/redirect-tester',
      keywords:
        'redirect trace, redirect tester, http redirect checker, redirect chain tool, redirect status code',
      type: 'website',
    });
  }
}
