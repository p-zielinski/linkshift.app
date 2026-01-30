import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './core/layout/app-shell.component';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { DomainsPageComponent } from './features/domains/domains-page.component';
import { DomainGroupsPageComponent } from './features/domain-groups/domain-groups-page.component';
import { RedirectRulesPageComponent } from './features/redirect-rules/redirect-rules-page.component';
import { TestsPageComponent } from './features/tests/tests-page.component';
import { domainGroupsRequiredGuard } from './core/domain-groups/domain-group.guard';
import { MarketingShellComponent } from './features/marketing/components/marketing-shell/marketing-shell.component';
import { HomePageComponent } from './features/marketing/pages/home/home-page.component';
import { AlternativePageComponent } from './features/marketing/pages/alternative/alternative-page.component';
import { PricingPageComponent } from './features/marketing/pages/pricing/pricing-page.component';
import { ContactPageComponent } from './features/marketing/pages/contact/contact-page.component';
import { ProfilePageComponent } from './features/profile/profile-page.component';
import { OrganizationPageComponent } from './features/organization/organization-page.component';
import { ResetPasswordPageComponent } from './features/auth/reset-password-page.component';
import { VerifyEmailPageComponent } from './features/auth/verify-email-page.component';
import { InviteAcceptPageComponent } from './features/auth/invite-accept-page.component';
import { TermsPageComponent } from './features/legal/terms-page.component';
import { PrivacyPageComponent } from './features/legal/privacy-page.component';
import { CookiesPageComponent } from './features/legal/cookies-page.component';
import { DoNotSellPageComponent } from './features/legal/do-not-sell-page.component';
import { LegalConsentPageComponent } from './features/legal/legal-consent-page.component';
import { legalConsentGuard } from './core/legal/legal-consent.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'auth', component: AuthPageComponent, canMatch: [guestGuard] },
  { path: 'verify-email', component: VerifyEmailPageComponent },
  { path: 'reset-password', component: ResetPasswordPageComponent },
  { path: 'invite', component: InviteAcceptPageComponent },
  {
    path: '',
    component: MarketingShellComponent,
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'pricing', component: PricingPageComponent },
      { path: 'contact', component: ContactPageComponent },
      { path: 'terms', component: TermsPageComponent },
      { path: 'privacy', component: PrivacyPageComponent },
      { path: 'cookies', component: CookiesPageComponent },
      { path: 'do-not-sell', component: DoNotSellPageComponent },
      {
        path: 'alternatives/redirect-pizza',
        component: AlternativePageComponent,
        data: { alternative: 'redirect-pizza' }
      },
      {
        path: 'alternatives/redirect-proxy',
        component: AlternativePageComponent,
        data: { alternative: 'redirect-proxy' }
      },
      {
        path: 'alternatives/managed-redirects',
        component: AlternativePageComponent,
        data: { alternative: 'managed-redirects' }
      }
    ]
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard, legalConsentGuard],
    children: [
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'legal/consent', component: LegalConsentPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'organization', component: OrganizationPageComponent },
      {
        path: 'domains',
        component: DomainsPageComponent,
        canActivate: [domainGroupsRequiredGuard]
      },
      { path: 'domain-groups', component: DomainGroupsPageComponent },
      {
        path: 'redirect-rules',
        component: RedirectRulesPageComponent,
        canActivate: [domainGroupsRequiredGuard]
      },
      {
        path: 'tests',
        component: TestsPageComponent,
        canActivate: [domainGroupsRequiredGuard]
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
