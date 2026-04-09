import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { MarketingCtaComponent } from '../../components/marketing-cta/marketing-cta.component';
import { MarketingHeroComponent } from '../../components/marketing-hero/marketing-hero.component';
import { MarketingSectionComponent } from '../../components/marketing-section/marketing-section.component';

type UseCaseCard = {
  title: string;
  icon: string;
  summary: string;
  bullets: string[];
};

const MIGRATION_CARDS: UseCaseCard[] = [
  {
    title: 'Global move: support.* to docs.*',
    icon: 'launch',
    summary:
      'Use one rule to preserve paths during a docs-platform migration while keeping old URLs functional.',
    bullets: [
      'Attach legacy support domains to one domain group and apply one redirect model.',
      'Use regex source /^\\/(.*)$/ style matching with capture groups to forward old paths.',
      'Keep query parameters with exact, ignore, or subset query matching based on migration needs.',
    ],
  },
  {
    title: 'One-to-one article mapping',
    icon: 'article',
    summary:
      'Map each old article URL to a precise new destination when slugs or structure changed.',
    bullets: [
      'Create exact source rules per article when each destination is unique.',
      'Use ordered priorities so critical legacy URLs resolve before broad catch-all rules.',
      'Test mappings in the redirect simulator before publishing changes.',
    ],
  },
];

const SHORTLINK_CARDS: UseCaseCard[] = [
  {
    title: 'Internal Bitly on your domain',
    icon: 'link',
    summary:
      'Run branded shortlinks by combining a path-prefix redirect rule with a reusable link map.',
    bullets: [
      'Example: /go/influencer-spring -> full campaign URL from link map entries.',
      'Use case-sensitive or case-insensitive keys and optional fallback destination.',
      'Scale entries with bulk import to manage larger campaign batches.',
    ],
  },
  {
    title: 'Campaign pulse with analytics',
    icon: 'monitoring',
    summary:
      'Every redirect hit is tracked and appears in analytics views with top rules and top short keys.',
    bullets: [
      'Get hit counts per rule for selected time windows.',
      'Inspect top link map keys and top request variants in analytics details.',
      'Validate influencer traffic volume quickly without leaving the control panel.',
    ],
  },
];

const QUALITY_CARDS: UseCaseCard[] = [
  {
    title: 'Automatic SSL included',
    icon: 'lock',
    summary:
      'Connected domains receive HTTPS certificates automatically once DNS points to LinkShift.',
    bullets: [
      'Caddy on-demand TLS provisions certificates for allowed domains.',
      'No manual cert files or extra reverse-proxy SSL setup is required.',
      'Visitors avoid browser unsafe-site warnings on configured domains.',
    ],
  },
  {
    title: 'Domain grouping for environments',
    icon: 'layers',
    summary:
      'Set rules once at the domain-group level and apply them to every assigned domain.',
    bullets: [
      'Use one rule set for production, staging, test, or typo domains.',
      'Reduce drift by managing redirects outside individual server or DNS configs.',
      'Keep governance cleaner with centralized limits and shared ownership.',
    ],
  },
];

@Component({
  selector: 'app-use-cases-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MarketingHeroComponent,
    MarketingSectionComponent,
    MarketingCtaComponent,
  ],
  templateUrl: './use-cases-page.component.html',
})
export class UseCasesPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);

  readonly heroHighlights = [
    'Wildcard and regex-based redirects',
    'Exact, prefix, and query matching controls',
    'Branded shortlinks via link maps',
    'Built-in redirect analytics',
    'Automatic SSL certificate provisioning',
    'Domain groups for multi-environment routing',
  ];

  readonly migrationCards = MIGRATION_CARDS;
  readonly shortlinkCards = SHORTLINK_CARDS;
  readonly qualityCards = QUALITY_CARDS;

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Use Cases`,
      description:
        'Real LinkShift use cases for SEO-safe migrations, branded shortlinks, analytics visibility, automatic SSL, and domain-group based routing.',
      canonicalPath: '/use-cases',
      keywords:
        'redirect migration, SEO redirects, branded shortlinks, link maps, redirect analytics, automatic SSL, domain groups',
    });
  }
}
