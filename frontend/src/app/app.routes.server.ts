import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'dashboard', renderMode: RenderMode.Client },
  { path: 'legal/consent', renderMode: RenderMode.Client },
  { path: 'profile', renderMode: RenderMode.Client },
  { path: 'organization', renderMode: RenderMode.Client },
  { path: 'domains', renderMode: RenderMode.Client },
  { path: 'domain-groups', renderMode: RenderMode.Client },
  { path: 'redirect-rules', renderMode: RenderMode.Client },
  { path: 'tests', renderMode: RenderMode.Client },
  { path: 'verify-email', renderMode: RenderMode.Client },
  { path: 'reset-password', renderMode: RenderMode.Client },
  { path: 'invite', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
