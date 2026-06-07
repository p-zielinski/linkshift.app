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
  beforeEach(() => {
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
  });

  it('stops polling after a terminal status', async () => {
    vi.useFakeTimers();
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

  it('shows status message and plan in the default view', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(CheckoutStatusDialogComponent);

    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(3000);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Payment confirmed. Your subscription is now active.');
    expect(element.textContent).toContain('Plan: Pro');
    expect(element.querySelector('mat-expansion-panel')).toBeTruthy();
    expect(element.querySelector('mat-expansion-panel')?.classList.contains('mat-expanded')).toBe(
      false,
    );
    vi.useRealTimers();
  });

  it('keeps session ID inside the details disclosure', () => {
    const fixture = TestBed.createComponent(CheckoutStatusDialogComponent);

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const detailsPanel = element.querySelector('mat-expansion-panel');
    expect(detailsPanel?.textContent).toContain('Session ID');
    expect(detailsPanel?.textContent).toContain('chk_1');
  });
});
