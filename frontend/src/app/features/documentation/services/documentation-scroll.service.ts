import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { getDocsRouteFragment } from '../utils/docs-route-fragment.util';
import {
  observeDocsAnchorAndScroll,
  repeatDocsAnchorScroll,
  scrollToDocsAnchorWhenReady,
} from '../utils/docs-scroll.util';

@Injectable({
  providedIn: 'root',
})
export class DocumentationScrollService {
  private readonly router = inject(Router);

  constructor() {
    if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }

  private scrollContainer: HTMLElement | null = null;
  private stopObserving: (() => void) | null = null;
  private scrollGeneration = 0;

  currentFragment(): string | null {
    return getDocsRouteFragment(this.router);
  }

  registerScrollContainer(element: HTMLElement | null): void {
    this.scrollContainer = element;
  }

  cancelPendingScroll(): void {
    this.scrollGeneration += 1;
    this.stopObserving?.();
    this.stopObserving = null;
  }

  /**
   * Call from page ngAfterViewInit / refresh when markdown may already be painted.
   */
  retryAnchorScrollFromPage(): void {
    const fragment = this.currentFragment();
    if (!fragment) {
      return;
    }

    const contentRoot = document.querySelector<HTMLElement>('.docs-markdown.markdown-body');
    if (!contentRoot) {
      return;
    }

    this.scheduleAnchorScroll(contentRoot);
  }

  /**
   * Call after markdown HTML is in the DOM (post-innerHTML / heading ids).
   */
  onMarkdownContentReady(contentRoot: HTMLElement): void {
    const fragment = this.currentFragment();
    if (!fragment) {
      return;
    }

    this.scheduleAnchorScroll(contentRoot);
  }

  private scheduleAnchorScroll(contentRoot: HTMLElement): void {
    const fragment = this.currentFragment();
    if (!fragment) {
      return;
    }

    this.cancelPendingScroll();
    const generation = this.scrollGeneration;
    const scrollContainer = this.resolveScrollContainer();

    this.stopObserving = observeDocsAnchorAndScroll(fragment, contentRoot, {
      scrollContainer,
    });

    void this.runAnchorScrollPasses(fragment, contentRoot, scrollContainer, generation);
  }

  private async runAnchorScrollPasses(
    fragment: string,
    contentRoot: HTMLElement,
    scrollContainer: HTMLElement | null,
    generation: number,
  ): Promise<void> {
    const scrolled = await scrollToDocsAnchorWhenReady(fragment, {
      contentRoot,
      scrollContainer,
      timeoutMs: 8_000,
    });

    if (generation !== this.scrollGeneration) {
      return;
    }

    if (scrolled) {
      await repeatDocsAnchorScroll(fragment, {
        contentRoot,
        scrollContainer,
        delaysMs: [0, 150, 400, 800],
      });
    }

    if (generation === this.scrollGeneration) {
      this.cancelPendingScroll();
    }
  }

  private resolveScrollContainer(): HTMLElement | null {
    if (this.scrollContainer) {
      return this.scrollContainer;
    }

    return document.querySelector<HTMLElement>('.docs-shell .mat-drawer-content');
  }
}
