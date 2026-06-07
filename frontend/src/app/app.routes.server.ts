import { RenderMode, ServerRoute } from '@angular/ssr';
import {
  DOCUMENTATION_MARKDOWN_PAGES,
  OPENAPI_ENDPOINTS_SNAPSHOT,
} from './features/documentation/generated/documentation.generated';

function markdownPrerenderParams(category: 'intro' | 'guide' | 'concept') {
  return DOCUMENTATION_MARKDOWN_PAGES.filter((page) => page.category === category).map(
    (page) => ({ slug: page.slug }),
  );
}

export const serverRoutes: ServerRoute[] = [
  { path: 'docs', renderMode: RenderMode.Prerender },
  { path: 'docs/reference', renderMode: RenderMode.Prerender },
  { path: 'docs/overview-faq', renderMode: RenderMode.Prerender },
  {
    path: 'docs/intro/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => markdownPrerenderParams('intro'),
  },
  {
    path: 'docs/guides/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => markdownPrerenderParams('guide'),
  },
  {
    path: 'docs/concepts/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => markdownPrerenderParams('concept'),
  },
  {
    path: 'docs/api/:operationId',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      OPENAPI_ENDPOINTS_SNAPSHOT.map((endpoint) => ({ operationId: endpoint.id })),
  },
  { path: 'overview', renderMode: RenderMode.Client },
  { path: 'home', renderMode: RenderMode.Client },
  { path: 'links', renderMode: RenderMode.Client },
  { path: 'settings', renderMode: RenderMode.Client },
  { path: 'dashboard', renderMode: RenderMode.Client },
  { path: 'tools', renderMode: RenderMode.Client },
  { path: 'tools/:tool', renderMode: RenderMode.Client },
  { path: 'legal/consent', renderMode: RenderMode.Client },
  { path: 'profile', renderMode: RenderMode.Client },
  { path: 'organization', renderMode: RenderMode.Client },
  { path: 'organization/api-keys', renderMode: RenderMode.Client },
  { path: 'domains', renderMode: RenderMode.Client },
  { path: 'subdomains', renderMode: RenderMode.Client },
  { path: 'domain-groups', renderMode: RenderMode.Client },
  { path: 'redirect-rules', renderMode: RenderMode.Client },
  { path: 'analytics', renderMode: RenderMode.Client },
  { path: 'redirect-rules-analytics', renderMode: RenderMode.Client },
  { path: 'tests', renderMode: RenderMode.Client },
  { path: 'link-maps', renderMode: RenderMode.Client },
  { path: 'link-maps/:id', renderMode: RenderMode.Client },
  { path: 'verify-email', renderMode: RenderMode.Client },
  { path: 'reset-password', renderMode: RenderMode.Client },
  { path: 'invite', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
