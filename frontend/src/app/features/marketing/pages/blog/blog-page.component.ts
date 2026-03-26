import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { BLOG_ARTICLES } from '../../blog/blog-articles.data';
import { BlogArticleCardComponent } from '../../components/blog-article-card/blog-article-card.component';
import { MarketingHeroComponent } from '../../components/marketing-hero/marketing-hero.component';
import { MarketingSectionComponent } from '../../components/marketing-section/marketing-section.component';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MarketingHeroComponent,
    MarketingSectionComponent,
    BlogArticleCardComponent,
  ],
  templateUrl: './blog-page.component.html',
  styleUrl: './blog-page.component.css',
})
export class BlogPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);

  readonly articles = BLOG_ARTICLES;

  readonly highlights = [
    'Comparison articles about real competitors',
    'Conclusions based on official websites and documentation',
    'Technical scenarios: regex, query matching, and link maps',
  ];

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Redirect tools comparison blog`,
      description:
        'LinkShift blog comparing redirect.pizza, Cloudflare, Bitly, Short.io, Rebrandly, Dub, and other redirect/link-management tools.',
      canonicalPath: '/blog',
      keywords:
        'redirect tools comparison, bitly alternative, redirect.pizza alternative, cloudflare redirects alternative, link maps',
      type: 'website',
    });
  }
}
