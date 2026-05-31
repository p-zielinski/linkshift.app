import {
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
  RouterLinkActive,
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
import { DEFAULT_LIST_KEY } from '../store/entity/entity-store.utils';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { DocsAssistantComponent } from '../../features/documentation/components/docs-assistant/docs-assistant.component';
import { DocsAssistantDrawerService } from '../../features/documentation/services/docs-assistant-drawer.service';
import { resolveDashboardAssistantPageContext } from '../../features/documentation/utils/docs-assistant-page-context.util';

type NavItem = {
  label: string;
  route: string;
  icon: string;
  requiresDomainGroups?: boolean;
  matchSubRoutes?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Analytics', route: '/redirect-rules-analytics', icon: 'analytics' },
  { label: 'Profile', route: '/profile', icon: 'person' },
  { label: 'Organization', route: '/organization', icon: 'groups', matchSubRoutes: true },
  { label: 'Domain Groups', route: '/domain-groups', icon: 'layers' },
  { label: 'Domains', route: '/domains', icon: 'public', requiresDomainGroups: true },
  { label: 'Subdomains', route: '/subdomains', icon: 'alternate_email', requiresDomainGroups: true },
  {
    label: 'Redirect Rules',
    route: '/redirect-rules',
    icon: 'swap_horiz',
    requiresDomainGroups: true,
  },
  {
    label: 'Link Maps',
    route: '/link-maps',
    icon: 'map',
    requiresDomainGroups: true,
    matchSubRoutes: true,
  },
  {
    label: 'Tests',
    route: '/tests',
    icon: 'science',
    requiresDomainGroups: true,
  },
  { label: 'Tools', route: '/tools', icon: 'construction', matchSubRoutes: true },
  { label: 'Docs', route: '/docs', icon: 'description', matchSubRoutes: true },
];

const MOBILE_BREAKPOINT = '(max-width: 1023px)';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    LayoutModule,
    MatDialogModule,
    LogoComponent,
    DocsAssistantComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  readonly authStore = inject(AuthStore);
  private readonly siteConfig = inject(SITE_CONFIG);
  private readonly router = inject(Router);
  private readonly domainStore = inject(DomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly assistantDrawer = inject(DocsAssistantDrawerService);

  readonly navItems = NAV_ITEMS;
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
    resolveDashboardAssistantPageContext(this.currentRoutePath()),
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.assistantDrawer.forceClose();
    });

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(this.breakpointObserver.isMatched(MOBILE_BREAKPOINT));
    }
    effect(() => {
      if (this.authStore.isAuthenticated() && !this.legalConsentRequired()) {
        this.domainStore.searchList();
        this.domainGroupStore.searchList();
      }
    });
    this.observeViewport();
    effect(() => {
      if (!this.isMobile()) {
        this.mobileNavOpen.set(false);
      }
    });
  }

  onLogout(): void {
    this.authStore.logout(() => this.router.navigateByUrl('/auth'));
  }

  isDisabled(item: NavItem): boolean {
    if (this.legalConsentRequired()) {
      return true;
    }

    return !!item.requiresDomainGroups && this.domainGroupsReady() && !this.hasDomainGroups();
  }

  navDisabledTooltip(item: NavItem): string {
    if (this.legalConsentRequired()) {
      return 'Accept updated terms to continue.';
    }

    if (this.isDisabled(item)) {
      return 'Create a domain group to access this section.';
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
