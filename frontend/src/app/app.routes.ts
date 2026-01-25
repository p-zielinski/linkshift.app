import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './core/layout/app-shell.component';
import { AuthPageComponent } from './features/auth/auth-page.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { DomainsPageComponent } from './features/domains/domains-page.component';
import { DomainGroupsPageComponent } from './features/domain-groups/domain-groups-page.component';
import { RedirectRulesPageComponent } from './features/redirect-rules/redirect-rules-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'auth', component: AuthPageComponent, canMatch: [guestGuard] },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'domains', component: DomainsPageComponent },
      { path: 'domain-groups', component: DomainGroupsPageComponent },
      { path: 'redirect-rules', component: RedirectRulesPageComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
