import {
  HOSTNAME_RELEASE_COOLDOWN_DAYS,
  getHostnameReleaseCooldownConflictDetails,
  getHostnameReleaseCooldownEndsAt,
  isHostnameInReleaseCooldown,
} from './hostname-policy.constants';

describe('hostname-policy.constants', () => {
  const deletedAt = new Date('2026-06-01T12:00:00.000Z');

  describe('getHostnameReleaseCooldownEndsAt', () => {
    it('adds the configured cooldown window to deletedAt', () => {
      const endsAt = getHostnameReleaseCooldownEndsAt(deletedAt);

      expect(endsAt.toISOString()).toBe('2026-06-08T12:00:00.000Z');
      expect(HOSTNAME_RELEASE_COOLDOWN_DAYS).toBe(7);
    });
  });

  describe('isHostnameInReleaseCooldown', () => {
    it('returns false when deletedAt is null', () => {
      expect(isHostnameInReleaseCooldown(null)).toBe(false);
    });

    it('returns true before the cooldown ends', () => {
      const now = new Date('2026-06-05T12:00:00.000Z');

      expect(isHostnameInReleaseCooldown(deletedAt, now)).toBe(true);
    });

    it('returns false when the cooldown has ended', () => {
      const now = new Date('2026-06-08T12:00:00.000Z');

      expect(isHostnameInReleaseCooldown(deletedAt, now)).toBe(false);
    });

    it('returns false after the cooldown has ended', () => {
      const now = new Date('2026-06-09T00:00:00.000Z');

      expect(isHostnameInReleaseCooldown(deletedAt, now)).toBe(false);
    });
  });

  describe('getHostnameReleaseCooldownConflictDetails', () => {
    it('includes resource label, hostname, cooldown days, and end timestamp', () => {
      const cooldownEndsAt = getHostnameReleaseCooldownEndsAt(deletedAt);

      expect(
        getHostnameReleaseCooldownConflictDetails(
          'Domain',
          'links.example.com',
          cooldownEndsAt,
        ),
      ).toBe(
        'Domain name links.example.com was recently deleted and is in a 7-day release cooldown until 2026-06-08T12:00:00.000Z',
      );
    });
  });
});
