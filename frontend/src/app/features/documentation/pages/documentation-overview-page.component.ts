import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SeoService } from '../../../core/seo/seo.service';
import { SITE_CONFIG } from '../../../core/config/site-config';
import { DocumentationOpenApiService } from '../services/documentation-openapi.service';
import { DocumentationContentService } from '../services/documentation-content.service';

@Component({
  selector: 'app-documentation-overview-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './documentation-overview-page.component.html',
  styleUrl: './documentation-overview-page.component.css',
})
export class DocumentationOverviewPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly siteConfig = inject(SITE_CONFIG);

  readonly openApi = inject(DocumentationOpenApiService);
  readonly docsContent = inject(DocumentationContentService);

  readonly endpointCount = computed(() => this.openApi.endpoints().length);
  readonly tagCount = computed(() => this.openApi.tagGroups().length);

  readonly highlights = [
    'OpenAPI 3.1 as a single source of truth for endpoint pages',
    'Schema tree for request and response payload inspection',
    'Built-in Try me with session-level API key and URL persistence',
    'Backend docs mirrored into guides for operational context',
  ];

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | API documentation`,
      description:
        'Complete LinkShift API documentation with endpoint-level schema explorer, authentication details, and interactive request execution.',
      canonicalPath: '/docs',
      keywords:
        'linkshift api documentation, openapi 3.1, redirect rules api, link maps api, try api requests',
      type: 'website',
    });
  }
}
