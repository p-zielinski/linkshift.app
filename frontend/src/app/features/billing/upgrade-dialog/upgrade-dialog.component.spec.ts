import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationPlan, OrganizationStatus } from '@shared/models/organization-config.model';
import { PaddleCheckoutFlowService } from '../../../core/billing/paddle-checkout-flow.service';
import { BillingPlansStore } from '../../../core/store/billing-plans.store';
import { OrganizationUsageStore } from '../../../core/store/organization-usage.store';
import { UpgradeDialogComponent } from './upgrade-dialog.component';

describe('UpgradeDialogComponent', () => {
  const dialogData = {
    currentPlan: OrganizationPlan.BASIC,
    currentInterval: 'MONTHLY' as const,
    currentStatus: OrganizationStatus.ACTIVE,
    hasProviderSubscription: true,
  };

  let dialogClose: ReturnType<typeof vi.fn>;
  let snackBarOpen: ReturnType<typeof vi.fn>;
  let startSubscriptionChange: ReturnType<typeof vi.fn>;
  let fixture: ComponentFixture<UpgradeDialogComponent>;

  beforeEach(async () => {
    dialogClose = vi.fn();
    snackBarOpen = vi.fn();
    startSubscriptionChange = vi.fn();

    await TestBed.configureTestingModule({
      imports: [UpgradeDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: { close: dialogClose } },
        { provide: MatSnackBar, useValue: { open: snackBarOpen } },
        {
          provide: PaddleCheckoutFlowService,
          useValue: { startSubscriptionChange },
        },
        {
          provide: BillingPlansStore,
          useValue: { loadPlans: vi.fn(), limits: () => null },
        },
        {
          provide: OrganizationUsageStore,
          useValue: { loadUsage: vi.fn(), usage: () => null },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpgradeDialogComponent);
  });

  it('keeps the dialog open while checkout flow is running', async () => {
    let resolveCheckout: (value: unknown) => void = () => undefined;
    startSubscriptionChange.mockReturnValue(
      new Promise((resolve) => {
        resolveCheckout = resolve;
      }),
    );

    const component = fixture.componentInstance;
    const selectionPromise = component.onPlanSelected({
      plan: OrganizationPlan.PRO,
      interval: 'MONTHLY',
      priceId: 'price_pro_monthly',
    });

    await Promise.resolve();
    expect(component.busy()).toBe(true);
    expect(dialogClose).not.toHaveBeenCalled();

    resolveCheckout({
      kind: 'checkout',
      checkoutSessionId: 'chk_1',
      status: 'closed',
    });
    await selectionPromise;

    expect(dialogClose).toHaveBeenCalledTimes(1);
    expect(component.busy()).toBe(false);
  });

  it('closes without a success snackbar when checkout completes', async () => {
    startSubscriptionChange.mockResolvedValue({
      kind: 'checkout',
      checkoutSessionId: 'chk_1',
      status: 'completed',
    });

    await fixture.componentInstance.onPlanSelected({
      plan: OrganizationPlan.PRO,
      interval: 'MONTHLY',
      priceId: 'price_pro_monthly',
    });

    expect(dialogClose).toHaveBeenCalledTimes(1);
    expect(snackBarOpen).not.toHaveBeenCalled();
  });

  it('closes the dialog after a direct plan update', async () => {
    startSubscriptionChange.mockResolvedValue({
      kind: 'updated',
      change: { prorationBillingMode: 'prorated_immediately' },
    });

    await fixture.componentInstance.onPlanSelected({
      plan: OrganizationPlan.PRO,
      interval: 'MONTHLY',
      priceId: 'price_pro_monthly',
    });

    expect(dialogClose).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.busy()).toBe(false);
  });

  it('keeps the dialog open and surfaces errors when checkout fails', async () => {
    startSubscriptionChange.mockRejectedValue(new Error('Checkout unavailable'));

    const component = fixture.componentInstance;
    await component.onPlanSelected({
      plan: OrganizationPlan.PRO,
      interval: 'MONTHLY',
      priceId: 'price_pro_monthly',
    });

    expect(dialogClose).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Checkout unavailable');
    expect(component.busy()).toBe(false);
  });
});
