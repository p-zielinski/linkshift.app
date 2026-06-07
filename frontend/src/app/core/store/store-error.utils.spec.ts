import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { extractErrorMessage, notifyStoreError } from './store-error.utils';

describe('extractErrorMessage', () => {
  it('prefers details from HttpErrorResponse', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { details: 'Invalid payload' },
    });

    expect(extractErrorMessage(error, 'Fallback')).toBe('Invalid payload');
  });

  it('joins array messages', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { details: ['First issue', 'Second issue'] },
    });

    expect(extractErrorMessage(error, 'Fallback')).toBe('First issue, Second issue');
  });

  it('uses object message when available', () => {
    const error = { message: 'Something went wrong' };

    expect(extractErrorMessage(error, 'Fallback')).toBe('Something went wrong');
  });

  it('falls back when no message is available', () => {
    const error = { message: '   ' };

    expect(extractErrorMessage(error, 'Fallback')).toBe('Fallback');
  });
});

describe('notifyStoreError', () => {
  it('shows store error and clears it', () => {
    const snackBar = {
      open: vi.fn(),
    } as unknown as MatSnackBar;
    const store = {
      lastError: vi.fn(() => 'Domain name is taken'),
      clearError: vi.fn(),
    };

    notifyStoreError(snackBar, store);

    expect(snackBar.open).toHaveBeenCalledWith('Domain name is taken', 'Dismiss', {
      duration: 5000,
    });
    expect(store.clearError).toHaveBeenCalled();
  });

  it('uses fallback when store has no error message', () => {
    const snackBar = {
      open: vi.fn(),
    } as unknown as MatSnackBar;
    const store = {
      lastError: vi.fn(() => null),
      clearError: vi.fn(),
    };

    notifyStoreError(snackBar, store, "Couldn't save domain. Try again.");

    expect(snackBar.open).toHaveBeenCalledWith("Couldn't save domain. Try again.", 'Dismiss', {
      duration: 5000,
    });
    expect(store.clearError).toHaveBeenCalled();
  });
});
