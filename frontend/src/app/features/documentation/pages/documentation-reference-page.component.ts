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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SeoService } from '../../../core/seo/seo.service';
import { SITE_CONFIG } from '../../../core/config/site-config';
import { DocumentationOpenApiService } from '../services/documentation-openapi.service';
import { DocumentationContentService } from '../services/documentation-content.service';
import { DocumentationScrollService } from '../services/documentation-scroll.service';
import { MarkdownRendererComponent } from '../components/markdown-renderer.component';

const REFERENCE_SLUG = 'reference';

@Component({
  selector: 'app-documentation-reference-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatProgressSpinnerModule,
    MarkdownRendererComponent,
  ],
  templateUrl: './documentation-reference-page.component.html',
  styleUrl: './documentation-reference-page.component.css',
})
export class DocumentationReferencePageComponent implements OnInit, AfterViewInit {
  readonly openApi = inject(DocumentationOpenApiService);
  private readonly docsContent = inject(DocumentationContentService);
  private readonly docsScroll = inject(DocumentationScrollService);
  private readonly seo = inject(SeoService);
  private readonly siteConfig = inject(SITE_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);

  readonly introPage = computed(() => this.docsContent.getPageBySlug(REFERENCE_SLUG));

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.docsScroll.currentFragment()) {
      queueMicrotask(() => this.docsScroll.retryAnchorScrollFromPage());
      return;
    }

    queueMicrotask(() => this.docsScroll.notifyRouteContentReady());
  }

  ngOnInit(): void {
    const reference = this.introPage();
    this.seo.updateTags({
      title: `${this.siteConfig.name} | ${reference?.title ?? 'API reference'}`,
      description:
        reference?.description ??
        'Endpoint index for LinkShift API, grouped by tags with operation-level pages and schema trees.',
      canonicalPath: '/docs/reference',
      keywords: 'linkshift api reference, endpoints, openapi',
      type: 'website',
    });
  }
}
