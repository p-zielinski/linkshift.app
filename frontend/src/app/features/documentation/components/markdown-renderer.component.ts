import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  Injector,
  input,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import mermaid from 'mermaid';
import { DocumentationScrollService } from '../services/documentation-scroll.service';
import { buildDocsMarkdownHtml } from '../utils/docs-markdown-html.util';
import { ensureDocsHeadingIds } from '../utils/docs-heading-ids.util';
import { shouldRewriteDocsMarkdownDom } from '../utils/docs-markdown-paint.util';
import { extractDocsFragmentFromHref } from '../utils/docs-route-fragment.util';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'neutral',
});

@Component({
  selector: 'app-markdown-renderer',
  standalone: true,
  imports: [CommonModule],
  host: {
    ngSkipHydration: 'true',
  },
  template: `<article
    #article
    class="docs-markdown markdown-body"
    data-theme="light"
  ></article>`,
  styleUrl: './markdown-renderer.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownRendererComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly docsScroll = inject(DocumentationScrollService);
  private readonly injector = inject(Injector);
  private readonly articleRef = viewChild<ElementRef<HTMLElement>>('article');

  private lastPaintedHtml = '';

  readonly markdown = input.required<string>();
  readonly sourcePath = input<string | undefined>();

  readonly htmlString = computed(() =>
    buildDocsMarkdownHtml(this.markdown(), this.sourcePath()),
  );

  constructor() {
    effect(() => {
      this.htmlString();
      this.articleRef();

      untracked(() => {
        queueMicrotask(() => this.paintMarkdown());
      });
    });

    afterNextRender(
      () => {
        this.paintMarkdown();
      },
      { injector: this.injector },
    );
  }

  @HostListener('click', ['$event'])
  onContentClick(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const anchor = (event.target as Element | null)?.closest('a');
    if (!(anchor instanceof HTMLAnchorElement)) {
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href || /^(https?:|mailto:|tel:)/i.test(href)) {
      return;
    }

    if (href.startsWith('#')) {
      event.preventDefault();
      const fragment = extractDocsFragmentFromHref(href);
      if (fragment) {
        this.scrollSamePageFragment(fragment);
      }
      return;
    }

    if (!href.startsWith('/docs')) {
      return;
    }

    event.preventDefault();
    void this.navigateDocsUrl(href);
  }

  /**
   * Same-page `#anchor` — avoid router (NavigationEnd scroll-to-top race); scroll mat-drawer-content.
   */
  private scrollSamePageFragment(fragment: string): void {
    this.docsScroll.setPendingFragment(fragment);

    const path = this.router.url.split('?')[0].split('#')[0];
    const nextHash = `#${fragment}`;
    if (window.location.hash !== nextHash) {
      history.pushState(null, '', `${path}${nextHash}`);
    }

    const article = this.articleRef()?.nativeElement;
    this.docsScroll.scrollToFragment(fragment, article ?? undefined);
  }

  private async navigateDocsUrl(href: string): Promise<void> {
    const tree = this.router.parseUrl(href);
    const fragment = tree.fragment;
    const targetPath = href.split('#')[0].split('?')[0];
    const currentPath = this.router.url.split('?')[0].split('#')[0];

    if (fragment && targetPath === currentPath) {
      this.scrollSamePageFragment(fragment);
      return;
    }

    if (fragment) {
      this.docsScroll.setPendingFragment(fragment);
    }

    await this.router.navigateByUrl(tree);
  }

  private paintMarkdown(): void {
    const host = this.articleRef()?.nativeElement;
    const html = this.htmlString();
    if (!host) {
      return;
    }

    if (!html) {
      host.innerHTML = '';
      this.lastPaintedHtml = '';
      return;
    }

    if (shouldRewriteDocsMarkdownDom(html, this.lastPaintedHtml, host.innerHTML)) {
      host.innerHTML = html;
    }

    this.lastPaintedHtml = html;

    ensureDocsHeadingIds(host);
    this.docsScroll.onMarkdownContentReady(host);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.renderMermaidCharts(host);
  }

  private async renderMermaidCharts(host: HTMLElement): Promise<void> {
    const nodes = host.querySelectorAll<HTMLElement>('.mermaid:not([data-processed])');
    if (nodes.length === 0) {
      return;
    }

    try {
      await mermaid.run({ nodes: Array.from(nodes) });
      nodes.forEach((node) => node.setAttribute('data-processed', 'true'));
      ensureDocsHeadingIds(host);
      this.docsScroll.onMarkdownContentReady(host);
    } catch (error) {
      console.warn('[LinkShift Docs] Mermaid render failed', error);
    }
  }
}
