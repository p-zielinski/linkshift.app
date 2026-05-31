import type { User } from '../models/user.model';

/** Normalize auth API user payloads (dates may arrive as ISO strings). */
export const mapAuthUser = (user: User): User => ({
  ...user,
  termsAcceptedAt: user.termsAcceptedAt ?? null,
  privacyAcceptedAt: user.privacyAcceptedAt ?? null,
  ageConfirmedAt: user.ageConfirmedAt ?? null,
  legalVersion: user.legalVersion ?? null,
});
