import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MatSidenavContent } from '@angular/material/sidenav';
import { filter } from 'rxjs/operators';
import {
  getDocsNavigationFragment,
  getDocsRouteFragment,
} from '../utils/docs-route-fragment.util';
import { docsScrollDebug } from '../utils/docs-scroll-debug.util';
import {
  findDocsAnchorElement,
  findDocsScrollContainer,
  findDocsShellRoot,
  isDocsScrollAtTop,
  scrollDocsAnchorElement,
  scrollDocsPageToTop,
  waitForNextPaint,
} from '../utils/docs-scroll.util';

const MAX_ANCHOR_SCROLL_ATTEMPTS = 5;
const ANCHOR_SCROLL_RETRY_MS = 50;
const SCROLL_TO_TOP_LATE_RETRY_MS = 120;

@Injectable({
  providedIn: 'root',
})
export class DocumentationScrollService {
  private readonly router = inject(Router);

  private scrollContainer: HTMLElement | null = null;
  private sidenavContent: MatSidenavContent | null = null;
  private pendingFragment: string | null = null;
  private coalesceTimer: ReturnType<typeof setTimeout> | null = null;
  private coalesceContentRoot: HTMLElement | null = null;
  private anchorScrollRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private anchorScrollAttempts = 0;
  private anchorScrollGeneration = 0;
  private pendingScrollToTop = false;
  private scrollToTopFollowUpGeneration = 0;
  private useSmoothScrollToTop = false;

  constructor() {
    if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        queueMicrotask(() => this.handleNavigationEnd(event.urlAfterRedirects));
      });
  }

  private handleNavigationEnd(navigationUrl: string): void {
    this.cancelAnchorScrollWork();
    this.cancelScrollToTopFollowUp();

    const fragment =
      this.pendingFragment ?? getDocsNavigationFragment(this.router, navigationUrl);

    docsScrollDebug('NavigationEnd', {
      url: navigationUrl,
      fragment,
      hash: typeof window !== 'undefined' ? window.location.hash : null,
    });

    if (!fragment) {
      this.requestScrollToTop();
      return;
    }

    this.pendingScrollToTop = false;
    this.anchorScrollAttempts = 0;
    this.requestAnchorScroll('NavigationEnd');
  }

  private cancelAnchorScrollWork(): void {
    this.anchorScrollGeneration += 1;

    if (this.coalesceTimer !== null) {
      clearTimeout(this.coalesceTimer);
      this.coalesceTimer = null;
    }

    if (this.anchorScrollRetryTimer !== null) {
      clearTimeout(this.anchorScrollRetryTimer);
      this.anchorScrollRetryTimer = null;
    }

    this.coalesceContentRoot = null;
  }

  setPendingFragment(fragment: string | null): void {
    this.pendingFragment = fragment;
    docsScrollDebug('setPendingFragment', { fragment });
  }

  clearPendingFragment(): void {
    this.pendingFragment = null;
  }

  currentFragment(): string | null {
    return this.pendingFragment ?? getDocsRouteFragment(this.router);
  }

  registerScrollContainer(element: HTMLElement | null): void {
    this.scrollContainer = element;
    docsScrollDebug('registerScrollContainer', { registered: element instanceof HTMLElement });
  }

  registerSidenavContent(content: MatSidenavContent | null | undefined): void {
    this.sidenavContent = content ?? null;
    const element = content?.getElementRef().nativeElement;
    if (element instanceof HTMLElement) {
      this.registerScrollContainer(element);
    }
  }

  /** Route change without `#fragment` — scroll runs after content paint (not immediately). */
  requestScrollToTop(options?: { smooth?: boolean }): void {
    this.pendingScrollToTop = true;
    this.useSmoothScrollToTop = options?.smooth ?? true;
    this.clearPendingFragment();
    this.cancelScrollToTopFollowUp();
    this.scheduleScrollToTopFollowUp();
  }

  /** Scroll docs column (and document) to top. Returns false when already at top (no-op). */
  scrollContentToTop(): boolean {
    const behavior: ScrollBehavior = this.useSmoothScrollToTop ? 'smooth' : 'auto';
    const container = this.resolveScrollContainer();

    if (isDocsScrollAtTop(container)) {
      docsScrollDebug('scrollContentToTop:skipped-already-at-top', {
        behavior,
        sidenavScrollTop: container?.scrollTop ?? null,
      });
      return false;
    }

    if (container && container.scrollTop > 0) {
      this.sidenavContent?.scrollTo({ top: 0, behavior });
    }

    const result = scrollDocsPageToTop(container, { behavior });

    if (!container && result.targets.length === 0 && !result.skipped) {
      docsScrollDebug('scrollContentToTop:missing-container', result);
      return false;
    }

    docsScrollDebug('scrollContentToTop', {
      behavior,
      sidenavScrollTop: container?.scrollTop ?? null,
      ...result,
    });
    return !result.skipped;
  }

  private cancelScrollToTopFollowUp(): void {
    this.scrollToTopFollowUpGeneration += 1;
  }

  private scheduleScrollToTopFollowUp(): void {
    const generation = this.scrollToTopFollowUpGeneration;

    setTimeout(() => {
      if (generation !== this.scrollToTopFollowUpGeneration || !this.pendingScrollToTop) {
        return;
      }

      this.scrollContentToTop();
      this.finishScrollToTopIfDone();
    }, SCROLL_TO_TOP_LATE_RETRY_MS);
  }

  private applyScrollToTopAfterContentReady(): void {
    if (!this.pendingScrollToTop) {
      return;
    }

    void waitForNextPaint().then(() => {
      if (!this.pendingScrollToTop) {
        return;
      }

      this.scrollContentToTop();
      this.finishScrollToTopIfDone();
    });
  }

  private finishScrollToTopIfDone(): void {
    const container = this.resolveScrollContainer();
    if (!this.pendingScrollToTop || isDocsScrollAtTop(container)) {
      this.pendingScrollToTop = false;
      this.useSmoothScrollToTop = false;
    }
  }

  scrollToFragment(fragment: string, contentRoot?: HTMLElement | null): void {
    this.pendingScrollToTop = false;
    this.setPendingFragment(fragment);
    this.anchorScrollAttempts = 0;
    void this.applyAnchorScroll(fragment, contentRoot ?? undefined, 'scrollToFragment');
  }

  retryAnchorScrollFromPage(): void {
    this.requestAnchorScroll('retry-page');
  }

  onMarkdownContentReady(contentRoot: HTMLElement): void {
    const fragment = this.currentFragment();
    if (fragment) {
      const anchor = findDocsAnchorElement(fragment, contentRoot);
      if (anchor) {
        this.pendingScrollToTop = false;
        this.requestAnchorScroll('markdown-ready', contentRoot);
        return;
      }

      this.clearPendingFragment();
    }

    this.applyScrollToTopAfterContentReady();
  }

  requestAnchorScroll(source: string, contentRoot?: HTMLElement): void {
    const fragment = this.currentFragment();
    if (!fragment) {
      return;
    }

    if (contentRoot) {
      this.coalesceContentRoot = contentRoot;
    }

    if (this.coalesceTimer !== null) {
      clearTimeout(this.coalesceTimer);
    }

    this.coalesceTimer = setTimeout(() => {
      this.coalesceTimer = null;
      const root = this.coalesceContentRoot;
      this.coalesceContentRoot = null;
      void this.applyAnchorScroll(fragment, root ?? undefined, source);
    }, 0);
  }

  private async applyAnchorScroll(
    fragment: string,
    contentRoot: HTMLElement | undefined,
    source: string,
  ): Promise<void> {
    const generation = this.anchorScrollGeneration;
    const root = contentRoot ?? this.findMarkdownContentRoot(fragment);

    if (!root) {
      docsScrollDebug('applyAnchorScroll:missing-root', { source, fragment });
      return;
    }

    let target = findDocsAnchorElement(fragment, root);
    if (!target) {
      await waitForNextPaint();
      if (generation !== this.anchorScrollGeneration) {
        return;
      }
      target = findDocsAnchorElement(fragment, root);
    }

    if (!target) {
      docsScrollDebug('applyAnchorScroll:missing-target', { source, fragment });
      return;
    }

    if (generation !== this.anchorScrollGeneration) {
      return;
    }

    const registered = this.resolveScrollContainer();
    const container = findDocsScrollContainer(target, registered);
    const result = scrollDocsAnchorElement(target, container);

    docsScrollDebug('applyAnchorScroll', {
      source,
      fragment,
      targetId: target.id,
      attempt: this.anchorScrollAttempts,
      ...result,
      delta: result.scrollTopAfter - result.scrollTopBefore,
      container: container?.className ?? null,
    });

    if (generation !== this.anchorScrollGeneration) {
      return;
    }

    if (result.scrolled) {
      this.anchorScrollAttempts = 0;
      this.clearPendingFragment();
      this.scheduleFollowUpScroll(target, container, root, fragment, generation);
      return;
    }

    if (this.anchorScrollAttempts < MAX_ANCHOR_SCROLL_ATTEMPTS) {
      this.anchorScrollAttempts += 1;
      this.scheduleAnchorScrollRetry(fragment, root, source, generation);
      return;
    }

    docsScrollDebug('applyAnchorScroll:give-up', { source, fragment, attempt: this.anchorScrollAttempts });
    this.clearPendingFragment();
  }

  private scheduleAnchorScrollRetry(
    fragment: string,
    root: HTMLElement,
    source: string,
    generation: number,
  ): void {
    if (this.anchorScrollRetryTimer !== null) {
      clearTimeout(this.anchorScrollRetryTimer);
    }

    this.anchorScrollRetryTimer = setTimeout(() => {
      this.anchorScrollRetryTimer = null;
      if (generation !== this.anchorScrollGeneration) {
        return;
      }
      const activeFragment = this.currentFragment();
      if (activeFragment && activeFragment !== fragment) {
        return;
      }
      void this.applyAnchorScroll(fragment, root, `${source}-retry`);
    }, ANCHOR_SCROLL_RETRY_MS);
  }

  private scheduleFollowUpScroll(
    target: HTMLElement,
    container: HTMLElement | null,
    root: HTMLElement,
    fragment: string,
    generation: number,
  ): void {
    requestAnimationFrame(() => {
      if (generation !== this.anchorScrollGeneration) {
        return;
      }
      if (findDocsAnchorElement(fragment, root) !== target) {
        return;
      }
      const result = scrollDocsAnchorElement(target, container);
      docsScrollDebug('applyAnchorScroll:raf', {
        after: result.scrollTopAfter,
        scrolled: result.scrolled,
      });
    });
  }

  private findMarkdownContentRoot(fragment: string): HTMLElement | null {
    const roots = document.querySelectorAll<HTMLElement>('.docs-markdown.markdown-body');
    if (roots.length === 0) {
      return null;
    }

    for (const root of roots) {
      if (findDocsAnchorElement(fragment, root)) {
        return root;
      }
    }

    return roots[0] ?? null;
  }

  private resolveScrollContainer(): HTMLElement | null {
    if (this.scrollContainer) {
      return this.scrollContainer;
    }

    return (
      findDocsShellRoot()?.querySelector<HTMLElement>('mat-sidenav-content.mat-sidenav-content') ??
      document.querySelector<HTMLElement>('.docs-shell .mat-drawer-content')
    );
  }
}
