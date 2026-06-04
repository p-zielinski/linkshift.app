import { DocumentationMarkdownPage } from '../generated/documentation.generated';

export type DocumentationSidebarNavGroup = {
  id: string;
  label: string;
  pages: DocumentationMarkdownPage[];
};

const START_GUIDE_SLUGS = new Set(['getting-started', 'account-and-access', 'faq']);

const ROUTING_API_GUIDE_SLUGS = new Set([
  'domains-and-groups',
  'redirect-rules',
  'link-maps',
]);

const PUBLIC_TOOLS_GUIDE_SLUGS = new Set(['public-tools-api', 'linkshift-mcp']);

const REDIRECT_ENGINE_GUIDE_SLUGS = new Set([
  'redirect-rules-core',
  'redirect-rules-link-maps',
  'redirect-rules-operations',
  'redirect-rules-recipes',
  'link-map-entries',
  'redirect-tests',
]);

const API_REFERENCE_META_SLUGS = new Set(['reference']);

/** Manifest pages reachable by route but not listed in the accordion sidebar. */
const SIDEBAR_EXCLUDED_SLUGS = new Set(['overview', 'overview-faq', 'what-is-linkshift']);

function isDashboardGuide(slug: string): boolean {
  return slug === 'dashboard-overview' || slug.endsWith('-in-dashboard');
}

function sortByManifestOrder(pages: DocumentationMarkdownPage[]): DocumentationMarkdownPage[] {
  return [...pages].sort((left, right) => left.order - right.order);
}

function takeGuides(
  guides: DocumentationMarkdownPage[],
  assigned: Set<string>,
  predicate: (slug: string) => boolean,
): DocumentationMarkdownPage[] {
  return sortByManifestOrder(
    guides.filter(
      (page) =>
        predicate(page.slug) &&
        !assigned.has(page.slug) &&
        !SIDEBAR_EXCLUDED_SLUGS.has(page.slug),
    ),
  ).map((page) => {
    assigned.add(page.slug);
    return page;
  });
}

function takeMeta(
  metaPages: DocumentationMarkdownPage[],
  assigned: Set<string>,
  slugs: Set<string>,
): DocumentationMarkdownPage[] {
  return sortByManifestOrder(
    metaPages.filter(
      (page) =>
        slugs.has(page.slug) &&
        !assigned.has(page.slug) &&
        !SIDEBAR_EXCLUDED_SLUGS.has(page.slug),
    ),
  ).map((page) => {
    assigned.add(page.slug);
    return page;
  });
}

/** Builds thematic sidebar sections from manifest-backed documentation pages. */
export function buildDocumentationSidebarNavGroups(
  pages: readonly DocumentationMarkdownPage[],
): DocumentationSidebarNavGroup[] {
  const guides = pages.filter((page) => page.category === 'guide');
  const metaPages = pages.filter((page) => page.category === 'meta');
  const concepts = sortByManifestOrder(pages.filter((page) => page.category === 'concept'));
  const assigned = new Set<string>();

  const startPages = takeGuides(guides, assigned, (slug) => START_GUIDE_SLUGS.has(slug));

  const dashboardPages = takeGuides(guides, assigned, isDashboardGuide);

  const routingApiPages = takeGuides(guides, assigned, (slug) =>
    ROUTING_API_GUIDE_SLUGS.has(slug),
  );

  const publicToolsPages = takeGuides(guides, assigned, (slug) =>
    PUBLIC_TOOLS_GUIDE_SLUGS.has(slug),
  );

  const redirectEnginePages = takeGuides(guides, assigned, (slug) =>
    REDIRECT_ENGINE_GUIDE_SLUGS.has(slug),
  );

  const apiReferencePages = takeMeta(metaPages, assigned, API_REFERENCE_META_SLUGS);

  const groups: DocumentationSidebarNavGroup[] = [
    { id: 'start', label: 'Start', pages: startPages },
    { id: 'dashboard', label: 'Dashboard', pages: dashboardPages },
    { id: 'routing-api', label: 'Routing & Management API', pages: routingApiPages },
    { id: 'public-tools', label: 'Public tools', pages: publicToolsPages },
    { id: 'redirect-engine', label: 'Redirect engine', pages: redirectEnginePages },
    { id: 'concepts', label: 'Concepts', pages: concepts },
    {
      id: 'api-reference',
      label: 'API reference',
      pages: apiReferencePages,
    },
  ];

  const unassignedGuides = sortByManifestOrder(
    guides.filter((page) => !assigned.has(page.slug)),
  );
  if (unassignedGuides.length > 0) {
    groups.splice(groups.length - 1, 0, {
      id: 'more-guides',
      label: 'More guides',
      pages: unassignedGuides,
    });
  }

  return groups.filter((group) => group.pages.length > 0);
}
