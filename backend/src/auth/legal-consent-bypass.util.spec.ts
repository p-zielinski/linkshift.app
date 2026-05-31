import { shouldBypassLegalConsentCheck } from './legal-consent-bypass.util';

describe('shouldBypassLegalConsentCheck', () => {
  it('allows accept-legal and session auth routes', () => {
    expect(
      shouldBypassLegalConsentCheck({ path: '/api/v1/auth/accept-legal' }),
    ).toBe(true);
    expect(shouldBypassLegalConsentCheck({ path: '/api/v1/auth/session' })).toBe(
      true,
    );
  });

  it('does not bypass other API routes', () => {
    expect(
      shouldBypassLegalConsentCheck({ path: '/api/v1/domain-groups' }),
    ).toBe(false);
  });
});
