import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PricingPlansComponent, PricingPlanSelection } from '../../marketing/components/pricing-plans/pricing-plans.component';
import {
  BillingInterval,
  OrganizationPlan,
  OrganizationStatus,
} from '@shared/models/organization-config.model';
import type { PlanLimits } from '@shared/models/plan-limits.model';
import { BillingPlansStore } from '../../../core/store/billing-plans.store';
import { OrganizationUsageStore } from '../../../core/store/organization-usage.store';
import type { OrganizationUsage } from '../../../core/models/organization-usage.model';
import { PaddleCheckoutFlowService } from '../../../core/billing/paddle-checkout-flow.service';

export type UpgradeDialogData = {
  currentPlan: OrganizationPlan;
  currentInterval: BillingInterval;
  currentStatus: OrganizationStatus;
  hasProviderSubscription: boolean;
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
  private readonly checkoutFlow = inject(PaddleCheckoutFlowService);
  readonly data = inject<UpgradeDialogData>(MAT_DIALOG_DATA);
  readonly busy = signal(false);
  readonly billingIntervalLocked = computed(
    () =>
      this.data.hasProviderSubscription &&
      this.data.currentStatus !== OrganizationStatus.CANCELED,
  );
  readonly billingIntervalLockReason = computed(() =>
    this.billingIntervalLocked()
      ? 'Billing interval cannot be changed while your current subscription is active. Cancel the subscription first, then choose a new monthly/yearly cycle.'
      : null,
  );

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
        reasons[OrganizationPlan.BASIC] = `Reduce usage to downgrade: ${overages.join(', ')}.`;
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

    this.dialogRef.close({ checkoutStarted: true });
    this.busy.set(true);
    try {
      const result = await this.checkoutFlow.startSubscriptionChange({
        priceId,
        plan,
        interval,
        source: 'upgrade_dialog',
      });

      if (result.kind === 'updated') {
        const message =
          result.change.prorationBillingMode === 'prorated_immediately'
            ? 'Plan updated. Billing adjustment was applied immediately.'
            : result.change.prorationBillingMode === 'prorated_next_billing_period'
              ? 'Plan updated. Billing adjustment will be applied at the next renewal.'
              : 'Plan updated successfully.';
        this.snackBar.open(message, 'Dismiss', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['bg-emerald-600', 'text-white'],
        });
        return;
      }

      if (result.kind === 'noop') {
        this.snackBar.open('Selected plan is already active.', 'Dismiss', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
        return;
      }

      if (result.status === 'completed') {
        this.snackBar.open('Payment received. We are confirming plan activation.', 'Dismiss', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['bg-emerald-600', 'text-white'],
        });
        return;
      }

      this.snackBar.open('Checkout canceled. Your current plan is unchanged.', 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } catch (error) {
      const message = this.resolveErrorMessage(error);
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

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const responseBody = error.error as
        | { message?: string; error?: string }
        | string
        | null;
      if (typeof responseBody === 'string' && responseBody.trim()) {
        return responseBody;
      }
      if (responseBody && typeof responseBody === 'object') {
        if (typeof responseBody.message === 'string' && responseBody.message.trim()) {
          return responseBody.message;
        }
        if (typeof responseBody.error === 'string' && responseBody.error.trim()) {
          return responseBody.error;
        }
      }
      if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Unable to change subscription at the moment.';
  }

  private getOverageDetails(usage: OrganizationUsage, limits: PlanLimits): string[] {
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
      details.push(`Link map entries ${usage.linkMapEntries}/${limits.maxLinkMapEntriesTotal}`);
    }
    return details;
  }
}
