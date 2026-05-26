/**
 * Returns the first language range from an Accept-Language header value.
 * Uses list order (not q-value ranking): e.g. `pl-PL,en;q=0.9` → `pl-PL`.
 */
export function parsePrimaryAcceptLanguageTag(
  header: string | undefined,
): string {
  if (!header) {
    return '';
  }

  const trimmed = header.trim();
  if (!trimmed) {
    return '';
  }

  const firstRange = trimmed.split(',')[0]?.trim() ?? '';
  if (!firstRange) {
    return '';
  }

  const semicolonIndex = firstRange.indexOf(';');
  const tag =
    semicolonIndex === -1
      ? firstRange
      : firstRange.slice(0, semicolonIndex);

  return tag.trim();
}
