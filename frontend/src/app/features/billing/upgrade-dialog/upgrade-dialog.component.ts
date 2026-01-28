import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { BillingApiService } from '../../../core/api/billing-api.service';
import { PricingPlansComponent } from '../../marketing/components/pricing-plans/pricing-plans.component';
import { OrganizationPlan } from '@shared/models/organization-config.model';

export type UpgradeDialogData = {
  currentPlan: OrganizationPlan;
};

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
  readonly data = inject<UpgradeDialogData>(MAT_DIALOG_DATA);
  readonly busy = signal(false);

  async onPlanSelected(plan: OrganizationPlan): Promise<void> {
    if (plan !== OrganizationPlan.STARTER && plan !== OrganizationPlan.PRO) {
      return;
    }

    this.busy.set(true);
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
}
