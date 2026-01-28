import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CheckoutStatusDialogComponent } from './checkout-status-dialog.component';
import { BillingApiService } from '../../../core/api/billing-api.service';

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
  it('stops polling after a terminal status', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [CheckoutStatusDialogComponent],
      providers: [
        { provide: BillingApiService, useClass: MockBillingApiService },
        { provide: MAT_DIALOG_DATA, useValue: { sessionId: 'chk_1' } },
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
    });

    const fixture = TestBed.createComponent(CheckoutStatusDialogComponent);
    const component = fixture.componentInstance;
    const api = TestBed.inject(BillingApiService) as unknown as MockBillingApiService;

    fixture.detectChanges();
    tick();

    expect(api.callCount).toBe(1);
    expect(component.status()).toBe('PENDING');

    tick(3000);
    expect(api.callCount).toBe(2);
    expect(component.status()).toBe('PAID');

    tick(6000);
    expect(api.callCount).toBe(2);
  }));
});
