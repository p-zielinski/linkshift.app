import GithubSlugger from 'github-slugger';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import {
  buildDocRouteLookup,
  normalizeDocsMarkdownLinks,
} from './docs-markdown-links.util';
import { DOCUMENTATION_MARKDOWN_PAGES } from '../generated/documentation.generated';

marked.setOptions({
  gfm: true,
  breaks: false,
});
marked.use(gfmHeadingId());

const DOC_ROUTE_LOOKUP = buildDocRouteLookup(DOCUMENTATION_MARKDOWN_PAGES);

const HEADING_WITHOUT_ID_PATTERN = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi;

export function buildDocsMarkdownHtml(
  markdown: string,
  sourcePath?: string,
): string {
  const normalizedMarkdown = normalizeDocsMarkdownLinks(
    markdown,
    DOC_ROUTE_LOOKUP,
    sourcePath,
  );
  const rawHtml = marked.parse(normalizedMarkdown) as string;
  const withMermaid = transformMermaidBlocks(rawHtml);
  return injectHeadingIdsInHtml(withMermaid);
}

/**
 * Angular [innerHTML] sanitization strips `id` on headings. Inject ids in the HTML string
 * before assigning via native innerHTML.
 */
export function injectHeadingIdsInHtml(html: string): string {
  const slugger = new GithubSlugger();

  return html.replace(HEADING_WITHOUT_ID_PATTERN, (match, level, attrs, inner) => {
    if (/\bid\s*=/.test(attrs)) {
      const existingText = stripHtmlTags(inner).trim();
      if (existingText) {
        slugger.slug(existingText);
      }
      return match;
    }

    const plainText = stripHtmlTags(inner).trim();
    if (!plainText) {
      return match;
    }

    const id = slugger.slug(plainText);
    const attrsPart = attrs?.trim() ? ` ${attrs.trim()}` : '';
    return `<h${level}${attrsPart} id="${id}">${inner}</h${level}>`;
  });
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]+>/g, '');
}

function transformMermaidBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gi,
    (_, chart: string) => `<div class="mermaid">${decodeHtmlEntities(chart)}</div>`,
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}
