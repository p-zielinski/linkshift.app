import { describe, expect, it } from 'vitest';
import { withTurnstileToken } from './turnstile-headers.util';

describe('withTurnstileToken', () => {
  it('sets X-Turnstile-Token when token is present', () => {
    expect(withTurnstileToken('abc-token')).toEqual({
      'X-Turnstile-Token': 'abc-token',
    });
  });

  it('does not set header when token is blank', () => {
    expect(withTurnstileToken('   ')).toEqual({});
  });

  it('preserves existing headers', () => {
    expect(
      withTurnstileToken('token', { 'Content-Type': 'application/json' }),
    ).toEqual({
      'Content-Type': 'application/json',
      'X-Turnstile-Token': 'token',
    });
  });
});
