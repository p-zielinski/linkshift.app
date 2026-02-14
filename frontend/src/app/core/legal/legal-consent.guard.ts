import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { SITE_CONFIG } from '../config/site-config';
import { needsLegalConsent } from './legal-consent.utils';

export const legalConsentGuard: CanActivateFn = (_route, state) => {
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
