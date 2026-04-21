import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  BillingInterval,
  OrganizationPlan,
} from '@shared/models/organization-config.model';
import {
  BillingApiService,
  CheckoutSessionStatus,
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
  source: 'upgrade_dialog' | 'registration';
};

export type StartPaddleCheckoutResult = OverlayCheckoutResult & {
  checkoutSessionId: string;
};

@Injectable({
  providedIn: 'root',
})
export class PaddleCheckoutFlowService {
  private static readonly POLL_INTERVAL_MS = 3000;
  private static readonly MAX_POLL_DURATION_MS = 90_000;

  private readonly billingApi = inject(BillingApiService);
  private readonly paddleCheckout = inject(PaddleCheckoutService);
  private readonly authStore = inject(AuthStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly dialog = inject(MatDialog);
  private readonly activeMonitors = new Set<string>();

  async startCheckout(
    params: StartPaddleCheckoutParams,
  ): Promise<StartPaddleCheckoutResult> {
    const user = this.authStore.user();
    const organization = this.authStore.organization();

    if (!user || !organization) {
      throw new Error('Session missing. Refresh and try again.');
    }

    const session = await firstValueFrom(
      this.billingApi.createCheckoutSession(params.priceId),
    );

    const overlay = await this.paddleCheckout.openOverlayCheckout({
      priceId: params.priceId,
      customerEmail: user.email,
      customData: {
        organizationId: organization.id,
        userId: user.id,
        email: user.email,
        plan: params.plan,
        interval: params.interval,
        source: params.source,
        checkoutSessionId: session.checkoutSessionId,
      },
    } satisfies OpenOverlayCheckoutParams);

    if (overlay.status === 'completed') {
      this.openCheckoutStatusDialog(session.checkoutSessionId);
    }

    return {
      ...overlay,
      checkoutSessionId: session.checkoutSessionId,
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
}
