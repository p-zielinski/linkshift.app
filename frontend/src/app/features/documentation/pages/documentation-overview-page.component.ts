import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SeoService } from '../../../core/seo/seo.service';
import { SITE_CONFIG } from '../../../core/config/site-config';
import { DocumentationOpenApiService } from '../services/documentation-openapi.service';
import { DocumentationContentService } from '../services/documentation-content.service';
import { DocumentationScrollService } from '../services/documentation-scroll.service';
import { MarkdownRendererComponent } from '../components/markdown-renderer.component';

const OVERVIEW_SLUG = 'overview';

@Component({
  selector: 'app-documentation-overview-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MarkdownRendererComponent,
  ],
  templateUrl: './documentation-overview-page.component.html',
  styleUrl: './documentation-overview-page.component.css',
})
export class DocumentationOverviewPageComponent implements OnInit, AfterViewInit {
  private readonly seo = inject(SeoService);
  private readonly siteConfig = inject(SITE_CONFIG);
  private readonly docsScroll = inject(DocumentationScrollService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly openApi = inject(DocumentationOpenApiService);
  readonly docsContent = inject(DocumentationContentService);
  readonly openApiSpecPath = '/linkshift-api-keys.openapi.yaml';

  readonly page = computed(() => this.docsContent.getPageBySlug(OVERVIEW_SLUG));

  readonly heroMarkdown = computed(() => {
    const markdown = this.page()?.markdown ?? '';
    const sections = splitOverviewSections(markdown);
    return sections.hero;
  });

  readonly bodyMarkdown = computed(() => {
    const markdown = this.page()?.markdown ?? '';
    return splitOverviewSections(markdown).body;
  });

  readonly endpointCount = computed(() => this.openApi.endpoints().length);
  readonly tagCount = computed(() => this.openApi.tagGroups().length);
  readonly guideAndConceptCount = computed(
    () => this.docsContent.guidePages.length + this.docsContent.conceptPages.length,
  );

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.docsScroll.currentFragment()) {
      queueMicrotask(() => this.docsScroll.retryAnchorScrollFromPage());
    }
  }

  ngOnInit(): void {
    const overview = this.page();
    this.seo.updateTags({
      title: `${this.siteConfig.name} | ${overview?.title ?? 'API documentation'}`,
      description:
        overview?.description ??
        'Complete LinkShift API documentation with endpoint-level schema explorer, authentication details, and interactive request execution.',
      canonicalPath: '/docs',
      keywords:
        'linkshift api documentation, openapi 3.1, redirect rules api, link maps api, try api requests',
      type: 'website',
    });
  }
}

function splitOverviewSections(markdown: string): { hero: string; body: string } {
  const marker = '\n## What LinkShift provides';
  const markerIndex = markdown.indexOf(marker);

  if (markerIndex === -1) {
    return { hero: markdown, body: '' };
  }

  return {
    hero: markdown.slice(0, markerIndex).trim(),
    body: markdown.slice(markerIndex + 1).trim(),
  };
}
