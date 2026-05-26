import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  Injector,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import mermaid from 'mermaid';
import { DocumentationScrollService } from '../services/documentation-scroll.service';
import { buildDocsMarkdownHtml } from '../utils/docs-markdown-html.util';
import { ensureDocsHeadingIds } from '../utils/docs-heading-ids.util';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'neutral',
});

@Component({
  selector: 'app-markdown-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `<article
    #article
    class="docs-markdown markdown-body"
    data-theme="light"
  ></article>`,
  styleUrl: './markdown-renderer.component.css',
})
export class MarkdownRendererComponent {
  private readonly platformId = inject(PLATFORM_ID);
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
      const html = this.htmlString();
      this.articleRef();

      if (!html || !isPlatformBrowser(this.platformId)) {
        return;
      }

      untracked(() => {
        queueMicrotask(() => this.paintMarkdown());
      });
    });

    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(
        () => {
          this.paintMarkdown();
        },
        { injector: this.injector },
      );
    }
  }

  private paintMarkdown(): void {
    const host = this.articleRef()?.nativeElement;
    const html = this.htmlString();
    if (!host || !html) {
      return;
    }

    if (html !== this.lastPaintedHtml) {
      host.innerHTML = html;
      this.lastPaintedHtml = html;
    }

    ensureDocsHeadingIds(host);
    this.docsScroll.onMarkdownContentReady(host);
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
