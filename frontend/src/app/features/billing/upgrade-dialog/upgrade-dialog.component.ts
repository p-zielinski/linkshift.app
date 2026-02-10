import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { BillingApiService } from '../../../core/api/billing-api.service';
import { PlanLimits } from '../../../core/api/billing-api.service';
import { PricingPlansComponent, PricingPlanSelection } from '../../marketing/components/pricing-plans/pricing-plans.component';
import { OrganizationPlan } from '@shared/models/organization-config.model';
import { BillingPlansStore } from '../../../core/store/billing-plans.store';
import { OrganizationUsageStore } from '../../../core/store/organization-usage.store';
import type { OrganizationUsage } from '../../../core/models/organization-usage.model';
import { CustomPlansStore } from '../../../core/store/custom-plans.store';

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
  private readonly billingApi = inject(BillingApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<UpgradeDialogComponent>);
  private readonly router = inject(Router);
  private readonly billingPlansStore = inject(BillingPlansStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  readonly customPlansStore = inject(CustomPlansStore);
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
      const targetLimits = limits[OrganizationPlan.STARTER];
      if (!targetLimits) {
        return reasons;
      }
      const overages = this.getOverageDetails(usage, targetLimits);
      if (overages.length > 0) {
        reasons[OrganizationPlan.STARTER] =
          `Reduce usage to downgrade: ${overages.join(', ')}.`;
      }
    }

    return reasons;
  });

  readonly customPlanBlockReasons = computed(() => {
    const usage = this.usageStore.usage();
    const plans = this.customPlansStore.plans();
    if (!usage || plans.length === 0) {
      return {};
    }

    const reasons: Record<string, string> = {};
    for (const plan of plans) {
      const overages = this.getOverageDetails(usage, plan.limits);
      if (overages.length > 0) {
        reasons[plan.id] =
          `Reduce usage to downgrade: ${overages.join(', ')}.`;
      }
    }
    return reasons;
  });

  constructor() {
    this.billingPlansStore.loadPlans();
    this.usageStore.loadUsage();
    this.customPlansStore.loadPlans();
  }

  async onPlanSelected(selection: PricingPlanSelection): Promise<void> {
    const { plan, interval } = selection;
    if (
      plan !== OrganizationPlan.STARTER &&
      plan !== OrganizationPlan.PRO &&
      plan !== OrganizationPlan.CUSTOM
    ) {
      return;
    }
    if (plan === OrganizationPlan.CUSTOM && !selection.customPlanId) {
      return;
    }

    this.busy.set(true);
    try {
      const response =
        plan === OrganizationPlan.CUSTOM && selection.customPlanId
          ? await firstValueFrom(
              this.billingApi.createCustomPlanCheckout(
                selection.customPlanId,
                interval,
              ),
            )
          : await firstValueFrom(this.billingApi.createCheckout(plan, interval));
      window.location.href = response.checkoutUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Checkout failed.';
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

  async onCustomRequested(): Promise<void> {
    this.dialogRef.close();
    await this.router.navigateByUrl('/contact');
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
    return details;
  }
}
