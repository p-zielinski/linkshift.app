import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from '../../../../core/seo/seo.service';
import { SITE_CONFIG } from '../../../../core/config/site-config';
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

const ALTERNATIVES: Record<string, AlternativeContent> = {
  'redirect-pizza': {
    slug: 'redirect-pizza',
    eyebrow: 'Alternative overview',
    title: 'Redirect.pizza alternative for domain-group redirects',
    subtitle:
      'Built for teams that need grouped domains, structured rules, and predictable routing across multiple environments.',
    highlights: [
      'Domain groups for shared rule ownership',
      'Regex sources with capture groups',
      'Template variables and modifiers',
      'Conditional routing by request context',
      'Path prefix and query match modes',
      'Link maps for short links',
      'SSL support for custom domains',
    ],
    heroPanelTitle: 'Implementation checklist',
    heroPanelItems: [
      {
        icon: 'layers',
        title: 'Map domains to groups',
        description: 'Define groups that match brands, regions, or environments.',
      },
      {
        icon: 'public',
        title: 'Attach all active domains',
        description: 'Each domain inherits the same redirect rule set.',
      },
      {
        icon: 'swap_horiz',
        title: 'Translate existing rules',
        description: 'Keep regex capture groups and placeholder variables.',
      },
      {
        icon: 'verified',
        title: 'Validate and publish',
        description: 'Use ordering and conditions to avoid conflicts.',
      },
    ],
    heroPanelNote: 'Rules live with the group, so edits propagate to domains in the group.',
    comparisonTitle: 'When redirect inventories outgrow simple lists',
    comparisonSubtitle:
      'When multiple domains need the same logic, domain groups keep routing consistent and auditable.',
    comparisonCards: [
      {
        title: 'Group-driven governance',
        description: 'Keep the rule set in one place and apply it to domains in the group.',
        bullets: [
          'Single rule inventory per group',
          'Shared priority ordering',
          'No duplicated configuration',
        ],
      },
      {
        title: 'Readable rule language',
        description: 'Match, transform, and route traffic without brittle edge scripts.',
        bullets: [
          'Regex sources with capture groups',
          'Request placeholders like {path} and {query.*}',
          'Modifiers such as :url_encode',
        ],
      },
      {
        title: 'Operational safety',
        description: 'Handle edge cases with conditions and automated validation.',
        bullets: [
          'Conditions based on method or time',
          'Validation of variables and regex groups',
          'Consistent domain-level context',
        ],
      },
    ],
    featuresTitle: 'Capabilities designed for complex inventories',
    featuresSubtitle: 'Built to scale from a handful of redirects to thousands.',
    features: [
      {
        icon: 'rule',
        title: 'Regex and literal sources',
        description: 'Use /pattern/flags or literal paths depending on the workload.',
      },
      {
        icon: 'manage_search',
        title: 'Flexible match modes',
        description: 'Use path prefix matching with query exact, ignore, or subset rules.',
      },
      {
        icon: 'map',
        title: 'Link maps for short links',
        description:
          'Create prefix-based maps to generate large sets of short links, with optional query-aware matching.',
      },
      {
        icon: 'lock',
        title: 'HTTPS support',
        description: 'SSL support is available for domains so requests are served securely.',
      },
      {
        icon: 'data_object',
        title: 'Context placeholders',
        description: 'Insert {domain.fqdn}, {segments.*}, or {query.*} into destinations.',
      },
      {
        icon: 'lan',
        title: 'Group-level routing',
        description: 'One rule set applies to all domains in a group by default.',
      },
      {
        icon: 'query_stats',
        title: 'Priority-aware execution',
        description: 'Order rules deliberately and keep routing outcomes deterministic.',
      },
    ],
    examplesTitle: 'Examples that mirror real traffic',
    examplesSubtitle: 'Use capture groups, placeholders, and conditions together.',
    examples: [
      {
        title: 'Campaign routing with tracking',
        description: 'Carry the capture group and origin domain into the target.',
        source: '/^\\/promo\\/(\\d+)$/',
        destination: 'https://app.example.com/campaign/$1?from={domain.fqdn}',
        note: 'Works across domains attached to the group.',
      },
      {
        title: 'Preserve query parameters',
        description: 'Move traffic while keeping source attribution intact.',
        source: '/^\\/go\\/(.*)$/',
        destination: 'https://store.example.com/$1?utm={query.utm:url_encode}',
        note: 'Modifiers ensure values are safe inside URLs.',
      },
      {
        title: 'Time-based support routing',
        description: 'Route users based on time windows without extra rule sets.',
        source: '/^\\/support\\/(.*)$/',
        destination:
          'time() < datetime("2024-12-01") ? https://support.example.com/$1 : https://support.global.example.com/$1',
        note: 'Conditions use operators like ==, !=, <=, >=, ~=, and includes.',
      },
    ],
    ctaTitle: 'Move your redirect inventory into domain groups',
    ctaDescription:
      'Create an account and model your routing rules with full context and validation.',
    ctaNote: '30-day satisfaction guarantee. Refunds available with no explanation required.',
    seoTitle: 'Redirect.pizza alternative for domain groups',
    seoDescription:
      'Explore LinkShift.app as an alternative to Redirect.pizza with domain groups, regex sources, placeholders, and conditional routing for large redirect inventories.',
  },
  'redirect-proxy': {
    slug: 'redirect-proxy',
    eyebrow: 'Alternative overview',
    title: 'Redirect proxy alternative with domain-group control',
    subtitle:
      'Run redirects without proxy scripts. Model your domains, rules, and conditions in a structured UI.',
    highlights: [
      'No edge scripts to maintain',
      'Domain groups keep rules aligned',
      'Conditional routing by method or time',
      'Path prefix and query match modes',
      'Link maps for short links',
      'Placeholders and modifiers for precision',
    ],
    heroPanelTitle: 'Operational advantages',
    heroPanelItems: [
      {
        icon: 'code',
        title: 'Readable rules',
        description: 'Keep the logic in one place instead of scattered proxy configs.',
      },
      {
        icon: 'track_changes',
        title: 'Predictable outcomes',
        description: 'Ordered rules prevent hidden proxy conflicts.',
      },
      {
        icon: 'corporate_fare',
        title: 'Multi-domain readiness',
        description: 'Attach multiple domains and inherit the same logic without rework.',
      },
    ],
    heroPanelNote: 'Domain groups remove the need to duplicate rules per host.',
    comparisonTitle: 'Considerations for proxy-based redirect stacks',
    comparisonSubtitle:
      'Proxy rules are powerful, but they can become hard to audit once traffic grows.',
    comparisonCards: [
      {
        title: 'Centralized ownership',
        description: 'Keep redirect logic in the product instead of distributed edge config files.',
        bullets: [
          'Single place to review rules',
          'Consistent validation',
          'Less operational drift',
        ],
      },
      {
        title: 'Context-aware routing',
        description: 'Use request context directly in destinations and conditions.',
        bullets: ['{path} and {segments.*}', '{query.*} placeholders', 'method and scheme checks'],
      },
      {
        title: 'Simplified changes',
        description: 'Publish rule updates without redeploying proxy infrastructure.',
        bullets: [
          'Rules updated in UI',
          'Group-level propagation',
          'Immediate validation feedback',
        ],
      },
    ],
    featuresTitle: 'Purpose-built redirect modeling',
    featuresSubtitle: 'Model redirects with explicit rules instead of maintaining proxy scripts.',
    features: [
      {
        icon: 'schema',
        title: 'Structured domain groups',
        description: 'Keep rules tied to a group instead of duplicated across domains.',
      },
      {
        icon: 'filter_alt',
        title: 'Path and query control',
        description: 'Match path prefixes and tune query matching with exact, ignore, or subset.',
      },
      {
        icon: 'map',
        title: 'Link maps',
        description:
          'Generate prefix-based short links and decide whether query parameters affect matching.',
      },
      {
        icon: 'manage_search',
        title: 'Regex capture groups',
        description: 'Use $1, $2, and more to build dynamic destinations.',
      },
      {
        icon: 'tune',
        title: 'Output modifiers',
        description: 'Apply :to_lower_case, :url_encode, and other transformations.',
      },
      {
        icon: 'security',
        title: 'Validation guardrails',
        description: 'Rules are validated for variable correctness and URL structure.',
      },
    ],
    examplesTitle: 'Proxy logic without proxy code',
    examplesSubtitle: 'Use context variables to direct traffic safely.',
    examples: [
      {
        title: 'Method-aware routing',
        description: 'Split read and write traffic using method conditions.',
        source: '/^\\/api\\/v1\\/(.*)$/',
        destination:
          'method == "POST" ? https://api.example.com/write/$1 : https://api.example.com/read/$1',
        note: 'Conditions evaluate request method without code deployments.',
      },
      {
        title: 'Segment capture',
        description: 'Use segment placeholders to keep nested paths.',
        source: '/^\\/docs\\/(.*)$/',
        destination: 'https://docs.example.com/{segments.0}?source={domain.fqdn}',
        note: 'Segments and domain variables stay consistent across environments.',
      },
    ],
    ctaTitle: 'Model redirects with structured rules',
    ctaDescription: 'Create an account and keep routing logic visible, auditable, and grouped.',
    ctaNote: '30-day satisfaction guarantee. Refunds available with no explanation required.',
    seoTitle: 'Redirect proxy alternative for structured rules',
    seoDescription:
      'Consider a domain-group model with regex sources, placeholders, and conditional routing instead of proxy-based redirects.',
  },
  'managed-redirects': {
    slug: 'managed-redirects',
    eyebrow: 'Alternative overview',
    title: 'Managed redirects without losing control',
    subtitle:
      'Keep redirects organized with domain groups while staying in full control of rule logic and validation.',
    highlights: [
      'Self-serve control with guardrails',
      'Domain groups unify rule ownership',
      'Condition-based routing',
      'Path prefix and query match modes',
      'Link maps for short links',
      'Transparent rule syntax',
    ],
    heroPanelTitle: 'What you gain',
    heroPanelItems: [
      {
        icon: 'inventory',
        title: 'Full visibility',
        description: 'Every rule is visible, ordered, and tied to a domain group.',
      },
      {
        icon: 'handshake',
        title: 'Team-ready workflow',
        description: 'Organize domains and rules without external tickets.',
      },
      {
        icon: 'playlist_add_check',
        title: 'Rule validation',
        description: 'Variables, regex, and URL formats are checked automatically.',
      },
    ],
    heroPanelNote: 'Keep the flexibility of managed redirects with the clarity of explicit rules.',
    comparisonTitle: 'Managed-service outcomes with internal control',
    comparisonSubtitle:
      'For teams evaluating Short.io, Bitly, or Dub.co, LinkShift is an alternative focused on rule-based routing. We may not match the breadth of analytics those platforms offer, but we do provide link maps and complex redirect rules built on regex and request variables.',
    comparisonCards: [
      {
        title: 'Transparent rule inventory',
        description: 'Rules are visible and structured, not hidden behind support queues.',
        bullets: ['Consistent naming', 'Clear ordering', 'Shared governance'],
      },
      {
        title: 'Context-driven logic',
        description: 'Use request context to handle complex routing needs.',
        bullets: [
          'method-aware routing',
          'query and path placeholders',
          'method and scheme checks',
        ],
      },
      {
        title: 'Ready for scale',
        description: 'Expand domain groups without rewriting existing rules.',
        bullets: ['Attach domains without rework', 'Group-level limits', 'Simplified rule updates'],
      },
    ],
    featuresTitle: 'Built for redirect teams',
    featuresSubtitle: 'Keep speed and control while staying organized.',
    features: [
      {
        icon: 'hub',
        title: 'Domain group ownership',
        description: 'Assign domains to a group and manage a shared rule set.',
      },
      {
        icon: 'manage_search',
        title: 'Match mode flexibility',
        description: 'Use path prefix matching and query exact, ignore, or subset rules.',
      },
      {
        icon: 'map',
        title: 'Link maps',
        description:
          'Build prefix-based short-link catalogs with optional query-aware matching and fallbacks.',
      },
      {
        icon: 'terminal',
        title: 'Expressive rule syntax',
        description: 'Regex sources, placeholders, and modifiers keep logic compact.',
      },
      {
        icon: 'policy',
        title: 'Guardrails included',
        description: 'Rules are validated against variable and URL constraints.',
      },
      {
        icon: 'settings_suggest',
        title: 'Future-ready structure',
        description: 'Add new domains or groups without rebuilding your redirects.',
      },
    ],
    examplesTitle: 'Structured routing examples',
    examplesSubtitle: 'Keep logic readable while handling complex paths.',
    examples: [
      {
        title: 'Domain-aware routing',
        description: 'Include domain metadata in the destination.',
        source: '/^\\/status$/',
        destination: 'https://status.example.com/?env={domain.subdomains.0}',
        note: 'Use {domain.subdomains.*} for multi-level environments.',
      },
      {
        title: 'Path preservation',
        description: 'Carry full path data with a single rule.',
        source: '/^\\/blog\\/(.*)$/',
        destination: 'https://content.example.com/$1?source={path}',
        note: 'Combine regex groups with path placeholders as needed.',
      },
    ],
    ctaTitle: 'Keep managed redirects, stay in control',
    ctaDescription: 'Start modeling your redirect groups with full visibility and validation.',
    ctaNote: '30-day satisfaction guarantee. Refunds available with no explanation required.',
    seoTitle: 'Managed redirects alternative with domain groups',
    seoDescription:
      'Organize redirects with domain groups, regex sources, placeholders, and conditional routing.',
  },
};

type AlternativeCard = {
  title: string;
  description: string;
  bullets: string[];
};

type AlternativeHeroItem = {
  icon: string;
  title: string;
  description: string;
};

type AlternativeContent = {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  highlights: string[];
  heroPanelTitle: string;
  heroPanelItems: AlternativeHeroItem[];
  heroPanelNote: string;
  comparisonTitle: string;
  comparisonSubtitle: string;
  comparisonCards: AlternativeCard[];
  featuresTitle: string;
  featuresSubtitle: string;
  features: MarketingFeature[];
  examplesTitle: string;
  examplesSubtitle: string;
  examples: MarketingRuleExample[];
  ctaTitle: string;
  ctaDescription: string;
  ctaNote: string;
  seoTitle: string;
  seoDescription: string;
};

@Component({
  selector: 'app-alternative-page',
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
  ],
  templateUrl: './alternative-page.component.html',
  styleUrl: './alternative-page.component.css',
})
export class AlternativePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);

  readonly content = signal<AlternativeContent>(ALTERNATIVES['redirect-pizza']);

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      const key = data['alternative'] as string;
      const next = ALTERNATIVES[key] ?? ALTERNATIVES['redirect-pizza'];
      this.content.set(next);

      this.seo.updateTags({
        title: `${this.siteConfig.name} | ${next.seoTitle}`,
        description: next.seoDescription,
        canonicalPath: `/alternatives/${next.slug}`,
        keywords:
          'redirect alternatives, domain group redirects, regex redirects, redirect rules, link maps',
      });
    });
  }
}
