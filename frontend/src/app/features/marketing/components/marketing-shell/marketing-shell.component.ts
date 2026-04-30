import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(this.breakpointObserver.isMatched(MOBILE_BREAKPOINT));
    }
    this.observeViewport();
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
