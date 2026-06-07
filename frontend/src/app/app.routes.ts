import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './core/layout/app-shell.component';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { CampaignHomePageComponent } from './features/campaign-home/campaign-home-page.component';
import { LinksPageComponent } from './features/links/links-page.component';
import { CampaignSettingsPageComponent } from './features/campaign-settings/campaign-settings-page.component';
import { campaignDashboardRedirectGuard } from './core/layout/dashboard-landing.guard';
import { advancedCampaignRoutesRedirectGuard } from './core/layout/advanced-campaign-routes-redirect.guard';
import { campaignAdvancedRoutesRedirectGuard } from './core/layout/campaign-advanced-routes-redirect.guard';
import { RedirectRulesAnalyticsPageComponent } from './features/redirect-rules-analytics/redirect-rules-analytics-page.component';
import { CampaignAnalyticsPageComponent } from './features/campaign-analytics/campaign-analytics-page.component';
import { DomainsPageComponent } from './features/domains/domains-page.component';
import { SubdomainsPageComponent } from './features/subdomains/subdomains-page.component';
import { DomainGroupsPageComponent } from './features/domain-groups/domain-groups-page.component';
import { RedirectRulesPageComponent } from './features/redirect-rules/redirect-rules-page.component';
import { LinkMapsPageComponent } from './features/link-maps/link-maps-page.component';
import { LinkMapDetailsPageComponent } from './features/link-maps/link-map-details-page.component';
import { TestsPageComponent } from './features/tests/tests-page.component';
import { domainGroupsRequiredGuard } from './core/domain-groups/domain-group.guard';
import { MarketingShellComponent } from './features/marketing/components/marketing-shell/marketing-shell.component';
import { HomePageComponent } from './features/marketing/pages/home/home-page.component';
import { PricingPageComponent } from './features/marketing/pages/pricing/pricing-page.component';
import { ContactPageComponent } from './features/marketing/pages/contact/contact-page.component';
import { BlogPageComponent } from './features/marketing/pages/blog/blog-page.component';
import { BlogArticlePageComponent } from './features/marketing/pages/blog/blog-article-page.component';
import { UseCasesPageComponent } from './features/marketing/pages/use-cases/use-cases-page.component';
import { QrCodeGeneratorPageComponent } from './features/marketing/pages/qr-code-generator/qr-code-generator-page.component';
import { RedirectTraceTesterPageComponent } from './features/marketing/pages/redirect-trace-tester/redirect-trace-tester-page.component';
import { AlternativePageComponent } from './features/marketing/pages/alternative/alternative-page.component';
import { ProfilePageComponent } from './features/profile/profile-page.component';
import { OrganizationPageComponent } from './features/organization/organization-page.component';
import { OrganizationApiKeysPageComponent } from './features/organization/organization-api-keys-page.component';
import { ToolsPageComponent } from './features/tools/tools-page.component';
import { ToolsQrCodeGeneratorPageComponent } from './features/tools/tools-qr-code-generator-page.component';
import { ToolsRedirectTesterPageComponent } from './features/tools/tools-redirect-tester-page.component';
import { ResetPasswordPageComponent } from './features/auth/reset-password-page.component';
import { VerifyEmailPageComponent } from './features/auth/verify-email-page.component';
import { InviteAcceptPageComponent } from './features/auth/invite-accept-page.component';
import { TermsPageComponent } from './features/legal/terms-page.component';
import { PrivacyPageComponent } from './features/legal/privacy-page.component';
import { CookiesPageComponent } from './features/legal/cookies-page.component';
import { DoNotSellPageComponent } from './features/legal/do-not-sell-page.component';
import { LegalConsentPageComponent } from './features/legal/legal-consent-page.component';
import { legalConsentGuard } from './core/legal/legal-consent.guard';
import {
  appFallbackRedirectGuard,
  AppFallbackRedirectPageComponent,
} from './core/routing/app-fallback-redirect.guard';
import { marketingPublicCanMatch } from './core/routing/marketing-public-can-match.guard';
import { DOCUMENTATION_CHILD_ROUTES } from './features/documentation/documentation.routes';

export const routes: Routes = [
  { path: 'auth', component: AuthPageComponent, canMatch: [guestGuard] },
  { path: 'verify-email', component: VerifyEmailPageComponent },
  { path: 'reset-password', component: ResetPasswordPageComponent },
  { path: 'invite', component: InviteAcceptPageComponent },
  ...DOCUMENTATION_CHILD_ROUTES,
  {
    path: '',
    component: MarketingShellComponent,
    canMatch: [marketingPublicCanMatch],
    children: [
      { path: '', component: HomePageComponent },
      { path: 'blog', component: BlogPageComponent },
      {
        path: 'blog/redirect-pizza-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'redirect-pizza-vs-linkshift' },
      },
      {
        path: 'blog/redirhub-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'redirhub-vs-linkshift' },
      },
      {
        path: 'blog/easyredir-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'easyredir-vs-linkshift' },
      },
      {
        path: 'blog/cloudflare-bulk-redirects-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'cloudflare-bulk-redirects-vs-linkshift' },
      },
      {
        path: 'blog/dub-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'dub-vs-linkshift' },
      },
      {
        path: 'blog/bitly-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'bitly-vs-linkshift' },
      },
      {
        path: 'blog/shortio-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'shortio-vs-linkshift' },
      },
      {
        path: 'blog/rebrandly-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'rebrandly-vs-linkshift' },
      },
      {
        path: 'blog/blink-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'blink-vs-linkshift' },
      },
      {
        path: 'blog/switchy-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'switchy-vs-linkshift' },
      },
      {
        path: 'blog/pixelme-vs-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'pixelme-vs-linkshift' },
      },
      {
        path: 'blog/linkshift-vs-managed-redirect-services',
        component: BlogArticlePageComponent,
        data: { article: 'linkshift-vs-managed-redirect-services' },
      },
      {
        path: 'blog/linkshift-use-cases',
        component: BlogArticlePageComponent,
        data: { article: 'linkshift-use-cases' },
      },
      {
        path: 'blog/merging-businesses-redirect-playbook',
        component: BlogArticlePageComponent,
        data: { article: 'merging-businesses-redirect-playbook' },
      },
      {
        path: 'blog/keep-seo-intact-during-migration',
        component: BlogArticlePageComponent,
        data: { article: 'keep-seo-intact-during-migration' },
      },
      {
        path: 'blog/domain-parking-with-redirects',
        component: BlogArticlePageComponent,
        data: { article: 'domain-parking-with-redirects' },
      },
      {
        path: 'blog/renaming-website-without-losing-traffic',
        component: BlogArticlePageComponent,
        data: { article: 'renaming-website-without-losing-traffic' },
      },
      {
        path: 'blog/relieve-it-team-with-centralized-redirects',
        component: BlogArticlePageComponent,
        data: { article: 'relieve-it-team-with-centralized-redirects' },
      },
      {
        path: 'blog/apex-to-www-redirection-guide',
        component: BlogArticlePageComponent,
        data: { article: 'apex-to-www-redirection-guide' },
      },
      {
        path: 'blog/https-everywhere-for-connected-domains',
        component: BlogArticlePageComponent,
        data: { article: 'https-everywhere-for-connected-domains' },
      },
      {
        path: 'blog/linkshift-api-keys-for-redirect-automation',
        component: BlogArticlePageComponent,
        data: { article: 'linkshift-api-keys-for-redirect-automation' },
      },
      {
        path: 'blog/tools-in-dashboard-for-faster-redirect-workflows',
        component: BlogArticlePageComponent,
        data: { article: 'tools-in-dashboard-for-faster-redirect-workflows' },
      },
      {
        path: 'blog/qr-code-generator-for-marketing',
        component: BlogArticlePageComponent,
        data: { article: 'qr-code-generator-for-marketing' },
      },
      {
        path: 'blog/http-redirect-trace-tool',
        component: BlogArticlePageComponent,
        data: { article: 'http-redirect-trace-tool' },
      },
      {
        path: 'blog/robots-txt-management-in-linkshift',
        component: BlogArticlePageComponent,
        data: { article: 'robots-txt-management-in-linkshift' },
      },
      {
        path: 'blog/linkshift-api-documentation-hub',
        component: BlogArticlePageComponent,
        data: { article: 'linkshift-api-documentation-hub' },
      },
      {
        path: 'blog/linkshift-subdomains-for-managed-hostnames',
        component: BlogArticlePageComponent,
        data: { article: 'linkshift-subdomains-for-managed-hostnames' },
      },
      {
        path: 'alternatives/redirect-pizza',
        component: AlternativePageComponent,
        data: { alternative: 'redirect-pizza' },
      },
      {
        path: 'alternatives/redirect-proxy',
        component: AlternativePageComponent,
        data: { alternative: 'redirect-proxy' },
      },
      {
        path: 'alternatives/managed-redirects',
        component: AlternativePageComponent,
        data: { alternative: 'managed-redirects' },
      },
      { path: 'pricing', component: PricingPageComponent },
      { path: 'use-cases', component: UseCasesPageComponent },
      { path: 'qr-code-generator', component: QrCodeGeneratorPageComponent },
      { path: 'redirect-tester', component: RedirectTraceTesterPageComponent },
      { path: 'contact', component: ContactPageComponent },
      { path: 'terms', component: TermsPageComponent },
      { path: 'privacy', component: PrivacyPageComponent },
      { path: 'cookies', component: CookiesPageComponent },
      { path: 'do-not-sell', component: DoNotSellPageComponent },
    ],
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard, legalConsentGuard],
    canActivateChild: [legalConsentGuard],
    children: [
      { path: 'overview', component: CampaignHomePageComponent, canActivate: [advancedCampaignRoutesRedirectGuard] },
      { path: 'home', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'links',
        component: LinksPageComponent,
        canActivate: [domainGroupsRequiredGuard],
        data: { skipDomainGroupsInCampaign: true },
      },
      { path: 'settings', component: CampaignSettingsPageComponent, canActivate: [advancedCampaignRoutesRedirectGuard] },
      {
        path: 'dashboard',
        component: DashboardPageComponent,
        canActivate: [campaignDashboardRedirectGuard],
      },
      { path: 'tools', component: ToolsPageComponent },
      { path: 'tools/qr-code-generator', component: ToolsQrCodeGeneratorPageComponent },
      { path: 'tools/redirect-tester', component: ToolsRedirectTesterPageComponent },
      {
        path: 'analytics',
        component: CampaignAnalyticsPageComponent,
        canActivate: [advancedCampaignRoutesRedirectGuard, domainGroupsRequiredGuard],
        data: { skipDomainGroupsInCampaign: true },
      },
      {
        path: 'redirect-rules-analytics',
        component: RedirectRulesAnalyticsPageComponent,
        canActivate: [campaignAdvancedRoutesRedirectGuard, domainGroupsRequiredGuard],
      },
      { path: 'legal/consent', component: LegalConsentPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'organization', component: OrganizationPageComponent },
      { path: 'organization/api-keys', component: OrganizationApiKeysPageComponent },
      {
        path: 'domains',
        component: DomainsPageComponent,
        canActivate: [campaignAdvancedRoutesRedirectGuard, domainGroupsRequiredGuard],
      },
      {
        path: 'subdomains',
        component: SubdomainsPageComponent,
        canActivate: [campaignAdvancedRoutesRedirectGuard, domainGroupsRequiredGuard],
      },
      {
        path: 'domain-groups',
        component: DomainGroupsPageComponent,
        canActivate: [campaignAdvancedRoutesRedirectGuard],
      },
      {
        path: 'redirect-rules',
        component: RedirectRulesPageComponent,
        canActivate: [campaignAdvancedRoutesRedirectGuard, domainGroupsRequiredGuard],
      },
      {
        path: 'link-maps/:id',
        component: LinkMapDetailsPageComponent,
        canActivate: [campaignAdvancedRoutesRedirectGuard, domainGroupsRequiredGuard],
      },
      {
        path: 'link-maps',
        component: LinkMapsPageComponent,
        canActivate: [campaignAdvancedRoutesRedirectGuard, domainGroupsRequiredGuard],
      },
      {
        path: 'tests',
        component: TestsPageComponent,
        canActivate: [campaignAdvancedRoutesRedirectGuard, domainGroupsRequiredGuard],
      },
    ],
  },
  {
    path: '**',
    canActivate: [appFallbackRedirectGuard],
    component: AppFallbackRedirectPageComponent,
  },
];
