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
  findDocsMainBodyScroller,
  findDocsScrollContainer,
  findDocsShellRoot,
  isDocsMainBodyAtTop,
  readDocsSidebarNavScrollTop,
  restoreDocsSidebarNavScrollTop,
  scrollDocsAnchorElement,
  scrollDocsMainBodyToTop,
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

  private mainBodyScroll: HTMLElement | null = null;
  private pendingFragment: string | null = null;
  private coalesceTimer: ReturnType<typeof setTimeout> | null = null;
  private coalesceContentRoot: HTMLElement | null = null;
  private anchorScrollRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private anchorScrollAttempts = 0;
  private anchorScrollGeneration = 0;
  private pendingScrollToTop = false;
  private scrollToTopFollowUpGeneration = 0;
  private sidebarNavScrollSnapshot: number | null = null;

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

  registerMainBodyScroll(element: HTMLElement | null): void {
    this.mainBodyScroll = element;
    docsScrollDebug('registerMainBodyScroll', {
      registered: element instanceof HTMLElement,
      id: element?.id ?? null,
    });
  }

  /** @deprecated Use registerMainBodyScroll */
  registerSidenavContent(content: { getElementRef(): { nativeElement: unknown } } | null | undefined): void {
    const element = content?.getElementRef().nativeElement;
    if (element instanceof HTMLElement) {
      const body = element.querySelector<HTMLElement>('.docs-main-body-scroll');
      this.registerMainBodyScroll(body ?? element);
    }
  }

  /** Call from sidebar pointerdown before navigation mutates layout/scroll. */
  recordSidebarNavScroll(): void {
    const scrollTop = readDocsSidebarNavScrollTop();
    if (scrollTop === null) {
      return;
    }

    this.sidebarNavScrollSnapshot = scrollTop;
    docsScrollDebug('recordSidebarNavScroll', { scrollTop });
  }

  restoreSidebarNavScrollIfPending(): void {
    if (this.sidebarNavScrollSnapshot === null) {
      return;
    }

    restoreDocsSidebarNavScrollTop(this.sidebarNavScrollSnapshot);
  }

  /** Routed page finished rendering (API page, overview, etc.). */
  notifyRouteContentReady(): void {
    if (!this.pendingScrollToTop) {
      return;
    }

    this.applyScrollToTopAfterContentReady();
  }

  private handleNavigationEnd(navigationUrl: string): void {
    this.cancelAnchorScrollWork();
    this.cancelScrollToTopFollowUp();

    const fragment =
      this.pendingFragment ?? getDocsNavigationFragment(this.router, navigationUrl);

    docsScrollDebug('NavigationEnd', {
      url: navigationUrl,
      fragment,
      sidebarScrollTop: readDocsSidebarNavScrollTop(),
      bodyScrollTop: this.resolveMainBodyScroll()?.scrollTop ?? null,
    });

    if (!fragment) {
      this.beginScrollToTop();
      return;
    }

    this.pendingScrollToTop = false;
    this.anchorScrollAttempts = 0;
    this.requestAnchorScroll('NavigationEnd');
  }

  private beginScrollToTop(): void {
    if (this.sidebarNavScrollSnapshot === null) {
      this.sidebarNavScrollSnapshot = readDocsSidebarNavScrollTop();
    }

    this.pendingScrollToTop = true;
    this.cancelScrollToTopFollowUp();
    this.scheduleScrollToTopFollowUp();
    void waitForNextPaint().then(() => {
      if (this.pendingScrollToTop) {
        this.scrollMainBodyToTop();
      }
    });
  }

  scrollContentToTop(): boolean {
    return this.scrollMainBodyToTop();
  }

  private scrollMainBodyToTop(): boolean {
    const body = this.resolveMainBodyScroll();

    if (!body) {
      docsScrollDebug('scrollMainBodyToTop:missing-body', {});
      return false;
    }

    if (isDocsMainBodyAtTop(body)) {
      docsScrollDebug('scrollMainBodyToTop:skipped-already-at-top', {
        bodyScrollTop: body.scrollTop,
        sidebarSnapshot: this.sidebarNavScrollSnapshot,
      });
      return false;
    }

    const result = scrollDocsMainBodyToTop(body, { behavior: 'auto' });
    this.restoreSidebarNavScroll();

    docsScrollDebug('scrollMainBodyToTop', {
      bodyScrollTop: body.scrollTop,
      sidebarScrollTopBefore: this.sidebarNavScrollSnapshot,
      sidebarScrollTopAfter: readDocsSidebarNavScrollTop(),
      targetLabels: result.targets.map((entry) => entry.label),
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

      this.scrollMainBodyToTop();
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

      this.scrollMainBodyToTop();
      this.finishScrollToTopIfDone();
    });
  }

  private finishScrollToTopIfDone(): void {
    const body = this.resolveMainBodyScroll();
    if (!this.pendingScrollToTop || isDocsMainBodyAtTop(body)) {
      this.restoreSidebarNavScroll();
      this.pendingScrollToTop = false;
      this.sidebarNavScrollSnapshot = null;
    }
  }

  private restoreSidebarNavScroll(): void {
    restoreDocsSidebarNavScrollTop(this.sidebarNavScrollSnapshot);
    requestAnimationFrame(() => {
      restoreDocsSidebarNavScrollTop(this.sidebarNavScrollSnapshot);
    });
  }

  private resolveMainBodyScroll(): HTMLElement | null {
    if (this.mainBodyScroll && !this.mainBodyScroll.closest('.docs-sidebar')) {
      return this.mainBodyScroll;
    }

    return findDocsMainBodyScroller(findDocsShellRoot());
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

    const registered = this.resolveMainBodyScroll();
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
}
