import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthStore } from '../store/auth.store';
import { SITE_CONFIG } from '../config/site-config';
import { needsLegalConsent } from '../legal/legal-consent.utils';
import { DomainStore } from '../store/domain.store';
import { DomainGroupStore } from '../store/domain-group.store';
import { LinkMapStore } from '../store/link-map.store';
import { RedirectRuleStore } from '../store/redirect-rule.store';
import { SubdomainStore } from '../store/subdomain.store';
import { prefetchDomainGroupScopedLists } from '../store/prefetch-domain-group-scoped-lists.util';
import { DEFAULT_LIST_KEY } from '../store/entity/entity-store.utils';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { DocsAssistantComponent } from '../../features/documentation/components/docs-assistant/docs-assistant.component';
import { DocsAssistantDrawerService } from '../../features/documentation/services/docs-assistant-drawer.service';
import { resolveDashboardAssistantPageContext } from '../../features/documentation/utils/docs-assistant-page-context.util';
import { DashboardContextService } from './dashboard-context.service';
import { DashboardModeService } from './dashboard-mode.service';
import { resolveDashboardModeToggleNavigation } from './dashboard-mode-toggle-navigation.util';
import { resolveShellReconcileAllowEmptySelection } from './dashboard-workspace-context.util';
import { AppSidebarNavItemComponent } from './app-sidebar-nav-item.component';
import {
  ADVANCED_NAV_SECTIONS,
  CAMPAIGN_NAV_ITEMS,
  type NavItem,
} from './dashboard-nav.config';
import { DOMAIN_GROUPS_REQUIRED_MESSAGE } from '../domain-groups/domain-group.guard';
import { DashboardOnboardingService } from '../../features/dashboard/services/dashboard-onboarding.service';

const MOBILE_BREAKPOINT = '(max-width: 1023px)';
const DOMAIN_GROUPS_LOADING_MESSAGE = 'Loading sites…';

type NavItemState = {
  item: NavItem;
  disabled: boolean;
  tooltip: string;
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    LayoutModule,
    MatDialogModule,
    LogoComponent,
    DocsAssistantComponent,
    AppSidebarNavItemComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly authStore = inject(AuthStore);
  private readonly siteConfig = inject(SITE_CONFIG);
  private readonly router = inject(Router);
  private readonly domainStore = inject(DomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly assistantDrawer = inject(DocsAssistantDrawerService);
  readonly dashboardMode = inject(DashboardModeService);
  private readonly dashboardContext = inject(DashboardContextService);
  readonly campaignNavItems = CAMPAIGN_NAV_ITEMS;
  readonly advancedNavSections = ADVANCED_NAV_SECTIONS;
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly domainGroupListResult = this.domainGroupStore.selectListResult(DEFAULT_LIST_KEY);
  readonly domainGroupsLoading = computed(
    () => this.domainGroupStore.isLoading()[DEFAULT_LIST_KEY] ?? false,
  );
  readonly domainGroupsReady = computed(
    () => this.domainGroupListResult() !== null && !this.domainGroupsLoading(),
  );
  readonly hasDomainGroups = computed(() => this.domainGroups().length > 0);
  readonly legalConsentRequired = computed(() =>
    needsLegalConsent(this.authStore.user(), this.siteConfig),
  );
  readonly isMobile = signal(false);
  readonly mobileNavOpen = signal(false);
  readonly assistantDrawerOpen = this.assistantDrawer.open;
  readonly assistantDrawerContentMounted = this.assistantDrawer.contentMounted;

  readonly currentRoutePath = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0] ?? this.router.url),
      startWith(this.router.url.split('?')[0] ?? this.router.url),
    ),
    { initialValue: this.router.url.split('?')[0] ?? this.router.url },
  );

  readonly askDocsPageContext = computed(() =>
    resolveDashboardAssistantPageContext(this.currentRouteUrl()),
  );

  private readonly currentRouteUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly sidebarTagline = computed(() =>
    this.dashboardMode.mode() === 'campaign'
      ? 'Short links on your domain'
      : 'Environment-ready routing',
  );
  readonly assistantTitle = computed(() =>
    this.dashboardMode.mode() === 'campaign' ? 'Need help?' : 'Ask docs',
  );
  readonly assistantAriaLabel = computed(() =>
    this.dashboardMode.mode() === 'campaign'
      ? 'Get answers from documentation'
      : 'Open documentation assistant',
  );
  readonly showAssistantAiTag = computed(() => this.dashboardMode.mode() === 'advanced');
  readonly currentModeLabel = computed(() =>
    this.dashboardMode.mode() === 'campaign' ? 'Campaign' : 'Advanced',
  );
  readonly dashboardPageHeading = computed(() => `${this.currentModeLabel()} view`);
  readonly modeToggleLabel = computed(() =>
    this.dashboardMode.mode() === 'campaign' ? 'Switch to advanced' : 'Switch to campaign',
  );
  readonly modeToggleAriaLabel = computed(() =>
    this.dashboardMode.mode() === 'campaign'
      ? 'Campaign view active. Switch to advanced view.'
      : 'Advanced view active. Switch to campaign view.',
  );
  readonly campaignNavStates = computed(() =>
    this.campaignNavItems.map((item) => this.resolveNavItemState(item)),
  );
  readonly advancedNavSectionsWithStates = computed(() =>
    this.advancedNavSections.map((section) => ({
      ...section,
      items: section.items.map((item) => this.resolveNavItemState(item)),
    })),
  );

  private readonly onboardingService = inject(DashboardOnboardingService);
  private readonly onboardingWizardOpened = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.assistantDrawer.forceClose();
    });

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(this.breakpointObserver.isMatched(MOBILE_BREAKPOINT));
    }
    effect(() => {
      if (this.authStore.isAuthenticated() && !this.legalConsentRequired()) {
        this.domainGroupStore.searchList();
        this.domainStore.searchList();
        this.subdomainStore.searchList();
      }
    });

    effect(() => {
      if (!this.authStore.isAuthenticated() || this.legalConsentRequired()) {
        return;
      }

      const groups = this.domainGroups();
      if (groups.length === 0) {
        return;
      }

      prefetchDomainGroupScopedLists(
        groups.map((group) => group.id),
        {
          linkMapStore: this.linkMapStore,
          redirectRuleStore: this.redirectRuleStore,
        },
      );
    });

    effect(() => {
      if (!this.domainGroupsReady()) {
        return;
      }

      const groups = this.domainGroups();
      const allowEmptySelection = resolveShellReconcileAllowEmptySelection({
        groupCount: groups.length,
        isCampaignMode: this.dashboardMode.isCampaign(),
        currentRoutePath: this.currentRoutePath(),
      });

      this.dashboardContext.reconcileAvailableGroups(groups, { allowEmptySelection });
    });

    this.observeViewport();
    effect(() => {
      if (!this.isMobile()) {
        this.mobileNavOpen.set(false);
      }
    });

    effect(() => {
      const user = this.authStore.user();
      const routeUrl = this.currentRouteUrl();
      if (!user || this.legalConsentRequired() || this.onboardingWizardOpened()) {
        return;
      }
      if (!this.onboardingService.shouldOpen(user.createdAt)) {
        return;
      }
      if (this.onboardingService.shouldDeferOnboarding(routeUrl)) {
        return;
      }

      this.onboardingWizardOpened.set(true);
      this.onboardingService.open();
    });
  }

  onLogout(): void {
    this.authStore.logout(() => this.router.navigateByUrl('/auth'));
  }

  switchDashboardMode(): void {
    if (this.legalConsentRequired()) {
      return;
    }

    const newMode = this.dashboardMode.isCampaign() ? 'advanced' : 'campaign';
    this.dashboardMode.toggleMode();
    void this.router.navigateByUrl(
      resolveDashboardModeToggleNavigation(this.router.url, newMode),
    );
    if (this.isMobile()) {
      this.closeMobileNav();
    }
  }

  private resolveNavItemState(item: NavItem): NavItemState {
    return {
      item,
      disabled: this.isNavItemDisabled(item),
      tooltip: this.navItemDisabledTooltip(item),
    };
  }

  private isNavItemDisabled(item: NavItem): boolean {
    if (this.legalConsentRequired()) {
      return true;
    }

    return (
      !!item.requiresDomainGroups &&
      (!this.domainGroupsReady() || !this.hasDomainGroups())
    );
  }

  private navItemDisabledTooltip(item: NavItem): string {
    if (this.legalConsentRequired()) {
      return 'Accept updated terms to continue.';
    }

    if (item.requiresDomainGroups) {
      if (!this.domainGroupsReady()) {
        return DOMAIN_GROUPS_LOADING_MESSAGE;
      }

      if (!this.hasDomainGroups()) {
        return DOMAIN_GROUPS_REQUIRED_MESSAGE;
      }
    }

    return '';
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.set(!this.mobileNavOpen());
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  onSidenavOpenedChange(opened: boolean): void {
    if (this.isMobile()) {
      this.mobileNavOpen.set(opened);
    }
  }

  onNavigate(): void {
    if (this.isMobile()) {
      this.closeMobileNav();
    }
  }

  openAssistantDrawer(): void {
    if (this.isMobile()) {
      this.closeMobileNav();
    }
    this.assistantDrawer.openDrawer();
  }

  closeAssistantDrawer(): void {
    this.assistantDrawer.closeDrawer();
  }

  toggleAssistantDrawer(): void {
    if (!this.assistantDrawerOpen()) {
      this.closeMobileNav();
    }
    this.assistantDrawer.toggleDrawer();
  }

  onAssistantDrawerOpenedChange(opened: boolean): void {
    this.assistantDrawer.setOpen(opened);
  }

  onAssistantDrawerAnimationClosed(): void {
    this.assistantDrawer.onDrawerAnimationClosed();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.assistantDrawerOpen()) {
      this.closeAssistantDrawer();
      return;
    }

    if (this.mobileNavOpen()) {
      this.closeMobileNav();
    }
  }

  private observeViewport(): void {
    this.breakpointObserver
      .observe(MOBILE_BREAKPOINT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.isMobile.set(state.matches);
      });
  }
}
