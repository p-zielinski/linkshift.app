/**
 * Decides whether to assign `innerHTML` for docs markdown.
 * - Skips when already painted with the same HTML (routing no-op).
 * - Skips when prerendered DOM already matches (hydration without flash).
 * - Rewrites when route/content changed and DOM still shows previous page.
 */
export function shouldRewriteDocsMarkdownDom(
  nextHtml: string,
  lastPaintedHtml: string,
  currentInnerHtml: string,
): boolean {
  if (!nextHtml || nextHtml === lastPaintedHtml) {
    return false;
  }

  return currentInnerHtml !== nextHtml;
}
