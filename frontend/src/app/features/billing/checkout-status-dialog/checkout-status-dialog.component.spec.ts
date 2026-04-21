import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CheckoutStatusDialogComponent } from './checkout-status-dialog.component';
import { BillingApiService } from '../../../core/api/billing-api.service';
import { AuthStore } from '../../../core/store/auth.store';
import { OrganizationUsageStore } from '../../../core/store/organization-usage.store';

class MockBillingApiService {
  responses = [
    {
      id: 'chk_1',
      plan: 'PRO',
      status: 'PENDING',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'chk_1',
      plan: 'PRO',
      status: 'PAID',
      updatedAt: new Date().toISOString(),
    },
  ];
  callCount = 0;

  getCheckoutSession(sessionId: string) {
    const response =
      this.responses[Math.min(this.callCount, this.responses.length - 1)];
    this.callCount += 1;
    return of(response);
  }
}

describe('CheckoutStatusDialogComponent', () => {
  it('stops polling after a terminal status', async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [CheckoutStatusDialogComponent],
      providers: [
        { provide: BillingApiService, useClass: MockBillingApiService },
        { provide: AuthStore, useValue: { fetchSession: () => of({}) } },
        { provide: OrganizationUsageStore, useValue: { loadUsage: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: { sessionId: 'chk_1' } },
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
    });

    const fixture = TestBed.createComponent(CheckoutStatusDialogComponent);
    const component = fixture.componentInstance;
    const api = TestBed.inject(BillingApiService) as unknown as MockBillingApiService;

    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);

    expect(api.callCount).toBe(1);
    expect(component.status()).toBe('PENDING');

    await vi.advanceTimersByTimeAsync(3000);
    expect(api.callCount).toBe(2);
    expect(component.status()).toBe('PAID');

    await vi.advanceTimersByTimeAsync(6000);
    expect(api.callCount).toBe(2);
    vi.useRealTimers();
  });
});
