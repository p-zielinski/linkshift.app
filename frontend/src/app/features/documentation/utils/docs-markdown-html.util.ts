import GithubSlugger from 'github-slugger';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import {
  buildDocRouteLookup,
  normalizeDocsMarkdownLinks,
} from './docs-markdown-links.util';
import { stripHiddenOnPurposeMarkdown } from './docs-markdown-strip.util';
import { DOCUMENTATION_MARKDOWN_PAGES } from '../generated/documentation.generated';

marked.setOptions({
  gfm: true,
  breaks: false,
});
marked.use(gfmHeadingId());

const DOC_ROUTE_LOOKUP = buildDocRouteLookup(DOCUMENTATION_MARKDOWN_PAGES);

const HEADING_WITHOUT_ID_PATTERN = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi;

const CUSTOM_DIRECTIVE_BLOCK_RE =
  /^:::(warning|success|error|info|ai-hidden|ai-only)\s*\n([\s\S]*?)^:::\s*$/gm;

const INFOBOX_TYPES = new Set(['warning', 'success', 'error', 'info']);
const AI_HIDDEN_TYPES = new Set(['ai-hidden', 'ai-only']);

export function buildDocsMarkdownHtml(
  markdown: string,
  sourcePath?: string,
): string {
  const publicMarkdown = stripHiddenOnPurposeMarkdown(markdown);
  const normalizedMarkdown = normalizeDocsMarkdownLinks(
    publicMarkdown,
    DOC_ROUTE_LOOKUP,
    sourcePath,
  );
  const withDirectives = preprocessCustomDirectiveBlocks(normalizedMarkdown);
  const rawHtml = marked.parse(withDirectives) as string;
  const withMermaid = transformMermaidBlocks(rawHtml);
  return injectHeadingIdsInHtml(withMermaid);
}

/**
 * Converts author directive blocks (`:::warning`, `:::ai-hidden`, etc.) to HTML
 * before the main markdown pass so inner content still parses as markdown.
 */
export function preprocessCustomDirectiveBlocks(markdown: string): string {
  return markdown.replace(
    CUSTOM_DIRECTIVE_BLOCK_RE,
    (match, type: string, body: string) => {
      const innerHtml = marked.parse(body.trim()) as string;

      if (AI_HIDDEN_TYPES.has(type)) {
        return wrapAiHiddenBlock(innerHtml, type);
      }

      if (INFOBOX_TYPES.has(type)) {
        return wrapInfoboxBlock(innerHtml, type);
      }

      return match;
    },
  );
}

function wrapInfoboxBlock(innerHtml: string, type: string): string {
  return `\n\n<aside class="docs-infobox docs-infobox--${type}" role="note">${innerHtml}</aside>\n\n`;
}

function wrapAiHiddenBlock(innerHtml: string, type: string): string {
  return `\n\n<div class="docs-ai-hidden" data-docs-ai-block="${type}" aria-hidden="true">${innerHtml}</div>\n\n`;
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
