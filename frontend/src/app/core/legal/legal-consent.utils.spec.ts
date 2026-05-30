import { needsLegalConsent } from './legal-consent.utils';
import type { SiteConfig } from '../config/site-config';
import type { User } from '../models/user.model';

describe('needsLegalConsent', () => {
  const siteConfig: SiteConfig = {
    name: 'Test',
    tagline: 'Tagline',
    supportEmail: 'support@test.app',
    legalName: 'Test Org',
    legalAddress: 'Address',
    privacyEmail: 'privacy@test.app',
    minAge: 16,
    legalVersion: 'v2',
  };

  it('returns true when consent timestamps are missing', () => {
    const user = { id: 'u1', email: 'a@test.app' } as User;

    expect(needsLegalConsent(user, siteConfig)).toBe(true);
  });

  it('returns true when legal version differs', () => {
    const user = {
      id: 'u1',
      email: 'a@test.app',
      termsAcceptedAt: new Date().toISOString(),
      privacyAcceptedAt: new Date().toISOString(),
      ageConfirmedAt: new Date().toISOString(),
      legalVersion: 'v0',
    } as User;

    expect(needsLegalConsent(user, siteConfig)).toBe(true);
  });

  it('returns false when consent is up to date', () => {
    const user = {
      id: 'u1',
      email: 'a@test.app',
      termsAcceptedAt: new Date().toISOString(),
      privacyAcceptedAt: new Date().toISOString(),
      ageConfirmedAt: new Date().toISOString(),
      legalVersion: 'v2',
    } as User;

    expect(needsLegalConsent(user, siteConfig)).toBe(false);
  });
});
