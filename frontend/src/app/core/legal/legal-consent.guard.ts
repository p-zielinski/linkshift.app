import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { SITE_CONFIG } from '../config/site-config';
import { needsLegalConsent } from './legal-consent.utils';

/** Use on AppShell with `canActivate` and `canActivateChild` so every dashboard route is gated. */
const enforceLegalConsent: CanActivateFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const siteConfig = inject(SITE_CONFIG);
  const router = inject(Router);

  const user = authStore.user();
  if (!user) {
    return true;
  }

  if (!needsLegalConsent(user, siteConfig)) {
    return true;
  }

  if (state.url.startsWith('/legal/consent')) {
    return true;
  }

  return router.parseUrl('/legal/consent');
};

export const legalConsentGuard: CanActivateFn = enforceLegalConsent;
