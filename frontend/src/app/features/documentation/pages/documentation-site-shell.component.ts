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
import { MatSidenavModule } from '@angular/material/sidenav';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { DocsAssistantComponent } from '../components/docs-assistant/docs-assistant.component';
import { DocsAssistantDrawerService } from '../services/docs-assistant-drawer.service';
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
    MatSidenavModule,
    LogoComponent,
    DocsAssistantComponent,
  ],
  templateUrl: './documentation-site-shell.component.html',
  styleUrl: './documentation-site-shell.component.css',
})
export class DocumentationSiteShellComponent {
  readonly isMobile = signal(false);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly assistantDrawer = inject(DocsAssistantDrawerService);
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
      this.lockDocumentScrollWhileInDocs();
    }

    this.destroyRef.onDestroy(() => {
      this.assistantDrawer.forceClose();
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

  closeAssistantDrawer(): void {
    this.assistantDrawer.closeDrawer();
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
