import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { AuthStore } from '../store/auth.store';
import { DomainStore } from '../store/domain.store';
import { DomainGroupStore } from '../store/domain-group.store';

const NAV_ITEMS = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Domains', route: '/domains', icon: 'public' },
  { label: 'Domain Groups', route: '/domain-groups', icon: 'layers' },
  { label: 'Redirect Rules', route: '/redirect-rules', icon: 'swap_horiz' }
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './app-shell.component.html'
})
export class AppShellComponent {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly domainStore = inject(DomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly navItems = NAV_ITEMS;

  constructor() {
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.domainStore.searchList();
        this.domainGroupStore.searchList();
      }
    });
  }

  onLogout(): void {
    this.authStore.logout();
    this.router.navigateByUrl('/auth');
  }
}
