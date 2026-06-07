import { DocumentationContentService } from '../services/documentation-content.service';

const DASHBOARD_PAGE_CONTEXT_BY_PATH: Readonly<Record<string, string>> = {
  '/dashboard': 'Dashboard',
  '/overview': 'Overview',
  '/home': 'Overview',
  '/links': 'Links',
  '/settings': 'Settings',
  '/analytics': 'Analytics',
  '/redirect-rules-analytics': 'Analytics',
  '/profile': 'Profile',
  '/organization': 'Organization',
  '/organization/api-keys': 'Organization API keys',
  '/domain-groups': 'Domain groups',
  '/domains': 'Domains',
  '/subdomains': 'Subdomains',
  '/redirect-rules': 'Redirect rules',
  '/link-maps': 'Link maps',
  '/tests': 'Tests',
  '/tools': 'Tools',
  '/tools/qr-code-generator': 'QR code generator',
  '/tools/redirect-tester': 'Redirect tester',
  '/legal/consent': 'Legal consent',
};

function parseDashboardPath(pathOrUrl: string): { path: string; query: URLSearchParams } {
  const [pathPart, queryPart] = pathOrUrl.split('?');
  const path = pathPart ?? pathOrUrl;
  return { path, query: new URLSearchParams(queryPart ?? '') };
}

function resolveLinksAssistantContext(query: URLSearchParams): string {
  if (query.get('openConnectDomain') === '1') {
    return 'Links — connect domain';
  }
  if (query.get('openCreate') === '1') {
    return 'Links — create link';
  }
  return 'Links';
}

/** Human-readable context for authenticated app-shell routes (dashboard, org, domains, …). */
export function resolveDashboardAssistantPageContext(pathOrUrl: string): string | null {
  const { path: normalized, query } = parseDashboardPath(pathOrUrl);

  if (normalized === '/links') {
    return resolveLinksAssistantContext(query);
  }

  const exact = DASHBOARD_PAGE_CONTEXT_BY_PATH[normalized];
  if (exact) {
    return exact;
  }

  if (/^\/link-maps\/[^/]+$/.test(normalized)) {
    return 'Link map detail';
  }

  return null;
}

export function resolveDocsAssistantPageContext(
  path: string,
  docsContent: DocumentationContentService,
): string | null {
  const normalized = path.split('?')[0] ?? path;

  if (normalized.startsWith('/docs/guides/')) {
    const slug = normalized.replace('/docs/guides/', '');
    const page = docsContent.guidePages.find((entry) => entry.slug === slug);
    return page ? `Guide: ${page.title}` : null;
  }

  if (normalized.startsWith('/docs/concepts/')) {
    const slug = normalized.replace('/docs/concepts/', '');
    const page = docsContent.conceptPages.find((entry) => entry.slug === slug);
    return page ? `Concept: ${page.title}` : null;
  }

  if (normalized.startsWith('/docs/intro/')) {
    const slug = normalized.replace('/docs/intro/', '');
    const page = docsContent.introPages.find((entry) => entry.slug === slug);
    return page ? page.title : null;
  }

  if (normalized.startsWith('/docs/api/')) {
    return 'API endpoint';
  }

  if (normalized === '/docs/reference') {
    return 'API reference';
  }

  if (normalized === '/docs') {
    return null;
  }

  return null;
}
