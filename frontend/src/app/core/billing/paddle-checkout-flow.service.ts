import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BillingInterval,
  OrganizationPlan,
} from '@shared/models/organization-config.model';
import {
  BillingApiService,
  SubscriptionChangeResponse,
  SubscriptionChangeUpdatedResponse,
} from '../api/billing-api.service';
import {
  OpenOverlayCheckoutParams,
  OverlayCheckoutResult,
  PaddleCheckoutService,
} from './paddle-checkout.service';
import { CheckoutStatusDialogComponent } from '../../features/billing/checkout-status-dialog/checkout-status-dialog.component';
import { AuthStore } from '../store/auth.store';
import { OrganizationUsageStore } from '../store/organization-usage.store';

export type StartPaddleCheckoutParams = {
  priceId: string;
  plan: OrganizationPlan;
  interval: BillingInterval;
  source: 'upgrade_dialog';
  onCheckoutOpened?: () => void;
};

export type StartSubscriptionChangeResult =
  | {
      kind: 'checkout';
      checkoutSessionId: string;
      status: OverlayCheckoutResult['status'];
      event?: OverlayCheckoutResult['event'];
    }
  | {
      kind: 'updated';
      change: SubscriptionChangeUpdatedResponse;
    }
  | {
      kind: 'noop';
    };

@Injectable({
  providedIn: 'root',
})
export class PaddleCheckoutFlowService {
  private readonly billingApi = inject(BillingApiService);
  private readonly paddleCheckout = inject(PaddleCheckoutService);
  private readonly authStore = inject(AuthStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  async startSubscriptionChange(
    params: StartPaddleCheckoutParams,
  ): Promise<StartSubscriptionChangeResult> {
    const user = this.authStore.user();
    const organization = this.authStore.organization();

    if (!user || !organization) {
      throw new Error('Session missing. Refresh and try again.');
    }

    let result: SubscriptionChangeResponse = await firstValueFrom(
      this.billingApi.changeSubscription(params.priceId),
    );

    if (result.flow === 'NOOP') {
      const sync = await firstValueFrom(this.billingApi.syncSubscription());
      if (sync.synced) {
        await this.refreshSessionData();
      }

      const syncedPriceId = sync.activeSubscription.providerVariantId;
      if (syncedPriceId && syncedPriceId !== params.priceId) {
        result = await firstValueFrom(
          this.billingApi.changeSubscription(params.priceId),
        );
      } else {
        return { kind: 'noop' };
      }
    }

    if (result.flow === 'UPDATED') {
      await this.refreshSessionData();
      return {
        kind: 'updated',
        change: result,
      };
    }

    if (result.flow === 'NOOP') {
      return { kind: 'noop' };
    }

    const overlay = await this.openOverlayCheckout({
      priceId: params.priceId,
      customerEmail: user.email,
      organizationId: organization.id,
      userId: user.id,
      plan: params.plan,
      interval: params.interval,
      source: params.source,
      checkoutSessionId: result.checkoutSessionId,
      onCheckoutOpened: params.onCheckoutOpened,
    });

    if (overlay.status === 'completed') {
      this.openCheckoutStatusDialog(result.checkoutSessionId);
    } else if (overlay.status === 'closed') {
      this.snackBar.open('Checkout canceled. Your current plan is unchanged.', 'Dismiss', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }

    return {
      kind: 'checkout',
      checkoutSessionId: result.checkoutSessionId,
      status: overlay.status,
      event: overlay.event,
    };
  }

  openCheckoutStatusDialog(sessionId: string): void {
    this.dialog.open(CheckoutStatusDialogComponent, {
      data: { sessionId },
      width: 'min(520px, 92vw)',
      maxWidth: '92vw',
      closeOnNavigation: false,
    });
  }

  private async openOverlayCheckout(params: {
    priceId: string;
    customerEmail: string;
    organizationId: string;
    userId: string;
    plan: OrganizationPlan;
    interval: BillingInterval;
    source: 'upgrade_dialog';
    checkoutSessionId: string;
    onCheckoutOpened?: () => void;
  }) {
    return this.paddleCheckout.openOverlayCheckout({
      priceId: params.priceId,
      customerEmail: params.customerEmail,
      onCheckoutOpened: params.onCheckoutOpened,
      customData: {
        organizationId: params.organizationId,
        userId: params.userId,
        email: params.customerEmail,
        plan: params.plan,
        interval: params.interval,
        source: params.source,
        checkoutSessionId: params.checkoutSessionId,
      },
    } satisfies OpenOverlayCheckoutParams);
  }

  private async refreshSessionData(): Promise<void> {
    try {
      await firstValueFrom(this.authStore.fetchSession());
    } catch {
      // Keep UI responsive even if session refresh is temporarily unavailable.
    }
    this.usageStore.loadUsage();
  }
}
