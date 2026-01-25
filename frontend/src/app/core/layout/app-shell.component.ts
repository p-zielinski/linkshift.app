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
  template: `
    <mat-sidenav-container class="app-shell">
      <mat-sidenav mode="side" opened>
        <div class="sidebar">
          <div class="sidebar-header">
            <div class="brand">Redirect Control</div>
            <div class="subtle">Environment-ready routing</div>
          </div>

          <mat-nav-list>
            @for (item of navItems; track item.route) {
              <a
                mat-list-item
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                <span>{{ item.label }}</span>
              </a>
            }
          </mat-nav-list>

          <div class="sidebar-footer" *ngIf="authStore.user() as user">
            <div class="chip-muted">
              <mat-icon>account_circle</mat-icon>
              <span>{{ user.email }}</span>
            </div>
            <button mat-stroked-button color="primary" (click)="onLogout()">
              Log out
            </button>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="app-content">
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidebar {
        width: 280px;
        padding: 24px 16px;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: linear-gradient(160deg, #fff2f6 0%, #f9f1f4 60%, #f4eef2 100%);
      }

      .sidebar-header {
        margin-bottom: 24px;
      }

      .brand {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.6px;
      }

      .nav-icon {
        margin-right: 12px;
      }

      a.active {
        border-radius: 12px;
        background: rgba(216, 76, 119, 0.14);
      }

      .sidebar-footer {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    `
  ]
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
