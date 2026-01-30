import { LegalService } from './legal.service';

describe('LegalService', () => {
  const createService = (version = 'v1') =>
    new LegalService({
      get: jest.fn().mockReturnValue(version),
    } as any);

  it('returns false when any consent field is missing', () => {
    const service = createService('v1');
    const user = {
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: null,
      ageConfirmedAt: new Date(),
      legalVersion: 'v1',
    };

    expect(service.isConsentUpToDate(user)).toBe(false);
  });

  it('returns false when legal version does not match', () => {
    const service = createService('v2');
    const user = {
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
      ageConfirmedAt: new Date(),
      legalVersion: 'v1',
    };

    expect(service.isConsentUpToDate(user)).toBe(false);
  });

  it('returns true when all consent data is present and versions match', () => {
    const service = createService('v1');
    const user = {
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
      ageConfirmedAt: new Date(),
      legalVersion: 'v1',
    };

    expect(service.isConsentUpToDate(user)).toBe(true);
  });
});
