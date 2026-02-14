import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthStore } from '../store/auth.store';
import { DomainStore } from '../store/domain.store';
import { DomainGroupStore } from '../store/domain-group.store';
import { DEFAULT_LIST_KEY } from '../store/entity/entity-store.utils';
import { CheckoutStatusDialogComponent } from '../../features/billing/checkout-status-dialog/checkout-status-dialog.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';

type NavItem = {
  label: string;
  route: string;
  icon: string;
  requiresDomainGroups?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Profile', route: '/profile', icon: 'person' },
  { label: 'Organization', route: '/organization', icon: 'groups' },
  { label: 'Domain Groups', route: '/domain-groups', icon: 'layers' },
  { label: 'Domains', route: '/domains', icon: 'public', requiresDomainGroups: true },
  {
    label: 'Redirect Rules',
    route: '/redirect-rules',
    icon: 'swap_horiz',
    requiresDomainGroups: true,
  },
  {
    label: 'Tests',
    route: '/tests',
    icon: 'science',
    requiresDomainGroups: true,
  },
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
  ],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly domainStore = inject(DomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly platformId = inject(PLATFORM_ID);

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
  readonly isMobile = signal(false);
  readonly mobileNavOpen = signal(false);
  private readonly lastCheckoutSessionId = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(this.breakpointObserver.isMatched(MOBILE_BREAKPOINT));
    }
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.domainStore.searchList();
        this.domainGroupStore.searchList();
      }
    });
    this.observeViewport();
    this.observeCheckoutSessions();
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
    return !!item.requiresDomainGroups && this.domainGroupsReady() && !this.hasDomainGroups();
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

  private observeViewport(): void {
    this.breakpointObserver
      .observe(MOBILE_BREAKPOINT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.isMobile.set(state.matches);
      });
  }

  private observeCheckoutSessions(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const sessionId = params.get('checkout_session');
      if (!sessionId || this.lastCheckoutSessionId() === sessionId) {
        return;
      }

      this.lastCheckoutSessionId.set(sessionId);
      const dialogRef = this.dialog.open(CheckoutStatusDialogComponent, {
        data: { sessionId },
        width: 'min(520px, 92vw)',
        maxWidth: '92vw',
        closeOnNavigation: false,
      });

      dialogRef
        .afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.router.navigate([], {
            queryParams: { checkout_session: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        });
    });
  }
}
