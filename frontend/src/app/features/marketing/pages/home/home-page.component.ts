import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { MarketingHeroComponent } from '../../components/marketing-hero/marketing-hero.component';
import { MarketingSectionComponent } from '../../components/marketing-section/marketing-section.component';
import {
  MarketingFeatureGridComponent,
  MarketingFeature,
} from '../../components/marketing-feature-grid/marketing-feature-grid.component';
import {
  MarketingExampleCardComponent,
  MarketingRuleExample,
} from '../../components/marketing-example-card/marketing-example-card.component';
import { MarketingCtaComponent } from '../../components/marketing-cta/marketing-cta.component';
import {
  MarketingFaqComponent,
  MarketingFaqItem,
} from '../../components/marketing-faq/marketing-faq.component';
import { PricingPlansComponent } from '../../components/pricing-plans/pricing-plans.component';
import { VideoHolderComponent } from '../../../../shared/components/video-holder/video-holder.component';

const WORKFLOW_STEPS = [
  {
    icon: 'south_east',
    title: 'Model migration rules',
    description:
      'Use exact paths, wildcard *, or /pattern/flags regex rules to move legacy URLs without losing intent.',
  },
  {
    icon: 'link',
    title: 'Launch branded shortlinks',
    description:
      'Attach a link map to a prefix rule and publish short keys on your own domain for campaigns.',
  },
  {
    icon: 'monitoring',
    title: 'Track traffic quickly',
    description:
      'Review hits, top short keys, and top request variants in redirect analytics as traffic comes in.',
  },
  {
    icon: 'api',
    title: 'Automate with API keys',
    description:
      'Use organization-scoped API keys to manage domains, rules, link maps, and tests from your own workflows.',
  },
];

const FEATURES: MarketingFeature[] = [
  {
    icon: 'trending_up',
    title: 'SEO-safe migration control',
    description: 'Preserve path structure with exact, wildcard, or regex-based redirect mappings.',
  },
  {
    icon: 'link',
    title: 'Branded shortlinks',
    description: 'Run an internal Bitly workflow on your own domain using link maps and short keys.',
  },
  {
    icon: 'monitoring',
    title: 'Built-in analytics',
    description: 'Track redirect hits, top link-map keys, and top request variants per rule.',
  },
  {
    icon: 'api',
    title: 'API-first operations',
    description:
      'Manage domains, redirect rules, link maps, and test cases through authenticated API keys.',
  },
  {
    icon: 'rule',
    title: 'Regex-ready sources',
    description: 'Match literal paths or /pattern/flags with capture groups for precise routing.',
  },
  {
    icon: 'manage_search',
    title: 'Path + query match modes',
    description: 'Use path prefix matching with query exact, ignore, or subset rules.',
  },
  {
    icon: 'map',
    title: 'Link maps for short links',
    description: 'Resolve short keys into destinations with fallback routing and case controls.',
  },
  {
    icon: 'lock',
    title: 'Automatic SSL',
    description:
      'HTTPS certificates are provisioned automatically for connected domains after DNS setup.',
  },
  {
    icon: 'layers',
    title: 'Domain-group governance',
    description: 'Set rules once and reuse them across production, staging, and typo domains.',
  },
];

const MODEL_CARDS = [
  {
    icon: 'layers',
    title: 'Domain group',
    description:
      'One group defines the redirect rules, limits, and defaults that apply to each assigned domain.',
  },
  {
    icon: 'public',
    title: 'Domains',
    description:
      'Attach production, staging, or regional domains and keep routing consistent by design.',
  },
  {
    icon: 'swap_horiz',
    title: 'Redirect rules',
    description:
      'Ordered rules support regex sources, placeholders, modifiers, and inline conditions.',
  },
];

const EXAMPLES: MarketingRuleExample[] = [
  {
    title: 'Campaign capture with source tracking',
    description: 'Regex groups keep the identifier, placeholders keep the context.',
    source: '/^\\/promo\\/(\\d+)$/',
    destination: 'https://app.example.com/campaign/$1?from={domain.fqdn}',
    note: 'The destination stays valid for any assigned domain in the group.',
  },
  {
    title: 'Preserve query parameters',
    description: 'Carry UTM data while moving to a new host.',
    source: '/^\\/go\\/(.*)$/',
    destination: 'https://store.example.com/$1?utm={query.utm}',
    note: 'Use modifiers like {query.utm:url_encode} when values can include spaces.',
  },
  {
    title: 'Method-aware routing',
    description: 'Route by method without duplicating rules for each domain.',
    source: '/^\\/support\\/(.*)$/',
    destination:
      'method == "POST" ? https://api.example.com/write/$1 : https://api.example.com/read/$1',
    note: 'Conditions support operators like ==, !=, <=, >=, ~=, and includes.',
  },
];

const FAQ_ITEMS: MarketingFaqItem[] = [
  {
    question: 'Do I need to duplicate rules for every domain?',
    answer:
      'In most cases, no. Rules live at the domain group level and apply to each domain assigned to that group.',
  },
  {
    question: 'Can I use regular expressions in the source field?',
    answer:
      'Yes. Provide regex patterns in /pattern/flags format and reference capture groups with $1, $2, and so on.',
  },
  {
    question: 'What kind of variables are available in destinations?',
    answer: 'You can use {path}, {query.*}, {segments.*}, and {domain.*}, plus modifiers.',
  },
  {
    question: 'What does the 30-day guarantee include?',
    answer:
      'If the platform is not a fit, you can request a refund within 30 days with no explanation required.',
  },
];

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MarketingHeroComponent,
    MarketingSectionComponent,
    MarketingFeatureGridComponent,
    MarketingExampleCardComponent,
    MarketingCtaComponent,
    MarketingFaqComponent,
    PricingPlansComponent,
    VideoHolderComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);

  readonly workflowSteps = WORKFLOW_STEPS;
  readonly features = FEATURES;
  readonly examples = EXAMPLES;
  readonly faqItems = FAQ_ITEMS;
  readonly modelCards = MODEL_CARDS;

  readonly heroHighlights = [
    'SEO-preserving URL migrations',
    'Branded shortlinks on your own domain',
    'Regex sources with capture groups',
    'Exact, prefix, and query matching',
    'Link maps with analytics visibility',
    'Organization-scoped API keys for automation',
    'Automatic SSL certificate provisioning',
  ];

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | SEO-preserving redirects and branded shortlinks`,
      description:
        'Protect SEO during migrations and run branded shortlinks on your own domains with regex-ready redirects, link maps, analytics, domain grouping, and automatic SSL.',
      canonicalPath: '/home',
      keywords:
        'SEO migration redirects, branded shortlinks, regex redirects, link maps, redirect analytics, domain groups, automatic SSL, redirect management',
    });
  }
}
