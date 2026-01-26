import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { MarketingHeroComponent } from '../../components/marketing-hero/marketing-hero.component';
import { MarketingSectionComponent } from '../../components/marketing-section/marketing-section.component';
import { MarketingFeatureGridComponent, MarketingFeature } from '../../components/marketing-feature-grid/marketing-feature-grid.component';
import { MarketingExampleCardComponent, MarketingRuleExample } from '../../components/marketing-example-card/marketing-example-card.component';
import { MarketingCtaComponent } from '../../components/marketing-cta/marketing-cta.component';
import { MarketingFaqComponent, MarketingFaqItem } from '../../components/marketing-faq/marketing-faq.component';

const WORKFLOW_STEPS = [
  {
    icon: 'layers',
    title: 'Create a domain group',
    description: 'Bundle related domains into a single operational unit and apply shared policies.'
  },
  {
    icon: 'public',
    title: 'Attach domains',
    description: 'Assign production, staging, or regional domains to the group with zero duplication.'
  },
  {
    icon: 'swap_horiz',
    title: 'Publish redirect rules',
    description: 'Order rules by priority and use regex, placeholders, and conditions.'
  }
];

const FEATURES: MarketingFeature[] = [
  {
    icon: 'rule',
    title: 'Regex-ready sources',
    description: 'Match literal paths or /pattern/flags with capture groups for precise routing.'
  },
  {
    icon: 'memory',
    title: 'Template variables',
    description: 'Use {path}, {query.*}, {segments.*}, and {domain.fqdn} to build dynamic targets.'
  },
  {
    icon: 'tune',
    title: 'Modifiers for output',
    description: 'Transform data with :to_lower_case, :url_encode, or :auto_trailing_slash.'
  },
  {
    icon: 'alt_route',
    title: 'Conditional destinations',
    description: 'Route by country, method, or time with inline condition expressions.'
  },
  {
    icon: 'shield',
    title: 'Organization-aware limits',
    description: 'Respect domain group, domain, and rule limits per organization.'
  },
  {
    icon: 'bolt',
    title: 'Shared governance',
    description: 'Keep redirects organized, reviewed, and consistent across environments.'
  }
];

const MODEL_CARDS = [
  {
    icon: 'layers',
    title: 'Domain group',
    description: 'One group defines the redirect rules, limits, and defaults that apply to every domain inside.'
  },
  {
    icon: 'public',
    title: 'Domains',
    description: 'Attach production, staging, or regional domains and keep routing consistent by design.'
  },
  {
    icon: 'swap_horiz',
    title: 'Redirect rules',
    description: 'Ordered rules support regex sources, placeholders, modifiers, and inline conditions.'
  }
];

const EXAMPLES: MarketingRuleExample[] = [
  {
    title: 'Campaign capture with source tracking',
    description: 'Regex groups keep the identifier, placeholders keep the context.',
    source: '/^\\/promo\\/(\\d+)$/',
    destination: 'https://app.example.com/campaign/$1?from={domain.fqdn}',
    note: 'The destination stays valid for any assigned domain in the group.'
  },
  {
    title: 'Preserve query parameters',
    description: 'Carry UTM data while moving to a new host.',
    source: '/^\\/go\\/(.*)$/',
    destination: 'https://store.example.com/$1?utm={query.utm}',
    note: 'Use modifiers like {query.utm:url_encode} when values can include spaces.'
  },
  {
    title: 'Geo-aware routing',
    description: 'Route by region without duplicating rules for each domain.',
    source: '/^\\/support\\/(.*)$/',
    destination: 'geo.country == "US" ? https://support.example.com/$1 : https://global.example.com/$1',
    note: 'Conditions support operators like ==, !=, <=, >=, ~=, and includes.'
  }
];

const FAQ_ITEMS: MarketingFaqItem[] = [
  {
    question: 'Do I need to duplicate rules for every domain?',
    answer: 'No. Rules live at the domain group level and apply to every domain assigned to that group.'
  },
  {
    question: 'Can I use regular expressions in the source field?',
    answer: 'Yes. Provide regex patterns in /pattern/flags format and reference capture groups with $1, $2, and so on.'
  },
  {
    question: 'What kind of variables are available in destinations?',
    answer: 'You can use {path}, {query.*}, {segments.*}, {domain.*}, and geo variables like {geo.country}, plus modifiers.'
  },
  {
    question: 'What does the 30-day guarantee include?',
    answer: 'If the platform is not a fit, you can request a refund within 30 days with no explanation required.'
  }
];

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MarketingHeroComponent,
    MarketingSectionComponent,
    MarketingFeatureGridComponent,
    MarketingExampleCardComponent,
    MarketingCtaComponent,
    MarketingFaqComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
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
    'Domain groups with shared rules',
    'Regex sources with capture groups',
    'Template variables and modifiers',
    'Conditional routing by context'
  ];

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Domain group redirect automation`,
      description:
        'Create domain groups, attach domains, and publish redirect rules with regex, placeholders, and conditional routing. Built for teams managing complex redirect inventories.',
      canonicalPath: '/home',
      keywords: 'redirect rules, domain groups, regex redirects, placeholder redirects, conditional routing, redirect management'
    });
  }
}
