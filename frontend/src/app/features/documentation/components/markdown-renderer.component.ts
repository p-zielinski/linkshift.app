import { CommonModule } from '@angular/common';
import {
  Component,
  SecurityContext,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: false,
});

const LOCAL_DOC_LINKS: Record<string, string> = {
  './domains-and-groups.md': '/docs/guides/domains-and-groups',
  './redirect-rules.md': '/docs/guides/redirect-rules',
  './link-maps.md': '/docs/guides/link-maps',
  './link-map-entries.md': '/docs/guides/link-map-entries',
  './redirect-tests.md': '/docs/guides/redirect-tests',
};

@Component({
  selector: 'app-markdown-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `<article class="docs-markdown markdown-body" [innerHTML]="html()"></article>`,
  styleUrl: './markdown-renderer.component.css',
})
export class MarkdownRendererComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly markdown = input.required<string>();

  readonly html = computed(() => {
    const normalizedMarkdown = normalizeMarkdownLinks(this.markdown());
    const rawHtml = marked.parse(normalizedMarkdown) as string;
    return this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) ?? '';
  });
}

function normalizeMarkdownLinks(markdown: string): string {
  let normalized = markdown;

  for (const [source, target] of Object.entries(LOCAL_DOC_LINKS)) {
    normalized = normalized.replaceAll(`](${source})`, `](${target})`);
  }

  return normalized;
}
