import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  BillingInterval,
  OrganizationPlan,
} from '@shared/models/organization-config.model';
import { BillingPlansStore } from '../../../../core/store/billing-plans.store';
import type {
  BillingPlanPrice,
  CustomPlanCatalogItem,
  CustomPlanPricing,
  PlanLimits,
} from '../../../../core/api/billing-api.service';

type PricingPlanBase = {
  key: OrganizationPlan | 'CUSTOM';
  name: string;
  description: string;
  badge?: string;
  featured?: boolean;
  limits: string[];
  features: string[];
  ctaLabel: string;
  ctaLink: string;
};

type PricingPlan = PricingPlanBase & {
  price: string;
  priceNote: string;
  savingsNote?: string | null;
  unavailable?: boolean;
};

export type PricingPlanSelection = {
  plan: OrganizationPlan;
  interval: BillingInterval;
  variantId: string;
  customPlanId?: string;
};

const PRICING_PLANS: PricingPlanBase[] = [
  {
    key: OrganizationPlan.FREE,
    name: 'Free',
    description: 'For proof-of-concept routing and single-brand setups.',
    limits: [
      '1 domain group',
      '1 domain',
      '15 rules',
      '30 tests',
      '1 link map',
      '100 link map entries',
      '1 seat',
      '10 redirects/min',
    ],
    features: [
      'Regex and placeholder rules',
      'Domain group governance',
      'SSL included for every domain',
      'Shared redirect audit log',
      'Email support within 48h',
    ],
    ctaLabel: 'Start free',
    ctaLink: '/auth',
  },
  {
    key: OrganizationPlan.BASIC,
    name: 'Basic',
    description: 'For growing teams standardizing redirects across regions.',
    limits: [
      '1 domain group',
      '10 domains',
      '250 rules',
      '500 tests',
      '5 link maps',
      '5000 link map entries',
      '3 seats',
      '50 redirects/min',
    ],
    features: [
      'Staging and production workspaces',
      'SSL included for every domain',
      'Scheduled redirect exports',
      'Workflow-based approvals',
      'Priority email support',
    ],
    ctaLabel: 'Pick Basic',
    ctaLink: '/auth',
  },
  {
    key: OrganizationPlan.PRO,
    name: 'Pro',
    description: 'For high-traffic sites that need stricter governance.',
    badge: 'Most popular',
    featured: true,
    limits: [
      '2 domain groups',
      '15 domains',
      '500 rules',
      '1000 tests',
      '20 link maps',
      '20000 link map entries',
      '5 seats',
      '100 redirects/min',
    ],
    features: [
      'Role-based access controls',
      'SSL included for every domain',
      'Bulk rule validation checks',
      'Priority routing audit trail',
      'Dedicated onboarding support',
    ],
    ctaLabel: 'Go Pro',
    ctaLink: '/auth',
  },
  {
    key: 'CUSTOM',
    name: 'Custom',
    description:
      'For teams that need higher limits with standard monthly or yearly billing.',
    limits: [
      'Tailored limits',
      'Monthly or yearly billing only',
      'Custom test suites',
      'Onboarding sessions',
      'No SLA included by default',
    ],
    features: [
      'We scope limits to your routing load',
      'SSL included for every domain',
      'Workflows aligned to your org',
      'Onboarding and migration guidance',
      'Priority support based on plan',
    ],
    ctaLabel: 'Request a custom plan',
    ctaLink: '/contact',
  },
];

@Component({
  selector: 'app-pricing-plans',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './pricing-plans.component.html',
  styleUrl: './pricing-plans.component.css',
})
export class PricingPlansComponent {
  private readonly billingPlansStore = inject(BillingPlansStore);

  readonly compact = input<boolean>(false);
  readonly actionMode = input<'link' | 'select'>('link');
  readonly currentPlan = input<OrganizationPlan | null>(null);
  readonly customLink = input<string>('/contact');
  readonly planBlockReasons =
    input<Partial<Record<OrganizationPlan, string>> | null>(null);
  readonly customPlans = input<CustomPlanCatalogItem[]>([]);
  readonly customPlanBlockReasons = input<Record<string, string> | null>(null);
  readonly planSelected = output<PricingPlanSelection>();
  readonly customRequested = output<void>();
  readonly billingInterval = signal<BillingInterval>('MONTHLY');

  private readonly pricingByPlan = computed(() => {
    const map = new Map<string, BillingPlanPrice>();
    for (const entry of this.billingPlansStore.plans()) {
      map.set(`${entry.plan}:${entry.interval}`, entry);
    }
    return map;
  });

  readonly plans = computed<PricingPlan[]>(() => {
    const interval = this.billingInterval();
    const priceNote = interval === 'YEARLY' ? 'per year' : 'per month';

    return PRICING_PLANS.map((plan) => {
      if (plan.key === 'CUSTOM') {
        return {
          ...plan,
          price: 'Custom',
          priceNote: 'tailored engagement',
        };
      }
      if (plan.key === OrganizationPlan.FREE) {
        return {
          ...plan,
          price: '0 EUR',
          priceNote: 'per month',
        };
      }

      const pricing = this.getPlanPrice(plan.key, interval);
      if (!pricing) {
        return {
          ...plan,
          price: 'Contact us',
          priceNote: 'pricing unavailable',
          savingsNote: null,
          unavailable: true,
        };
      }

      return {
        ...plan,
        price: this.formatPrice(pricing.amount, pricing.currency),
        priceNote,
        savingsNote: this.getSavingsNote(plan.key, pricing.currency),
      };
    });
  });

  readonly customPlanCards = computed(() => {
    const interval = this.billingInterval();
    const priceNote = interval === 'YEARLY' ? 'per year' : 'per month';
    return this.customPlans().map((plan) => {
      const pricing =
        interval === 'YEARLY' ? plan.yearly : plan.monthly;
      return {
        ...plan,
        pricing,
        price: pricing
          ? this.formatPrice(pricing.amount, pricing.currency)
          : 'Contact us',
        priceNote: pricing ? priceNote : 'pricing unavailable',
        savingsNote: this.getCustomPlanSavingsNote(plan, pricing?.currency),
        limits: this.formatCustomPlanLimits(plan.limits),
      };
    });
  });

  constructor() {
    effect(() => {
      this.billingPlansStore.loadPlans();
    });
  }

  getFeatures(plan: PricingPlan): string[] {
    return this.compact() ? plan.features.slice(0, 3) : plan.features;
  }

  hasExtraFeatures(plan: PricingPlan): boolean {
    return this.compact() && plan.features.length > 3;
  }

  isCurrentPlan(plan: OrganizationPlan | 'CUSTOM'): boolean {
    if (plan === 'CUSTOM') {
      return false;
    }
    return this.currentPlan() === plan;
  }

  isSelectablePlan(plan: OrganizationPlan | 'CUSTOM'): boolean {
    if (plan === 'CUSTOM') {
      return false;
    }
    if (plan !== OrganizationPlan.BASIC && plan !== OrganizationPlan.PRO) {
      return false;
    }
    return !this.isPlanBlocked(plan);
  }

  selectPlan(plan: OrganizationPlan | 'CUSTOM'): void {
    if (this.actionMode() !== 'select') {
      return;
    }
    if (plan === 'CUSTOM') {
      return;
    }
    if (this.isPlanBlocked(plan)) {
      return;
    }
    const pricing = this.getPlanPrice(plan, this.billingInterval());
    if (!pricing) {
      return;
    }
    this.planSelected.emit({
      plan,
      interval: this.billingInterval(),
      variantId: pricing.variantId,
    });
  }

  requestCustomPlan(): void {
    if (this.actionMode() !== 'select') {
      return;
    }
    this.customRequested.emit();
  }

  setInterval(interval: BillingInterval): void {
    if (this.billingInterval() === interval) {
      return;
    }
    this.billingInterval.set(interval);
  }

  getPlanBlockedReason(plan: OrganizationPlan | 'CUSTOM'): string | null {
    if (plan === 'CUSTOM' || plan === OrganizationPlan.FREE) {
      return null;
    }
    if (plan !== OrganizationPlan.BASIC && plan !== OrganizationPlan.PRO) {
      return null;
    }
    return (
      this.planBlockReasons()?.[plan] ??
      (this.getPlanPrice(plan, this.billingInterval())
        ? null
        : 'Pricing unavailable. Try again later.')
    );
  }

  isPlanBlocked(plan: OrganizationPlan | 'CUSTOM'): boolean {
    if (plan === 'CUSTOM') {
      return false;
    }
    return !!this.getPlanBlockedReason(plan);
  }

  getCustomPlanBlockedReason(
    customPlanId: string,
    pricing: CustomPlanPricing | null,
  ): string | null {
    if (!pricing) {
      return 'Plan not available for this billing interval.';
    }
    return this.customPlanBlockReasons()?.[customPlanId] ?? null;
  }

  isCustomPlanBlocked(
    customPlanId: string,
    pricing: CustomPlanPricing | null,
  ): boolean {
    return !!this.getCustomPlanBlockedReason(customPlanId, pricing);
  }

  private getPlanPrice(
    plan: OrganizationPlan,
    interval: BillingInterval,
  ): BillingPlanPrice | null {
    return this.pricingByPlan().get(`${plan}:${interval}`) ?? null;
  }

  private formatPrice(amount: number, currency: string): string {
    if (!Number.isFinite(amount)) {
      return `-- ${currency}`;
    }
    const normalized =
      Math.round(amount) === amount ? amount.toFixed(0) : amount.toFixed(2);
    return `${normalized} ${currency}`;
  }

  private getSavingsNote(
    plan: OrganizationPlan,
    currency: string,
  ): string | null {
    if (this.billingInterval() !== 'YEARLY') {
      return null;
    }
    const monthly = this.getPlanPrice(plan, 'MONTHLY');
    const yearly = this.getPlanPrice(plan, 'YEARLY');
    if (!monthly || !yearly) {
      return null;
    }
    const savings = monthly.amount * 12 - yearly.amount;
    if (savings <= 0) {
      return null;
    }
    return `Save ${this.formatPrice(savings, currency)} per year`;
  }

  private getCustomPlanSavingsNote(
    plan: CustomPlanCatalogItem,
    currency?: string,
  ): string | null {
    if (this.billingInterval() !== 'YEARLY') {
      return null;
    }
    if (!plan.monthly || !plan.yearly) {
      return null;
    }
    const savings = plan.monthly.amount * 12 - plan.yearly.amount;
    if (savings <= 0) {
      return null;
    }
    return `Save ${this.formatPrice(savings, currency ?? plan.yearly.currency)} per year`;
  }

  private formatCustomPlanLimits(limits: PlanLimits): string[] {
    return [
      `${limits.maxDomainGroups} domain group${limits.maxDomainGroups === 1 ? '' : 's'}`,
      `${limits.maxTotalDomains} domain${limits.maxTotalDomains === 1 ? '' : 's'}`,
      `${limits.maxTotalRules} rule${limits.maxTotalRules === 1 ? '' : 's'}`,
      `${limits.maxTotalTests} test${limits.maxTotalTests === 1 ? '' : 's'}`,
      `${limits.maxLinkMaps} link map${limits.maxLinkMaps === 1 ? '' : 's'}`,
      `${limits.maxLinkMapEntriesTotal} link map entry${limits.maxLinkMapEntriesTotal === 1 ? '' : 's'}`,
      `${limits.maxUsers} seat${limits.maxUsers === 1 ? '' : 's'}`,
      `${limits.redirectionLimitPerMinute} redirects/min`,
    ];
  }

  selectCustomPlan(planId: string, pricing: CustomPlanPricing | null): void {
    if (this.actionMode() !== 'select') {
      return;
    }
    if (this.isCustomPlanBlocked(planId, pricing)) {
      return;
    }
    if (!pricing) {
      return;
    }
    this.planSelected.emit({
      plan: OrganizationPlan.CUSTOM,
      interval: this.billingInterval(),
      customPlanId: planId,
      variantId: pricing.variantId,
    });
  }
}
