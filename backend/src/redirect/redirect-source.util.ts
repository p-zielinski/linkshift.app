/**
 * Detects whether a stored redirect rule `source` uses the `/pattern/flags` regex form.
 * Plain paths (including multi-segment paths like `/v2/go`) return null.
 */
export function parseStoredRegexSource(source: string): RegExp | null {
  if (!source.startsWith('/')) {
    return null;
  }

  const lastSlashIndex = source.lastIndexOf('/');
  if (lastSlashIndex <= 0) {
    return null;
  }

  const pattern = source.substring(1, lastSlashIndex);
  const flags = source.substring(lastSlashIndex + 1);
  if (!/^[dgimsuvy]*$/.test(flags)) {
    return null;
  }

  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

export function isStoredRegexSource(source: string): boolean {
  return parseStoredRegexSource(source) !== null;
}
