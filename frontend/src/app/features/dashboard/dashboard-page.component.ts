import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';
import {
  OrganizationConfiguration,
  OrganizationPlan,
} from '@shared/models/organization-config.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { BillingApiService } from '../../core/api/billing-api.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly billingApi = inject(BillingApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly OrganizationPlan = OrganizationPlan;
  readonly billingBusy = signal(false);

  readonly user = computed(() => this.authStore.user());
  readonly organization = computed(() => this.authStore.organization());
  readonly config = computed(() => {
    const org = this.authStore.organization();
    const rawConfig = org?.configuration ?? undefined;
    return OrganizationConfiguration.fromJson(rawConfig);
  });
  readonly activeSubscription = computed(
    () => this.config().activeSubscription,
  );
  readonly limits = computed(() => this.activeSubscription().limits);

  readonly currentPlanRank = computed(() =>
    this.getPlanRank(this.activeSubscription().plan),
  );

  readonly canUpgradeToStarter = computed(
    () => this.currentPlanRank() < this.getPlanRank(OrganizationPlan.STARTER),
  );

  readonly canUpgradeToPro = computed(
    () => this.currentPlanRank() < this.getPlanRank(OrganizationPlan.PRO),
  );

  async startCheckout(plan: OrganizationPlan): Promise<void> {
    if (plan !== OrganizationPlan.STARTER && plan !== OrganizationPlan.PRO) {
      return;
    }

    this.billingBusy.set(true);
    try {
      const response = await firstValueFrom(
        this.billingApi.createCheckout(plan),
      );
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
      this.billingBusy.set(false);
    }
  }

  async openCustomerPortal(): Promise<void> {
    this.billingBusy.set(true);
    try {
      const response = await firstValueFrom(
        this.billingApi.getCustomerPortal(),
      );
      window.location.href = response.url;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to open portal.';
      this.snackBar.open(message, 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['bg-red-600', 'text-white'],
      });
    } finally {
      this.billingBusy.set(false);
    }
  }

  private getPlanRank(plan: OrganizationPlan): number {
    switch (plan) {
      case OrganizationPlan.ENTERPRISE:
        return 3;
      case OrganizationPlan.PRO:
        return 2;
      case OrganizationPlan.STARTER:
        return 1;
      default:
        return 0;
    }
  }
}
