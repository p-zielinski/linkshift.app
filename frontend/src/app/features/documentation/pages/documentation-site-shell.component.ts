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
import { LogoComponent } from '../../../shared/components/logo/logo.component';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

@Component({
  selector: 'app-documentation-site-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    LogoComponent,
  ],
  templateUrl: './documentation-site-shell.component.html',
  styleUrl: './documentation-site-shell.component.css',
})
export class DocumentationSiteShellComponent {
  readonly isMobile = signal(false);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(this.breakpointObserver.isMatched(MOBILE_BREAKPOINT));
      this.lockDocumentScrollWhileInDocs();
    }
    this.observeViewport();
  }

  /** Keep scroll inside mat-sidenav-content instead of the document. */
  private lockDocumentScrollWhileInDocs(): void {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = previousOverflow;
    });
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
