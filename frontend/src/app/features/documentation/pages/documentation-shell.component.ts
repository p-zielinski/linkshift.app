import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  NavigationEnd,
} from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  MatSidenavContent,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { filter } from 'rxjs/operators';
import { DocumentationOpenApiService } from '../services/documentation-openapi.service';
import { DocumentationContentService } from '../services/documentation-content.service';
import { OpenApiTagGroup } from '../models/openapi.types';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

const MOBILE_BREAKPOINT = '(max-width: 1023px)';
const SMALL_SCREEN_BREAKPOINT = '(max-width: 767px)';

@Component({
  selector: 'app-documentation-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    LogoComponent,
  ],
  templateUrl: './documentation-shell.component.html',
  styleUrl: './documentation-shell.component.css',
})
export class DocumentationShellComponent {
  readonly openApi = inject(DocumentationOpenApiService);
  readonly docsContent = inject(DocumentationContentService);

  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = signal(false);
  readonly isSmallScreen = signal(false);
  readonly mobileDrawerOpen = signal(false);
  readonly manuallyExpandedGroups = signal<string[]>([]);

  @ViewChild(MatSidenavContent) private docsContentRef?: MatSidenavContent;

  constructor() {
    this.openApi.load();

    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(this.breakpointObserver.isMatched(MOBILE_BREAKPOINT));
      this.isSmallScreen.set(this.breakpointObserver.isMatched(SMALL_SCREEN_BREAKPOINT));
    }

    this.breakpointObserver
      .observe([MOBILE_BREAKPOINT, SMALL_SCREEN_BREAKPOINT])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        const isMobile = state.breakpoints[MOBILE_BREAKPOINT] ?? false;
        this.isMobile.set(isMobile);
        this.isSmallScreen.set(state.breakpoints[SMALL_SCREEN_BREAKPOINT] ?? false);
        if (!isMobile) {
          this.mobileDrawerOpen.set(false);
        }
      });

    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      )
      .subscribe(() => {
        this.scrollDocsContentToTop();
      });
  }

  readonly introLinks = [
    { label: 'Overview', route: '/docs' },
    { label: 'API reference', route: '/docs/reference' },
  ];

  readonly siteLinks = [
    { label: 'Home', route: '/home' },
    { label: 'Use Cases', route: '/use-cases' },
    { label: 'Docs', route: '/docs' },
    { label: 'Blog', route: '/blog' },
    { label: 'Pricing', route: '/pricing' },
    { label: 'Contact', route: '/contact' },
    { label: 'Go to app', route: '/auth' },
  ];

  toggleDrawer(): void {
    this.mobileDrawerOpen.set(!this.mobileDrawerOpen());
  }

  closeDrawerOnMobile(): void {
    if (this.isMobile()) {
      this.mobileDrawerOpen.set(false);
    }
  }

  isGroupExpanded(group: OpenApiTagGroup): boolean {
    const activePath = this.currentRoutePath();
    const isActiveGroup = group.endpoints.some(
      (endpoint) => `/docs/api/${endpoint.id}` === activePath,
    );

    return isActiveGroup || this.manuallyExpandedGroups().includes(group.tag);
  }

  onGroupOpened(tag: string): void {
    if (this.manuallyExpandedGroups().includes(tag)) {
      return;
    }

    this.manuallyExpandedGroups.update((groups) => [...groups, tag]);
  }

  onGroupClosed(tag: string): void {
    this.manuallyExpandedGroups.update((groups) => groups.filter((entry) => entry !== tag));
  }

  onEndpointNavigate(tag: string): void {
    this.onGroupOpened(tag);
    this.closeDrawerOnMobile();
  }

  private currentRoutePath(): string {
    return this.router.url.split('?')[0] ?? this.router.url;
  }

  private scrollDocsContentToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.docsContentRef?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
