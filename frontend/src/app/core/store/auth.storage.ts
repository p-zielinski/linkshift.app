import type { Organization } from '../models/organization.model';
import type { User } from '../models/user.model';

const USER_KEY = 'user_data';
const ORGANIZATION_KEY = 'organization_data';

export type StoredAuthSession = {
  user: User | null;
  organization: Organization | null;
};

export function loadStoredSession(): StoredAuthSession {
  if (!canUseStorage()) {
    return { user: null, organization: null };
  }

  return {
    user: safeParse<User>(localStorage.getItem(USER_KEY)),
    organization: safeParse<Organization>(localStorage.getItem(ORGANIZATION_KEY))
  };
}

export function storeSession(session: StoredAuthSession): void {
  if (!canUseStorage()) {
    return;
  }

  const { user, organization } = session;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  if (organization) {
    localStorage.setItem(ORGANIZATION_KEY, JSON.stringify(organization));
  } else {
    localStorage.removeItem(ORGANIZATION_KEY);
  }
}

export function clearStoredSession(): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ORGANIZATION_KEY);
}

function safeParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}
