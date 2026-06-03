/**
 * Removes author-only markdown that must not appear in the docs UI or assistant context.
 */

/** Fenced blocks: `:::hidden-on-purpose` with optional trailing comment on the opening line. */
const HIDDEN_ON_PURPOSE_FENCE_RE =
  /^:::hidden-on-purpose(?:\s+[^\n]*)?\s*\n[\s\S]*?^:::\s*$/gm;

/** Fence surrounded by paragraph breaks (typical in shared/docs). */
const HIDDEN_ON_PURPOSE_FENCE_WITH_PARAGRAPH_BREAK_RE =
  /\n\n:::hidden-on-purpose(?:\s+[^\n]*)?\s*\n[\s\S]*?^:::\s*$\n\n/gm;

/**
 * HTML comment regions:
 * `<!-- ::hidden-on-purpose optional note -->` … `<!-- ::hidden-on-purpose:end -->`
 */
const HIDDEN_ON_PURPOSE_HTML_REGION_RE =
  /<!--\s*::hidden-on-purpose(?:\s+[^-]*)?\s*-->[\s\S]*?<!--\s*::hidden-on-purpose:end\s*-->/gi;

/** HTML region on its own lines between two visible lines (no extra blank line). */
const HIDDEN_ON_PURPOSE_HTML_REGION_WITH_LINE_BREAK_RE =
  /\n<!--\s*::hidden-on-purpose(?:\s+[^-]*)?\s*-->[\s\S]*?<!--\s*::hidden-on-purpose:end\s*-->\n/gi;

/** Standalone marker comments (no body), e.g. `<!-- ::hidden-on-purpose: note -->`. */
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
