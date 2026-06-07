import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import {
  RedirectRulesAnalyticsFiltersComponent,
} from './components/redirect-rules-analytics-filters.component';
import { RedirectRulesAnalyticsResultsComponent } from './components/redirect-rules-analytics-results.component';
import { RedirectRulesAnalyticsPageBase } from './redirect-rules-analytics-page.base';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { DomainStore } from '../../core/store/domain.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { resolveSubdomainBaseHost } from '../links/links-aggregation.util';
import {
  countOrganizationHosts,
  organizationHasConnectedHosts,
} from '../../shared/components/setup-checklist/setup-checklist.auto-complete.util';
import {
  resolveAdvancedAnalyticsOnboardingPath,
  resolveRedirectRulesAnalyticsOnboardingTier,
} from './redirect-rules-analytics-onboarding.util';

@Component({
  selector: 'app-redirect-rules-analytics-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    ResourcePageShellComponent,
    RedirectRulesAnalyticsFiltersComponent,
    RedirectRulesAnalyticsResultsComponent,
  ],
  templateUrl: './redirect-rules-analytics-page.component.html',
  styleUrl: './redirect-rules-analytics-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectRulesAnalyticsPageComponent extends RedirectRulesAnalyticsPageBase implements OnInit {
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly domainStore = inject(DomainStore);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly router = inject(Router);

  readonly showPageLevelWorkspaceFilter = this.dashboardMode.showPageLevelWorkspaceFilter;

  readonly subdomains = this.subdomainStore.selectList();
  readonly domains = this.domainStore.selectList();

  readonly subdomainBaseHost = computed(() => {
    const configuredBaseUrl = this.appConfig.APP_SUBDOMAIN_BASE_URL || this.appConfig.APP_BASE_URL;
    return resolveSubdomainBaseHost(configuredBaseUrl);
  });

  readonly hostCount = computed(() =>
    countOrganizationHosts(
      this.domainGroups(),
      this.subdomains(),
      this.domains(),
      this.subdomainBaseHost(),
    ),
  );
  readonly hasConnectedHosts = computed(() =>
    organizationHasConnectedHosts(this.domainGroups().length, this.hostCount()),
  );

  override ngOnInit(): void {
    super.ngOnInit();
    this.subdomainStore.searchList();
    this.domainStore.searchList();
  }

  openAdvancedOnboarding(): void {
    const tier = resolveRedirectRulesAnalyticsOnboardingTier(
      this.domainGroups().length,
      this.hostCount(),
    );
    if (tier === 'ready') {
      return;
    }

    void this.router.navigateByUrl(resolveAdvancedAnalyticsOnboardingPath(tier));
  }
}
