import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, catchError, of, switchMap, takeUntil, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  BillingApiService,
  CheckoutSessionResponse,
  CheckoutSessionStatus,
} from '../../../core/api/billing-api.service';
import { AuthStore } from '../../../core/store/auth.store';
import { OrganizationUsageStore } from '../../../core/store/organization-usage.store';
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
    MatExpansionModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './checkout-status-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutStatusDialogComponent {
  private readonly billingApi = inject(BillingApiService);
  private readonly authStore = inject(AuthStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly dialogRef = inject(
    MatDialogRef<CheckoutStatusDialogComponent>,
  );
  private readonly data = inject<CheckoutStatusDialogData>(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);
  private readonly stopPolling$ = new Subject<void>();
  private sessionRefreshTriggered = false;
  private autoCloseScheduled = false;
  readonly sessionNotFound = signal(false);

  readonly sessionId = this.data.sessionId;
  readonly status = signal<CheckoutSessionStatus>('PENDING');
  readonly plan = signal<string | null>(null);
  readonly updatedAt = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly planLabel = computed(() => formatPlanLabel(this.plan()));

  readonly statusMessage = computed(() => {
    if (this.sessionNotFound()) {
      return 'Checkout session does not exist.';
    }
    switch (this.status()) {
      case 'PAID':
        return 'Payment confirmed. Your subscription is now active.';
      case 'CANCELED':
        return 'Checkout was canceled before payment completed.';
      case 'FAILED':
        return "Couldn't complete payment. Try again or update your billing details.";
      case 'EXPIRED':
        return 'Checkout expired. Start a new checkout.';
      default:
        return 'Confirming your payment. This usually takes a few seconds.';
    }
  });

  readonly statusTone = computed(() => {
    if (this.sessionNotFound()) {
      return 'bg-red-50 text-red-700';
    }
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
    () => !this.sessionNotFound() && (this.status() === 'PENDING' || this.isLoading()),
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
              if (error instanceof HttpErrorResponse && error.status === 404) {
                this.sessionNotFound.set(true);
                this.error.set(null);
                this.isLoading.set(false);
                this.stopPolling$.next();
                return of(null);
              }
              const message =
                error instanceof Error
                  ? error.message
                  : "Couldn't verify checkout status yet.";
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

        if (session.status === 'PAID') {
          this.refreshSessionOnce();
          this.scheduleAutoClose();
        }

        if (session.status !== 'PENDING') {
          this.stopPolling$.next();
        }
      });
  }

  private refreshSessionOnce(): void {
    if (this.sessionRefreshTriggered) {
      return;
    }
    this.sessionRefreshTriggered = true;
    this.authStore
      .fetchSession()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.usageStore.loadUsage(),
        error: () => undefined,
      });
  }

  private scheduleAutoClose(): void {
    if (this.autoCloseScheduled) {
      return;
    }
    this.autoCloseScheduled = true;
    setTimeout(() => this.close(), 1800);
  }
}
