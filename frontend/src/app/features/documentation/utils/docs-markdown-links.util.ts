export type DocPageRouteEntry = {
  sourcePath: string;
  route: string;
};

export function buildDocRouteLookup(
  pages: DocPageRouteEntry[],
): ReadonlyMap<string, string> {
  const lookup = new Map<string, string>();

  for (const { sourcePath, route } of pages) {
    const pagesRelative = sourcePath.replace(/^shared\/docs\/pages\//, '');
    const keys = [
      pagesRelative,
      `pages/${pagesRelative}`,
      sourcePath.replace(/^shared\/docs\//, ''),
      sourcePath,
      pagesRelative.split('/').pop() ?? pagesRelative,
    ];

    for (const key of keys) {
      if (key) {
        lookup.set(key, route);
      }
    }
  }

  return lookup;
}

export function normalizeDocsMarkdownLinks(
  markdown: string,
  lookup: ReadonlyMap<string, string>,
  currentSourcePath?: string,
): string {
  return markdown.replace(/\]\(([^)]+)\)/g, (match, href: string) => {
    const resolved = resolveDocsMarkdownHref(href, lookup, currentSourcePath);
    return resolved === null ? match : `](${resolved})`;
  });
}

function resolveDocsMarkdownHref(
  href: string,
  lookup: ReadonlyMap<string, string>,
  currentSourcePath?: string,
): string | null {
  const trimmed = href.trim();

  if (
    !trimmed ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('/docs')
  ) {
    return null;
  }

  const hashIndex = trimmed.indexOf('#');
  const pathPart = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : trimmed.slice(hashIndex);

  if (!pathPart.endsWith('.md')) {
    return null;
  }

  const mdPath = resolveMarkdownPath(pathPart, currentSourcePath);
  const route = lookup.get(mdPath);

  if (!route) {
    return null;
  }

  return `${route}${hash}`;
}

function resolveMarkdownPath(hrefPath: string, currentSourcePath?: string): string {
  if (!hrefPath.startsWith('./') && !hrefPath.startsWith('../')) {
    if (hrefPath.startsWith('pages/')) {
      return hrefPath.replace(/^pages\//, '');
    }
    return hrefPath;
  }

  if (!currentSourcePath) {
    return hrefPath.replace(/^\.\//, '');
  }

  const baseDir = currentSourcePath
    .replace(/^shared\/docs\/pages\//, '')
    .split('/')
    .slice(0, -1)
    .join('/');

  const segments = [...(baseDir ? baseDir.split('/') : []), ...hrefPath.split('/')];
  const resolved: string[] = [];

  for (const segment of segments) {
    if (segment === '' || segment === '.') {
      continue;
    }
    if (segment === '..') {
      resolved.pop();
      continue;
    }
    resolved.push(segment);
  }

  return resolved.join('/');
}
