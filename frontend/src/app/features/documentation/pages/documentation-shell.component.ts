import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentationOpenApiService } from '../services/documentation-openapi.service';
import { DocumentationContentService } from '../services/documentation-content.service';
import { DocumentationScrollService } from '../services/documentation-scroll.service';
import { OpenApiTagGroup } from '../models/openapi.types';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { DocsAssistantDrawerService } from '../services/docs-assistant-drawer.service';

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
export class DocumentationShellComponent implements AfterViewInit {
  readonly openApi = inject(DocumentationOpenApiService);
  readonly docsContent = inject(DocumentationContentService);
  private readonly docsScroll = inject(DocumentationScrollService);

  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly assistantDrawer = inject(DocsAssistantDrawerService);

  readonly isMobile = signal(false);
  readonly isSmallScreen = signal(false);
  readonly mobileDrawerOpen = signal(false);
  readonly manuallyExpandedGroups = signal<string[]>([]);
  readonly assistantDrawerOpen = this.assistantDrawer.open;

  @ViewChild('docsMainBody') private docsMainBodyRef?: ElementRef<HTMLElement>;

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
  }

  ngAfterViewInit(): void {
    this.docsScroll.registerMainBodyScroll(this.docsMainBodyRef?.nativeElement ?? null);
  }

  readonly introLinks = [
    { label: 'Overview', route: '/docs' },
    { label: 'API reference', route: '/docs/reference' },
  ];

  readonly currentRoutePath = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0] ?? this.router.url),
      startWith(this.router.url.split('?')[0] ?? this.router.url),
    ),
    { initialValue: this.router.url.split('?')[0] ?? this.router.url },
  );

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
    this.docsScroll.restoreSidebarNavScrollIfPending();
  }

  /** Capture before router navigation / accordion layout so scroll-to-top cannot zero it. */
  recordSidebarNavScroll(): void {
    this.docsScroll.recordSidebarNavScroll();
  }

  onGroupClosed(tag: string): void {
    this.manuallyExpandedGroups.update((groups) => groups.filter((entry) => entry !== tag));
  }

  onEndpointNavigate(tag: string): void {
    this.onGroupOpened(tag);
    this.closeDrawerOnMobile();
  }

  openAssistantDrawer(): void {
    this.closeDrawerOnMobile();
    this.assistantDrawer.openDrawer();
  }

  closeAssistantDrawer(): void {
    this.assistantDrawer.closeDrawer();
  }

  toggleAssistantDrawer(): void {
    if (!this.assistantDrawerOpen()) {
      this.closeDrawerOnMobile();
    }
    this.assistantDrawer.toggleDrawer();
  }

}
