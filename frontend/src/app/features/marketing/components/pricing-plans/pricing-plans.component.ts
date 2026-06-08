import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BillingInterval, OrganizationPlan } from '@shared/models/organization-config.model';
import { firstValueFrom } from 'rxjs';
import { BillingPlansStore } from '../../../../core/store/billing-plans.store';
import type { BillingPlanPrice } from '../../../../core/api/billing-api.service';
import { formatLimitChips } from '../../../../core/utils/plan-limits';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

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
  priceId: string;
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
      'Redirect tests and simulate',
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
      'Multiple domain groups and team seats',
      'SSL included for every domain',
      '1 API key and 10 API calls/min per key',
      'Link maps with lots of entries support',
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
      'Higher limits across rules and link maps',
      'SSL included for every domain',
      '3 API keys and 50 API calls/min per key',
      'Bulk rule validation checks',
      'Longer click analytics retention',
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
})
export class PricingPlansComponent {
  private readonly billingPlansStore = inject(BillingPlansStore);
  private readonly dialog = inject(MatDialog);

  readonly compact = input<boolean>(false);
  readonly actionMode = input<'link' | 'select'>('link');
  readonly currentPlan = input<OrganizationPlan | null>(null);
  readonly currentInterval = input<BillingInterval | null>(null);
  readonly billingIntervalLocked = input<boolean>(false);
  readonly billingIntervalLockReason = input<string | null>(null);
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

    const plans = orderedKeys.map((planKey) => {
      const basePlan = PLAN_METADATA.get(planKey) ?? this.buildFallbackPlan(planKey);
      const planLimits = limitsByPlan?.[planKey];
      const limits = planLimits ? formatLimitChips(planLimits) : [];

      if (planKey === OrganizationPlan.FREE) {
        return {
          ...basePlan,
          limits,
          price: '0 EUR',
          priceNote: 'per month',
          sortAmount: 0,
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
          sortAmount: Number.NEGATIVE_INFINITY,
        };
      }

      return {
        ...basePlan,
        limits,
        price: this.formatPrice(pricing.amount, pricing.currency),
        priceNote,
        savingsNote: this.getSavingsNote(planKey, pricing.currency),
        sortAmount: pricing.amount,
      };
    });

    plans.sort((a, b) => b.sortAmount - a.sortAmount);

    return plans.map(({ sortAmount: _, ...plan }) => plan);
  });

  readonly planCardViews = computed(() =>
    this.plans().map((plan) => {
      const blockedReason = this.resolvePlanBlockedReason(plan.key);
      return {
        plan,
        features: this.compact() ? plan.features.slice(0, 3) : plan.features,
        hasExtraFeatures: this.compact() && plan.features.length > 3,
        isCurrent: this.isCurrentPlan(plan.key),
        isSelectable: this.isSelectablePlan(plan.key),
        blockedReason,
        blockedCtaLabel: blockedReason ? 'Downgrade unavailable' : 'Not available',
      };
    }),
  );

  constructor() {
    effect(() => {
      this.billingPlansStore.loadPlans();
    });

    effect(() => {
      if (!this.billingIntervalLocked()) {
        return;
      }
      const lockedInterval = this.currentInterval();
      if (!lockedInterval) {
        return;
      }
      if (this.billingInterval() !== lockedInterval) {
        this.billingInterval.set(lockedInterval);
      }
    });
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
        'Redirect rules and link maps',
        'Redirect tests and simulate',
        'Organization invites and shared workspace',
        'Priority support',
      ],
      ctaLabel: 'Choose plan',
      ctaLink: '/auth',
    };
  }

  isCurrentPlan(plan: OrganizationPlan): boolean {
    if (this.currentPlan() !== plan || this.currentPlan() === OrganizationPlan.FREE) {
      return false;
    }
    const currentInterval = this.currentInterval();
    if (!currentInterval) {
      return true;
    }
    return currentInterval === this.billingInterval();
  }

  isSelectablePlan(plan: OrganizationPlan): boolean {
    if (plan === OrganizationPlan.FREE) {
      return false;
    }
    return !this.isPlanBlocked(plan);
  }

  async selectPlan(plan: OrganizationPlan): Promise<void> {
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
    const shouldContinue = await this.confirmUpgradeSelectionIfRequired(
      plan,
      this.billingInterval(),
      pricing.currency,
    );
    if (!shouldContinue) {
      return;
    }
    this.planSelected.emit({
      plan,
      interval: this.billingInterval(),
      priceId: pricing.priceId,
    });
  }

  setInterval(interval: BillingInterval): void {
    if (this.billingIntervalLocked()) {
      return;
    }
    if (this.billingInterval() === interval) {
      return;
    }
    this.billingInterval.set(interval);
  }

  private resolvePlanBlockedReason(plan: OrganizationPlan): string | null {
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
    return !!this.resolvePlanBlockedReason(plan);
  }

  private getPlanPrice(plan: OrganizationPlan, interval: BillingInterval): BillingPlanPrice | null {
    return this.pricingByPlan().get(`${plan}:${interval}`) ?? null;
  }

  private async confirmUpgradeSelectionIfRequired(
    targetPlan: OrganizationPlan,
    targetInterval: BillingInterval,
    currency: string,
  ): Promise<boolean> {
    if (!this.isUpgradeSelection(targetPlan, targetInterval)) {
      return true;
    }

    const targetPlanName = this.getPlanName(targetPlan);
    const targetAmount = this.getPlanPrice(targetPlan, targetInterval)?.amount ?? null;
    const amountLabel =
      targetAmount === null
        ? null
        : `${this.formatPrice(targetAmount, currency)} ${targetInterval === 'YEARLY' ? 'per year' : 'per month'}`;

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Upgrade subscription',
        message: amountLabel
          ? `Upgrading to ${targetPlanName} (${amountLabel}) may trigger an immediate prorated charge for the remaining billing period. Continue?`
          : `Upgrading to ${targetPlanName} may trigger an immediate prorated charge for the remaining billing period. Continue?`,
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
        tone: 'warning',
      },
      maxWidth: '480px',
      width: 'min(480px, 92vw)',
    });

    return !!(await firstValueFrom(confirmDialogRef.afterClosed()));
  }

  private isUpgradeSelection(
    targetPlan: OrganizationPlan,
    targetInterval: BillingInterval,
  ): boolean {
    const currentPlan = this.currentPlan();
    if (!currentPlan || currentPlan === targetPlan || currentPlan === OrganizationPlan.FREE) {
      return false;
    }

    const currentInterval = this.currentInterval() ?? targetInterval;
    const currentAnnualized = this.resolveAnnualizedPlanAmount(
      currentPlan,
      currentInterval,
    );
    const targetAnnualized = this.resolveAnnualizedPlanAmount(
      targetPlan,
      targetInterval,
    );

    if (currentAnnualized !== null && targetAnnualized !== null) {
      return targetAnnualized > currentAnnualized;
    }

    return this.getPlanRank(targetPlan) > this.getPlanRank(currentPlan);
  }

  private resolveAnnualizedPlanAmount(
    plan: OrganizationPlan,
    interval: BillingInterval,
  ): number | null {
    if (plan === OrganizationPlan.FREE) {
      return 0;
    }
    const pricing = this.getPlanPrice(plan, interval);
    if (!pricing) {
      return null;
    }
    return interval === 'YEARLY' ? pricing.amount : pricing.amount * 12;
  }

  private getPlanRank(plan: OrganizationPlan): number {
    const index = PLAN_ORDER.indexOf(plan);
    return index >= 0 ? index : -1;
  }

  private getPlanName(plan: OrganizationPlan): string {
    return PLAN_METADATA.get(plan)?.name ?? String(plan);
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
