import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, catchError, of, switchMap, takeUntil, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BillingApiService,
  CheckoutSessionResponse,
  CheckoutSessionStatus,
} from '../../../core/api/billing-api.service';
import { formatPlanLabel } from '../../../core/utils/plan-label';

type CheckoutStatusDialogData = {
  sessionId: string;
};

@Component({
  selector: 'app-checkout-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './checkout-status-dialog.component.html',
})
export class CheckoutStatusDialogComponent {
  private readonly billingApi = inject(BillingApiService);
  private readonly dialogRef = inject(
    MatDialogRef<CheckoutStatusDialogComponent>,
  );
  private readonly data = inject<CheckoutStatusDialogData>(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);
  private readonly stopPolling$ = new Subject<void>();

  readonly sessionId = this.data.sessionId;
  readonly status = signal<CheckoutSessionStatus>('PENDING');
  readonly plan = signal<string | null>(null);
  readonly updatedAt = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly planLabel = computed(() => formatPlanLabel(this.plan()));

  readonly statusMessage = computed(() => {
    switch (this.status()) {
      case 'PAID':
        return 'Payment confirmed. Your subscription is now active.';
      case 'CANCELED':
        return 'Checkout was canceled before payment completed.';
      case 'FAILED':
        return 'Payment failed. Please try again or update your billing details.';
      case 'EXPIRED':
        return 'Checkout expired. Please start a new checkout.';
      default:
        return 'We are confirming your payment. This usually takes a few seconds.';
    }
  });

  readonly statusTone = computed(() => {
    switch (this.status()) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700';
      case 'CANCELED':
      case 'FAILED':
      case 'EXPIRED':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-app-accent-soft text-app-text';
    }
  });

  readonly showSpinner = computed(
    () => this.status() === 'PENDING' || this.isLoading(),
  );

  constructor() {
    this.startPolling();
  }

  close(): void {
    this.stopPolling$.next();
    this.dialogRef.close();
  }

  private startPolling(): void {
    timer(0, 3000)
      .pipe(
        switchMap(() =>
          this.billingApi.getCheckoutSession(this.sessionId).pipe(
            catchError((error) => {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Unable to verify checkout status yet.';
              this.error.set(message);
              this.isLoading.set(false);
              return of(null);
            }),
          ),
        ),
        takeUntil(this.stopPolling$),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((session: CheckoutSessionResponse | null) => {
        if (!session) {
          return;
        }

        this.error.set(null);
        this.isLoading.set(false);
        this.status.set(session.status);
        this.plan.set(session.plan);
        this.updatedAt.set(session.updatedAt);

        if (session.status !== 'PENDING') {
          this.stopPolling$.next();
        }
      });
  }
}
