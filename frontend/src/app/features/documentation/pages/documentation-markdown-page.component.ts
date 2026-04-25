import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
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
export class DocumentationMarkdownPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly siteConfig = inject(SITE_CONFIG);
  private readonly docsContent = inject(DocumentationContentService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSlug = signal('');

  readonly page = computed(() => this.docsContent.getPageBySlug(this.pageSlug()));

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.pageSlug.set(slug);

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

      const isConcept = page.category === 'concept';
      const pathPrefix = isConcept ? '/docs/concepts/' : '/docs/guides/';

      this.seo.updateTags({
        title: `${this.siteConfig.name} | ${page.title}`,
        description: page.description,
        canonicalPath: `${pathPrefix}${page.slug}`,
        keywords: `linkshift docs, ${page.slug}, ${page.category}`,
        type: 'article',
      });
    });
  }
}
