import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PricingPlansComponent, PricingPlanSelection } from '../../marketing/components/pricing-plans/pricing-plans.component';
import { OrganizationPlan } from '@shared/models/organization-config.model';
import type { PlanLimits } from '@shared/models/plan-limits.model';
import { BillingPlansStore } from '../../../core/store/billing-plans.store';
import { OrganizationUsageStore } from '../../../core/store/organization-usage.store';
import type { OrganizationUsage } from '../../../core/models/organization-usage.model';
import { AuthStore } from '../../../core/store/auth.store';
import { PaddleCheckoutService } from '../../../core/billing/paddle-checkout.service';

export type UpgradeDialogData = {
  currentPlan: OrganizationPlan;
};

type PlanBlockReasons = Partial<Record<OrganizationPlan, string>>;

@Component({
  selector: 'app-upgrade-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PricingPlansComponent,
  ],
  templateUrl: './upgrade-dialog.component.html',
  styleUrl: './upgrade-dialog.component.css',
})
export class UpgradeDialogComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<UpgradeDialogComponent>);
  private readonly billingPlansStore = inject(BillingPlansStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly authStore = inject(AuthStore);
  private readonly paddleCheckout = inject(PaddleCheckoutService);
  readonly data = inject<UpgradeDialogData>(MAT_DIALOG_DATA);
  readonly busy = signal(false);

  readonly planBlockReasons = computed<PlanBlockReasons>(() => {
    const usage = this.usageStore.usage();
    const limits = this.billingPlansStore.limits();
    if (!usage || !limits) {
      return {};
    }

    const reasons: PlanBlockReasons = {};
    if (this.data.currentPlan === OrganizationPlan.PRO) {
      const targetLimits = limits[OrganizationPlan.BASIC];
      if (!targetLimits) {
        return reasons;
      }
      const overages = this.getOverageDetails(usage, targetLimits);
      if (overages.length > 0) {
        reasons[OrganizationPlan.BASIC] =
          `Reduce usage to downgrade: ${overages.join(', ')}.`;
      }
    }

    return reasons;
  });

  constructor() {
    this.billingPlansStore.loadPlans();
    this.usageStore.loadUsage();
  }

  async onPlanSelected(selection: PricingPlanSelection): Promise<void> {
    const { plan, interval, priceId } = selection;
    if (plan === OrganizationPlan.FREE) {
      return;
    }
    if (!priceId) {
      return;
    }

    const user = this.authStore.user();
    const organization = this.authStore.organization();
    if (!user || !organization) {
      this.snackBar.open('Session missing. Refresh and try again.', 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['bg-red-600', 'text-white'],
      });
      return;
    }

    this.busy.set(true);
    try {
      const result = await this.paddleCheckout.openOverlayCheckout({
        priceId,
        customerEmail: user.email,
        customData: {
          organizationId: organization.id,
          userId: user.id,
          email: user.email,
          plan,
          interval,
        },
      });

      if (result.status === 'completed') {
        this.snackBar.open('Checkout completed. Subscription is being updated.', 'Dismiss', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['bg-emerald-600', 'text-white'],
        });
        this.dialogRef.close({ upgraded: true });
        return;
      }

      this.snackBar.open('Checkout canceled. Your current plan is unchanged.', 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to open checkout overlay.';
      this.snackBar.open(message, 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['bg-red-600', 'text-white'],
      });
    } finally {
      this.busy.set(false);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  private getOverageDetails(
    usage: OrganizationUsage,
    limits: PlanLimits,
  ): string[] {
    const details: string[] = [];
    if (usage.domainGroups > limits.maxDomainGroups) {
      details.push(`Domain groups ${usage.domainGroups}/${limits.maxDomainGroups}`);
    }
    if (usage.domains > limits.maxTotalDomains) {
      details.push(`Domains ${usage.domains}/${limits.maxTotalDomains}`);
    }
    if (usage.rules > limits.maxTotalRules) {
      details.push(`Rules ${usage.rules}/${limits.maxTotalRules}`);
    }
    if (usage.tests > limits.maxTotalTests) {
      details.push(`Tests ${usage.tests}/${limits.maxTotalTests}`);
    }
    if (usage.users > limits.maxUsers) {
      details.push(`Active users ${usage.users}/${limits.maxUsers}`);
    }
    if (limits.maxApiKeys !== null && usage.apiKeys > limits.maxApiKeys) {
      details.push(`API keys ${usage.apiKeys}/${limits.maxApiKeys}`);
    }
    if (usage.linkMaps > limits.maxLinkMaps) {
      details.push(`Link maps ${usage.linkMaps}/${limits.maxLinkMaps}`);
    }
    if (usage.linkMapEntries > limits.maxLinkMapEntriesTotal) {
      details.push(
        `Link map entries ${usage.linkMapEntries}/${limits.maxLinkMapEntriesTotal}`,
      );
    }
    return details;
  }
}
