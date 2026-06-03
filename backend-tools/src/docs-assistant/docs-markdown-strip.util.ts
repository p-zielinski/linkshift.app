/**
 * Mirrors frontend `docs-markdown-strip.util.ts` — keep in sync when changing strip rules.
 */

const HIDDEN_ON_PURPOSE_FENCE_RE =
  /^:::hidden-on-purpose(?:\s+[^\n]*)?\s*\n[\s\S]*?^:::\s*$/gm;

const HIDDEN_ON_PURPOSE_FENCE_WITH_PARAGRAPH_BREAK_RE =
  /\n\n:::hidden-on-purpose(?:\s+[^\n]*)?\s*\n[\s\S]*?^:::\s*$\n\n/gm;

const HIDDEN_ON_PURPOSE_HTML_REGION_RE =
  /<!--\s*::hidden-on-purpose(?:\s+[^-]*)?\s*-->[\s\S]*?<!--\s*::hidden-on-purpose:end\s*-->/gi;

const HIDDEN_ON_PURPOSE_HTML_REGION_WITH_LINE_BREAK_RE =
  /\n<!--\s*::hidden-on-purpose(?:\s+[^-]*)?\s*-->[\s\S]*?<!--\s*::hidden-on-purpose:end\s*-->\n/gi;

const HIDDEN_ON_PURPOSE_HTML_MARKER_RE =
  /<!--\s*::hidden-on-purpose(?::\s*[^-]*)?\s*-->/gi;

export function stripHiddenOnPurposeMarkdown(markdown: string): string {
  return markdown
    .replace(HIDDEN_ON_PURPOSE_FENCE_WITH_PARAGRAPH_BREAK_RE, '\n\n')
    .replace(HIDDEN_ON_PURPOSE_FENCE_RE, '')
    .replace(HIDDEN_ON_PURPOSE_HTML_REGION_WITH_LINE_BREAK_RE, '\n')
    .replace(HIDDEN_ON_PURPOSE_HTML_REGION_RE, '')
    .replace(HIDDEN_ON_PURPOSE_HTML_MARKER_RE, '');
}
