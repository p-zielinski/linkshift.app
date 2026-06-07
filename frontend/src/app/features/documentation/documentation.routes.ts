import { Routes } from '@angular/router';
import { publicSessionRestoreCanMatch } from '../../core/auth/public-session-restore.guard';
import { DocumentationSiteShellComponent } from './pages/documentation-site-shell.component';
import { DocumentationShellComponent } from './pages/documentation-shell.component';
import { DocumentationOverviewPageComponent } from './pages/documentation-overview-page.component';
import { DocumentationMarkdownPageComponent } from './pages/documentation-markdown-page.component';
import { DocumentationReferencePageComponent } from './pages/documentation-reference-page.component';
import { DocumentationEndpointPageComponent } from './pages/documentation-endpoint-page.component';
export const DOCUMENTATION_CHILD_ROUTES: Routes = [
  {
    path: 'docs',
    component: DocumentationSiteShellComponent,
    canMatch: [publicSessionRestoreCanMatch],
    children: [
      {
        path: '',
        component: DocumentationShellComponent,
        children: [
          { path: '', pathMatch: 'full', component: DocumentationOverviewPageComponent },
          { path: 'reference', component: DocumentationReferencePageComponent },
          {
            path: 'overview-faq',
            component: DocumentationMarkdownPageComponent,
            data: { documentationSlug: 'overview-faq' },
          },
          { path: 'assistant', redirectTo: '', pathMatch: 'full' },
          {
            path: 'intro/what-is-linkshift',
            redirectTo: '',
            pathMatch: 'full',
          },
          { path: 'intro/:slug', component: DocumentationMarkdownPageComponent },
          { path: 'guides/:slug', component: DocumentationMarkdownPageComponent },
          { path: 'concepts/:slug', component: DocumentationMarkdownPageComponent },
          { path: 'api/:operationId', component: DocumentationEndpointPageComponent },
          { path: '**', redirectTo: '' },
        ],
      },
    ],
  },
];
