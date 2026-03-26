import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { getBlogArticleBySlug } from '../../blog/blog-articles.data';
import { BlogArticle } from '../../blog/blog.types';
import { BlogArticleLayoutComponent } from '../../components/blog-article-layout/blog-article-layout.component';

@Component({
  selector: 'app-blog-article-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, BlogArticleLayoutComponent],
  templateUrl: './blog-article-page.component.html',
  styleUrl: './blog-article-page.component.css',
})
export class BlogArticlePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);

  readonly article = signal<BlogArticle | null>(null);

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      const slug = (data['article'] as string) ?? '';
      const next = getBlogArticleBySlug(slug);
      this.article.set(next);

      if (!next) {
        this.seo.updateTags({
          title: `${this.siteConfig.name} | Blog`,
          description: 'Article not found. Check the LinkShift blog article list.',
          canonicalPath: '/blog',
          keywords: 'linkshift blog, redirect comparisons',
        });
        return;
      }

      this.seo.updateTags({
        title: `${this.siteConfig.name} | ${next.seoTitle}`,
        description: next.seoDescription,
        canonicalPath: `/blog/${next.slug}`,
        keywords: next.tags.join(', '),
        type: 'article',
      });
    });
  }
}
