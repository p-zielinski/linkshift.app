import type { Organization } from '../models/organization.model';
import type { User } from '../models/user.model';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const ORGANIZATION_KEY = 'organization_data';

export type StoredAuthSession = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  organization: Organization | null;
};

export function loadStoredSession(): StoredAuthSession {
  if (!canUseStorage()) {
    return { accessToken: null, refreshToken: null, user: null, organization: null };
  }

  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    user: safeParse<User>(localStorage.getItem(USER_KEY)),
    organization: safeParse<Organization>(localStorage.getItem(ORGANIZATION_KEY))
  };
}

export function storeSession(session: StoredAuthSession): void {
  if (!canUseStorage()) {
    return;
  }

  const { accessToken, refreshToken, user, organization } = session;

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
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

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
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
