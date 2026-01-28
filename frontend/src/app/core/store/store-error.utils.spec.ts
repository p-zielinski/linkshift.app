import { HttpErrorResponse } from '@angular/common/http';
import { extractErrorMessage } from './store-error.utils';

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
