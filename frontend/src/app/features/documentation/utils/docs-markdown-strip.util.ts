/**
 * Removes author-only markdown that must not appear in the docs UI or assistant context.
 */

/** Fenced blocks: `:::hidden-on-purpose` with optional trailing comment on the opening line. */
const HIDDEN_ON_PURPOSE_FENCE_RE =
  /^:::hidden-on-purpose(?:\s+[^\n]*)?\s*\n[\s\S]*?^:::\s*$/gm;

/**
 * HTML comment regions:
 * `<!-- ::hidden-on-purpose optional note -->` … `<!-- ::hidden-on-purpose:end -->`
 */
const HIDDEN_ON_PURPOSE_HTML_REGION_RE =
  /<!--\s*::hidden-on-purpose(?:\s+[^-]*)?\s*-->[\s\S]*?<!--\s*::hidden-on-purpose:end\s*-->/gi;

/** Standalone marker comments (no body), e.g. `<!-- ::hidden-on-purpose: note -->`. */
const HIDDEN_ON_PURPOSE_HTML_MARKER_RE =
  /<!--\s*::hidden-on-purpose(?::\s*[^-]*)?\s*-->/gi;

export function stripHiddenOnPurposeMarkdown(markdown: string): string {
  return markdown
    .replace(HIDDEN_ON_PURPOSE_FENCE_RE, '')
    .replace(HIDDEN_ON_PURPOSE_HTML_REGION_RE, '')
    .replace(HIDDEN_ON_PURPOSE_HTML_MARKER_RE, '');
}
