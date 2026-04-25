import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SeoService } from '../../../core/seo/seo.service';
import { SITE_CONFIG } from '../../../core/config/site-config';
import { DocumentationOpenApiService } from '../services/documentation-openapi.service';

@Component({
  selector: 'app-documentation-reference-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './documentation-reference-page.component.html',
  styleUrl: './documentation-reference-page.component.css',
})
export class DocumentationReferencePageComponent implements OnInit {
  readonly openApi = inject(DocumentationOpenApiService);

  private readonly seo = inject(SeoService);
  private readonly siteConfig = inject(SITE_CONFIG);

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | API reference`,
      description:
        'Endpoint index for LinkShift API, grouped by tags with operation-level pages and schema trees.',
      canonicalPath: '/docs/reference',
      keywords: 'linkshift api reference, endpoints, openapi',
      type: 'website',
    });
  }
}
