import { TestBed } from '@angular/core/testing';
import { Router, type RouterStateSnapshot } from '@angular/router';
import { DEFAULT_SITE_CONFIG } from '../config/site-config';
import { AuthStore } from '../store/auth.store';
import { SITE_CONFIG } from '../config/site-config';
import type { User } from '../models/user.model';
import { legalConsentGuard } from './legal-consent.guard';

describe('legalConsentGuard', () => {
  let currentUser: User | null = null;

  const baseUser: User = {
    id: 'u1',
    email: 'user@example.com',
    organizationId: 'org1',
    isOwner: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    termsAcceptedAt: new Date().toISOString(),
    privacyAcceptedAt: new Date().toISOString(),
    ageConfirmedAt: new Date().toISOString(),
    legalVersion: 'v2',
  };

  const runGuard = (url: string) => {
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => legalConsentGuard(null as never, state));
  };

  beforeEach(() => {
    currentUser = null;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthStore,
          useValue: {
            user: () => currentUser,
          },
        },
        { provide: SITE_CONFIG, useValue: DEFAULT_SITE_CONFIG },
        {
          provide: Router,
          useValue: {
            parseUrl: (path: string) => ({ toString: () => path }),
          },
        },
      ],
    });
  });

  it('allows navigation when consent is up to date', () => {
    currentUser = baseUser;
    expect(runGuard('/dashboard')).toBe(true);
  });

  it('redirects to consent when version is stale', () => {
    currentUser = { ...baseUser, legalVersion: 'v1' };
    const result = runGuard('/dashboard');
    expect(typeof result).toBe('object');
    expect(String(result)).toBe('/legal/consent');
  });

  it('allows the consent route when update is required', () => {
    currentUser = { ...baseUser, legalVersion: 'v1' };
    expect(runGuard('/legal/consent')).toBe(true);
  });
});
