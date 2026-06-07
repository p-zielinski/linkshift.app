import {
  Component,
  DestroyRef,
  HostListener,
  PLATFORM_ID,
  computed,
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
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { tryRestoreAuthSession } from '../../../core/auth/auth-session-restore.util';
import { AuthStore } from '../../../core/store/auth.store';
import { DashboardModeService } from '../../../core/layout/dashboard-mode.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { DocsAssistantComponent } from '../components/docs-assistant/docs-assistant.component';
import { DocsAssistantDrawerService } from '../services/docs-assistant-drawer.service';
import { DocsNavDrawerService } from '../services/docs-nav-drawer.service';
import { DocumentationContentService } from '../services/documentation-content.service';
import { resolveDocsAssistantPageContext } from '../utils/docs-assistant-page-context.util';

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
    MatIconModule,
    MatSidenavModule,
    LogoComponent,
    DocsAssistantComponent,
  ],
  templateUrl: './documentation-site-shell.component.html',
  styleUrl: './documentation-site-shell.component.css',
})
export class DocumentationSiteShellComponent {
  readonly isMobile = signal(false);
  readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());
  readonly appLandingPath = computed(() => this.dashboardMode.defaultLandingPath());
  private readonly authStore = inject(AuthStore);
  private readonly dashboardMode = inject(DashboardModeService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly assistantDrawer = inject(DocsAssistantDrawerService);
  private readonly docsNavDrawer = inject(DocsNavDrawerService);
  private readonly router = inject(Router);
  private readonly docsContent = inject(DocumentationContentService);

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
    resolveDocsAssistantPageContext(this.currentRoutePath(), this.docsContent),
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(this.breakpointObserver.isMatched(MOBILE_BREAKPOINT));
      tryRestoreAuthSession(this.authStore).subscribe();
      this.lockDocumentScrollWhileInDocs();
    }

    this.destroyRef.onDestroy(() => {
      this.assistantDrawer.forceClose();
      this.docsNavDrawer.close();
    });

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

  onSignInClick(event: Event): void {
    if (!this.isAuthenticated()) {
      return;
    }

    event.preventDefault();
    void this.router.navigateByUrl(this.appLandingPath());
  }

  closeAssistantDrawer(): void {
    this.assistantDrawer.closeDrawer();
  }

  toggleDocsNav(): void {
    if (this.assistantDrawerOpen()) {
      this.closeAssistantDrawer();
    }
    this.docsNavDrawer.toggle();
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
