import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SeoService } from '../../../core/seo/seo.service';
import { SITE_CONFIG } from '../../../core/config/site-config';
import { DocumentationContentService } from '../services/documentation-content.service';
import { DocumentationScrollService } from '../services/documentation-scroll.service';
import { MarkdownRendererComponent } from '../components/markdown-renderer.component';

@Component({
  selector: 'app-documentation-markdown-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MarkdownRendererComponent,
  ],
  templateUrl: './documentation-markdown-page.component.html',
  styleUrl: './documentation-markdown-page.component.css',
})
export class DocumentationMarkdownPageComponent implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly siteConfig = inject(SITE_CONFIG);
  private readonly docsContent = inject(DocumentationContentService);
  private readonly docsScroll = inject(DocumentationScrollService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly pageSlug = signal(this.readSlugFromRoute());

  readonly page = computed(() => this.docsContent.getPageBySlug(this.pageSlug()));

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.pageSlug.set(slug);
      this.updateSeoForSlug(slug);

      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      queueMicrotask(() => {
        if (this.docsScroll.currentFragment()) {
          this.schedulePageAnchorRetry();
        } else {
          this.docsScroll.requestScrollToTop();
        }
      });
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.docsScroll.currentFragment()) {
      this.schedulePageAnchorRetry();
    }
  }

  private readSlugFromRoute(): string {
    return this.route.snapshot.paramMap.get('slug') ?? '';
  }

  private schedulePageAnchorRetry(): void {
    queueMicrotask(() => this.docsScroll.retryAnchorScrollFromPage());
  }

  private updateSeoForSlug(slug: string): void {
    const page = this.docsContent.getPageBySlug(slug);
    if (!page) {
      console.warn(
        `[LinkShift Docs] Documentation page not found for slug "${slug}". Known slugs: ${this.docsContent.pages.map((entry) => entry.slug).join(', ')}`,
      );
      this.seo.updateTags({
        title: `${this.siteConfig.name} | Documentation`,
        description: 'Requested documentation page was not found.',
        canonicalPath: '/docs',
        keywords: 'linkshift docs',
        type: 'article',
      });
      return;
    }

    this.seo.updateTags({
      title: `${this.siteConfig.name} | ${page.title}`,
      description: page.description,
      canonicalPath: page.route,
      keywords: `linkshift docs, ${page.slug}, ${page.category}`,
      type: 'article',
    });
  }
}
