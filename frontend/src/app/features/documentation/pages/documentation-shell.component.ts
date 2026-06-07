import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentationOpenApiService } from '../services/documentation-openapi.service';
import { DocumentationContentService } from '../services/documentation-content.service';
import { DocumentationScrollService } from '../services/documentation-scroll.service';
import { AuthStore } from '../../../core/store/auth.store';
import { DashboardModeService } from '../../../core/layout/dashboard-mode.service';
import { DocsAssistantDrawerService } from '../services/docs-assistant-drawer.service';
import { DocsNavDrawerService } from '../services/docs-nav-drawer.service';

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
    MatProgressSpinnerModule,
  ],
  templateUrl: './documentation-shell.component.html',
  styleUrl: './documentation-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentationShellComponent implements AfterViewInit {
  readonly openApi = inject(DocumentationOpenApiService);
  readonly docsContent = inject(DocumentationContentService);
  private readonly docsScroll = inject(DocumentationScrollService);

  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly authStore = inject(AuthStore);
  private readonly dashboardMode = inject(DashboardModeService);
  private readonly assistantDrawer = inject(DocsAssistantDrawerService);
  private readonly docsNavDrawer = inject(DocsNavDrawerService);

  readonly isMobile = signal(false);
  readonly isSmallScreen = signal(false);
  readonly docsNavDrawerOpen = this.docsNavDrawer.open;
  readonly manuallyExpandedEndpointGroups = signal<string[]>([]);
  readonly manuallyExpandedNavGroups = signal<string[]>([]);
  readonly assistantDrawerOpen = this.assistantDrawer.open;

  readonly startNavGroup = this.docsContent.sidebarNavGroups.find(
    (group) => group.id === 'start',
  );

  readonly sidebarNavGroups = this.docsContent.sidebarNavGroups.filter(
    (group) => group.id !== 'api-reference' && group.id !== 'start',
  );

  readonly apiReferenceNavGroup = this.docsContent.sidebarNavGroups.find(
    (group) => group.id === 'api-reference',
  );

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
          this.docsNavDrawer.close();
        }
      });
  }

  ngAfterViewInit(): void {
    this.docsScroll.registerMainBodyScroll(this.docsMainBodyRef?.nativeElement ?? null);
  }

  readonly currentRoutePath = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0] ?? this.router.url),
      startWith(this.router.url.split('?')[0] ?? this.router.url),
    ),
    { initialValue: this.router.url.split('?')[0] ?? this.router.url },
  );

  private readonly marketingSiteLinks = [
    { label: 'Home', route: '/' },
    { label: 'Use Cases', route: '/use-cases' },
    { label: 'Docs', route: '/docs' },
    { label: 'Blog', route: '/blog' },
    { label: 'Pricing', route: '/pricing' },
    { label: 'Contact', route: '/contact' },
  ] as const;

  readonly siteLinks = computed(() => {
    if (this.authStore.isAuthenticated()) {
      return [
        ...this.marketingSiteLinks,
        { label: 'Go to app', route: this.dashboardMode.defaultLandingPath() },
      ];
    }

    return [
      ...this.marketingSiteLinks,
      { label: 'Sign in', route: '/auth' },
      { label: 'Start now', route: '/auth' },
    ];
  });

  onDocsNavDrawerOpenedChange(opened: boolean): void {
    if (this.isMobile()) {
      this.docsNavDrawer.setOpen(opened);
    }
  }

  closeDrawerOnMobile(): void {
    if (this.isMobile()) {
      this.docsNavDrawer.close();
    }
  }

  readonly navGroupExpansion = computed(() => {
    const activePath = this.currentRoutePath();
    const manuallyExpanded = new Set(this.manuallyExpandedNavGroups());
    const expansion: Record<string, boolean> = {};

    for (const group of this.sidebarNavGroups) {
      const isActiveGroup = group.pages.some((page) => page.route === activePath);
      expansion[group.id] = isActiveGroup || manuallyExpanded.has(group.id);
    }

    return expansion;
  });

  onNavGroupOpened(groupId: string): void {
    if (this.manuallyExpandedNavGroups().includes(groupId)) {
      return;
    }

    this.manuallyExpandedNavGroups.update((groups) => [...groups, groupId]);
    this.docsScroll.restoreSidebarNavScrollIfPending();
  }

  onNavGroupClosed(groupId: string): void {
    this.manuallyExpandedNavGroups.update((groups) =>
      groups.filter((entry) => entry !== groupId),
    );
  }

  onNavPageNavigate(groupId: string): void {
    this.onNavGroupOpened(groupId);
    this.closeDrawerOnMobile();
  }

  readonly endpointGroupExpansion = computed(() => {
    const activePath = this.currentRoutePath();
    const manuallyExpanded = new Set(this.manuallyExpandedEndpointGroups());
    const expansion: Record<string, boolean> = {};

    for (const group of this.openApi.tagGroups()) {
      const isActiveGroup = group.endpoints.some(
        (endpoint) => `/docs/api/${endpoint.id}` === activePath,
      );
      expansion[group.tag] = isActiveGroup || manuallyExpanded.has(group.tag);
    }

    return expansion;
  });

  onEndpointGroupOpened(tag: string): void {
    if (this.manuallyExpandedEndpointGroups().includes(tag)) {
      return;
    }

    this.manuallyExpandedEndpointGroups.update((groups) => [...groups, tag]);
    this.docsScroll.restoreSidebarNavScrollIfPending();
  }

  /** Capture before router navigation / accordion layout so scroll-to-top cannot zero it. */
  recordSidebarNavScroll(): void {
    this.docsScroll.recordSidebarNavScroll();
  }

  onEndpointGroupClosed(tag: string): void {
    this.manuallyExpandedEndpointGroups.update((groups) =>
      groups.filter((entry) => entry !== tag),
    );
  }

  onEndpointNavigate(tag: string): void {
    this.onEndpointGroupOpened(tag);
    this.closeDrawerOnMobile();
  }

  openAssistantDrawer(): void {
    this.closeDrawerOnMobile();
    this.assistantDrawer.openDrawer();
  }

  closeAssistantDrawer(): void {
    this.assistantDrawer.closeDrawer();
  }

}
