import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'docs', renderMode: RenderMode.Server },
  { path: 'docs/:section', renderMode: RenderMode.Server },
  { path: 'docs/:section/:id', renderMode: RenderMode.Server },
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
