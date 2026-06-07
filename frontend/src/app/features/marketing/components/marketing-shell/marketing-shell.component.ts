import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { tryRestoreAuthSession } from '../../../../core/auth/auth-session-restore.util';
import { AuthStore } from '../../../../core/store/auth.store';
import { DashboardModeService } from '../../../../core/layout/dashboard-mode.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

@Component({
  selector: 'app-marketing-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    LogoComponent,
  ],
  templateUrl: './marketing-shell.component.html',
  styleUrl: './marketing-shell.component.css',
})
export class MarketingShellComponent {
  readonly siteConfig = inject(SITE_CONFIG);
  readonly isMobile = signal(false);
  readonly mobileNavOpen = signal(false);
  readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());
  readonly appLandingPath = computed(() => this.dashboardMode.defaultLandingPath());
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly dashboardMode = inject(DashboardModeService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(this.breakpointObserver.isMatched(MOBILE_BREAKPOINT));
      tryRestoreAuthSession(this.authStore).subscribe();
    }
    this.observeViewport();
  }

  onSignInClick(event: Event): void {
    if (!this.isAuthenticated()) {
      return;
    }

    event.preventDefault();
    void this.router.navigateByUrl(this.appLandingPath());
    this.onNavigate();
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.set(!this.mobileNavOpen());
  }

  onSidenavOpenedChange(opened: boolean): void {
    if (this.isMobile()) {
      this.mobileNavOpen.set(opened);
    }
  }

  onNavigate(): void {
    if (this.isMobile()) {
      this.mobileNavOpen.set(false);
    }
  }

  private observeViewport(): void {
    this.breakpointObserver
      .observe(MOBILE_BREAKPOINT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.isMobile.set(state.matches);
        if (!state.matches) {
          this.mobileNavOpen.set(false);
        }
      });
  }
}
