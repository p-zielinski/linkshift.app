const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const HOSTNAME_RELEASE_COOLDOWN_DAYS = 7;

export function getHostnameReleaseCooldownEndsAt(deletedAt: Date): Date {
  return new Date(
    deletedAt.getTime() + HOSTNAME_RELEASE_COOLDOWN_DAYS * MS_PER_DAY,
  );
}

export function isHostnameInReleaseCooldown(
  deletedAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (!deletedAt) {
    return false;
  }

  return now.getTime() < getHostnameReleaseCooldownEndsAt(deletedAt).getTime();
}

export function getHostnameReleaseCooldownConflictDetails(
  resourceLabel: 'Domain' | 'Subdomain',
  hostname: string,
  cooldownEndsAt: Date,
): string {
  return `${resourceLabel} name ${hostname} was recently deleted and is in a ${HOSTNAME_RELEASE_COOLDOWN_DAYS}-day release cooldown until ${cooldownEndsAt.toISOString()}`;
}
