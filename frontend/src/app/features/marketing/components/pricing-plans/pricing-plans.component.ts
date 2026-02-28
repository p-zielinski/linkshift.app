import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BillingInterval, OrganizationPlan } from '@shared/models/organization-config.model';
import { BillingPlansStore } from '../../../../core/store/billing-plans.store';
import type { BillingPlanPrice } from '../../../../core/api/billing-api.service';
import { formatLimitChips } from '../../../../core/utils/plan-limits';

type PricingPlanBase = {
  key: OrganizationPlan;
  name: string;
  description: string;
  badge?: string;
  featured?: boolean;
  features: string[];
  ctaLabel: string;
  ctaLink: string;
};

type PricingPlan = PricingPlanBase & {
  limits: string[];
  price: string;
  priceNote: string;
  savingsNote?: string | null;
  unavailable?: boolean;
};

export type PricingPlanSelection = {
  plan: OrganizationPlan;
  interval: BillingInterval;
  variantId: string;
};

const PRICING_PLANS: PricingPlanBase[] = [
  {
    key: OrganizationPlan.FREE,
    name: 'Free',
    description: 'For proof-of-concept routing and single-brand setups.',
    features: [
      'Regex and placeholder rules',
      'Domain group governance',
      'SSL included for every domain',
      'Shared redirect audit log',
      'Email support',
    ],
    ctaLabel: 'Start free',
    ctaLink: '/auth',
  },
  {
    key: OrganizationPlan.BASIC,
    name: 'Basic',
    description: 'For growing teams standardizing redirects across regions.',
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
    badge: 'Featured',
    featured: true,
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
];

const PLAN_ORDER = PRICING_PLANS.map((plan) => plan.key);
const PLAN_METADATA = new Map(PRICING_PLANS.map((plan) => [plan.key, plan]));

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
  readonly planBlockReasons = input<Partial<Record<OrganizationPlan, string>> | null>(null);
  readonly planSelected = output<PricingPlanSelection>();
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
    const limitsByPlan = this.billingPlansStore.limits();
    const limitKeys = limitsByPlan ? (Object.keys(limitsByPlan) as OrganizationPlan[]) : [];
    const orderedKeys =
      limitKeys.length > 0
        ? [
            ...PLAN_ORDER.filter((key) => limitKeys.includes(key)),
            ...limitKeys.filter((key) => !PLAN_ORDER.includes(key)),
          ]
        : PLAN_ORDER;

    return orderedKeys.map((planKey) => {
      const basePlan = PLAN_METADATA.get(planKey) ?? this.buildFallbackPlan(planKey);
      const planLimits = limitsByPlan?.[planKey];
      const limits = planLimits ? formatLimitChips(planLimits) : [];

      if (planKey === OrganizationPlan.FREE) {
        return {
          ...basePlan,
          limits,
          price: '0 EUR',
          priceNote: 'per month',
        };
      }

      const pricing = this.getPlanPrice(planKey, interval);
      if (!pricing) {
        return {
          ...basePlan,
          limits,
          price: 'Contact us',
          priceNote: 'pricing unavailable',
          savingsNote: null,
          unavailable: true,
        };
      }

      return {
        ...basePlan,
        limits,
        price: this.formatPrice(pricing.amount, pricing.currency),
        priceNote,
        savingsNote: this.getSavingsNote(planKey, pricing.currency),
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

  private buildFallbackPlan(plan: OrganizationPlan): PricingPlanBase {
    const normalized = String(plan);
    const name = normalized.charAt(0) + normalized.slice(1).toLowerCase();
    return {
      key: plan,
      name,
      description: 'For teams that need higher limits and stricter governance.',
      features: [
        'SSL included for every domain',
        'Workflow-based approvals',
        'Audit-ready change history',
        'Role-based access controls',
        'Priority support',
      ],
      ctaLabel: 'Choose plan',
      ctaLink: '/auth',
    };
  }

  isCurrentPlan(plan: OrganizationPlan): boolean {
    return this.currentPlan() === plan;
  }

  isSelectablePlan(plan: OrganizationPlan): boolean {
    if (plan === OrganizationPlan.FREE) {
      return false;
    }
    return !this.isPlanBlocked(plan);
  }

  selectPlan(plan: OrganizationPlan): void {
    if (this.actionMode() !== 'select') {
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

  setInterval(interval: BillingInterval): void {
    if (this.billingInterval() === interval) {
      return;
    }
    this.billingInterval.set(interval);
  }

  getPlanBlockedReason(plan: OrganizationPlan): string | null {
    if (plan === OrganizationPlan.FREE) {
      return null;
    }
    return (
      this.planBlockReasons()?.[plan] ??
      (this.getPlanPrice(plan, this.billingInterval())
        ? null
        : 'Pricing unavailable. Try again later.')
    );
  }

  isPlanBlocked(plan: OrganizationPlan): boolean {
    return !!this.getPlanBlockedReason(plan);
  }

  private getPlanPrice(plan: OrganizationPlan, interval: BillingInterval): BillingPlanPrice | null {
    return this.pricingByPlan().get(`${plan}:${interval}`) ?? null;
  }

  private formatPrice(amount: number, currency: string): string {
    if (!Number.isFinite(amount)) {
      return `-- ${currency}`;
    }
    const normalized = Math.round(amount) === amount ? amount.toFixed(0) : amount.toFixed(2);
    return `${normalized} ${currency}`;
  }

  private getSavingsNote(plan: OrganizationPlan, currency: string): string | null {
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
}
