import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

type PricingPlan = {
  key: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  name: string;
  description: string;
  price: string;
  priceNote: string;
  badge?: string;
  featured?: boolean;
  limits: string[];
  features: string[];
  ctaLabel: string;
  ctaLink: string;
};

const PRICING_PLANS: PricingPlan[] = [
  {
    key: 'FREE',
    name: 'Free',
    description: 'For proof-of-concept routing and single-brand setups.',
    price: '0 EUR',
    priceNote: 'per month',
    limits: ['1 domain group', '1 domain', '15 rules', '10 redirects/min'],
    features: [
      'Regex and placeholder rules',
      'Domain group governance',
      'Shared redirect audit log',
      'Email support within 48h',
    ],
    ctaLabel: 'Start free',
    ctaLink: '/auth',
  },
  {
    key: 'STARTER',
    name: 'Starter',
    description: 'For growing teams standardizing redirects across regions.',
    price: '10 EUR',
    priceNote: 'per month',
    limits: [
      '1 domain group',
      '10 domains',
      '250 rules',
      '50 redirects/min',
    ],
    features: [
      'Staging and production workspaces',
      'Scheduled redirect exports',
      'Workflow-based approvals',
      'Priority email support',
    ],
    ctaLabel: 'Pick Starter',
    ctaLink: '/auth',
  },
  {
    key: 'PRO',
    name: 'Pro',
    description: 'For high-traffic sites that need stricter governance.',
    price: '29 EUR',
    priceNote: 'per month',
    badge: 'Most popular',
    featured: true,
    limits: [
      '2 domain groups',
      '15 domains',
      '500 rules',
      '100 redirects/min',
    ],
    features: [
      'Role-based access controls',
      'Bulk rule validation checks',
      'Priority routing audit trail',
      'Dedicated onboarding support',
    ],
    ctaLabel: 'Go Pro',
    ctaLink: '/auth',
  },
  {
    key: 'ENTERPRISE',
    name: 'Custom',
    description:
      'For teams that need a plan tailored to their traffic, limits, and expectations.',
    price: 'Custom',
    priceNote: 'tailored engagement',
    limits: [
      'Tailored limits',
      'Flexible billing',
      'Custom onboarding',
      'Dedicated SLA',
    ],
    features: [
      'We scope limits to your routing load',
      'Workflows aligned to your org',
      'Dedicated solution architect',
      'Support SLAs based on needs',
    ],
    ctaLabel: 'Request a custom plan',
    ctaLink: '/auth',
  },
];

@Component({
  selector: 'app-pricing-plans',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './pricing-plans.component.html',
  styleUrl: './pricing-plans.component.css',
})
export class PricingPlansComponent {
  readonly compact = input<boolean>(false);
  readonly plans = PRICING_PLANS;

  getFeatures(plan: PricingPlan): string[] {
    return this.compact() ? plan.features.slice(0, 3) : plan.features;
  }

  hasExtraFeatures(plan: PricingPlan): boolean {
    return this.compact() && plan.features.length > 3;
  }
}
