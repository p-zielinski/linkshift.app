import { mapAuthUser } from './map-auth-user';
import type { User } from '../models/user.model';

describe('mapAuthUser', () => {
  it('preserves legal acceptance fields', () => {
    const user = {
      id: 'u1',
      email: 'a@b.com',
      organizationId: 'org1',
      isOwner: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      termsAcceptedAt: '2026-05-31T12:00:00.000Z',
      privacyAcceptedAt: '2026-05-31T12:00:00.000Z',
      ageConfirmedAt: '2026-05-31T12:00:00.000Z',
      legalVersion: 'v2',
    } satisfies User;

    expect(mapAuthUser(user).legalVersion).toBe('v2');
  });
});
