import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  getDocsNavigationFragment,
  getDocsRouteFragment,
} from '../utils/docs-route-fragment.util';
import { docsScrollDebug } from '../utils/docs-scroll-debug.util';
import {
  findDocsAnchorElement,
  scrollDocsAnchorElement,
  waitForNextPaint,
} from '../utils/docs-scroll.util';

@Injectable({
  providedIn: 'root',
})
export class DocumentationScrollService {
  private readonly router = inject(Router);

  private scrollContainer: HTMLElement | null = null;
  private pendingFragment: string | null = null;
  private coalesceTimer: ReturnType<typeof setTimeout> | null = null;
  private coalesceContentRoot: HTMLElement | null = null;

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
    const fragment =
      this.pendingFragment ?? getDocsNavigationFragment(this.router, navigationUrl);

    docsScrollDebug('NavigationEnd', {
      url: navigationUrl,
      fragment,
      hash: typeof window !== 'undefined' ? window.location.hash : null,
    });

    if (!fragment) {
      this.clearPendingFragment();
      this.scrollContentToTop();
      return;
    }

    this.requestAnchorScroll('NavigationEnd');
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

  /** Scroll markdown column to top (navigation without `#fragment`). */
  scrollContentToTop(): void {
    const container = this.resolveScrollContainer();
    if (!container) {
      return;
    }

    container.scrollTo({ top: 0, behavior: 'auto' });
    docsScrollDebug('scrollContentToTop', { after: container.scrollTop });
  }

  /** @deprecated No-op — kept so callers do not need churn; scroll is coalesced instead. */
  cancelPendingScroll(): void {
    docsScrollDebug('cancelPendingScroll (no-op)');
  }

  /**
   * Immediate scroll when the anchor is already in the DOM (same-page links).
   */
  scrollToFragment(fragment: string, contentRoot?: HTMLElement | null): void {
    this.setPendingFragment(fragment);
    void this.applyAnchorScroll(fragment, contentRoot ?? undefined, 'scrollToFragment');
  }

  retryAnchorScrollFromPage(): void {
    this.requestAnchorScroll('retry-page');
  }

  onMarkdownContentReady(contentRoot: HTMLElement): void {
    if (!this.currentFragment()) {
      return;
    }

    this.requestAnchorScroll('markdown-ready', contentRoot);
  }

  /**
   * Coalesce burst calls (NavigationEnd + markdown paint + retries) into one scroll pass.
   */
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
    const root = contentRoot ?? this.findMarkdownContentRoot(fragment);

    if (!root) {
      docsScrollDebug('applyAnchorScroll:missing-root', { source, fragment });
      return;
    }

    let target = findDocsAnchorElement(fragment, root);
    if (!target) {
      await waitForNextPaint();
      target = findDocsAnchorElement(fragment, root);
    }

    if (!target) {
      docsScrollDebug('applyAnchorScroll:missing-target', { source, fragment });
      return;
    }

    const container = this.resolveScrollContainer();
    const before = container?.scrollTop ?? null;

    scrollDocsAnchorElement(target, container);

    docsScrollDebug('applyAnchorScroll', {
      source,
      fragment,
      targetId: target.id,
      before,
      after: container?.scrollTop ?? null,
      container: container?.className ?? null,
    });

    this.clearPendingFragment();

    // Layout may shift after mermaid/fonts — one follow-up scroll, no generation/cancel storm.
    requestAnimationFrame(() => {
      if (findDocsAnchorElement(fragment, root) !== target) {
        return;
      }
      scrollDocsAnchorElement(target, container);
      docsScrollDebug('applyAnchorScroll:raf', {
        after: container?.scrollTop ?? null,
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
      document.querySelector<HTMLElement>('.docs-shell mat-sidenav-content') ??
      document.querySelector<HTMLElement>('.docs-shell .mat-drawer-content')
    );
  }
}
