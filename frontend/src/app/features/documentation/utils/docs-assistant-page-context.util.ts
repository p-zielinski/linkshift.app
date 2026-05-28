import { DocumentationContentService } from '../services/documentation-content.service';

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

  if (normalized === '/docs' || normalized === '/docs/assistant') {
    return null;
  }

  return null;
}
