import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../store/auth.store';
import { DomainStore } from '../store/domain.store';
import { DomainGroupStore } from '../store/domain-group.store';

type NavItem = {
  label: string;
  route: string;
  icon: string;
  requiresDomainGroups?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Domain Groups', route: '/domain-groups', icon: 'layers' },
  { label: 'Domains', route: '/domains', icon: 'public', requiresDomainGroups: true },
  {
    label: 'Redirect Rules',
    route: '/redirect-rules',
    icon: 'swap_horiz',
    requiresDomainGroups: true
  }
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
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './app-shell.component.html'
})
export class AppShellComponent {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly domainStore = inject(DomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly navItems = NAV_ITEMS;
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly hasDomainGroups = computed(() => this.domainGroups().length > 0);

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

  isDisabled(item: NavItem): boolean {
    return !!item.requiresDomainGroups && !this.hasDomainGroups();
  }

  onNavClick(event: Event, item: NavItem): void {
    if (!this.isDisabled(item)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }
}
