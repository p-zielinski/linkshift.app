import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthStore } from '../../core/store/auth.store';
import { OrganizationConfiguration } from '@shared/models/organization-config.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    PageHeaderComponent
  ],
  template: `
    <app-page-header
      title="Dashboard"
      subtitle="Operational overview for the active organization."
    ></app-page-header>

    <div class="dashboard-grid">
      <mat-card class="card">
        <h3>Session details</h3>
        <div class="divider"></div>
        @if (user(); as user) {
          <mat-list>
            <mat-list-item>
              <mat-icon matListItemIcon>person</mat-icon>
              <div matListItemTitle>{{ user.email }}</div>
              <div matListItemLine>Role: {{ user.isOwner ? 'Owner' : 'Member' }}</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>badge</mat-icon>
              <div matListItemTitle>User ID</div>
              <div matListItemLine>{{ user.id }}</div>
            </mat-list-item>
          </mat-list>
        } @else {
          <div class="subtle">No user loaded.</div>
        }
      </mat-card>

      <mat-card class="card">
        <h3>Organization profile</h3>
        <div class="divider"></div>
        @if (organization(); as organization) {
          <mat-list>
            <mat-list-item>
              <mat-icon matListItemIcon>apartment</mat-icon>
              <div matListItemTitle>{{ organization.name }}</div>
              <div matListItemLine>Organization ID: {{ organization.id }}</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>verified_user</mat-icon>
              <div matListItemTitle>Plan</div>
              <div matListItemLine>{{ config().plan }}</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>shield</mat-icon>
              <div matListItemTitle>Status</div>
              <div matListItemLine>{{ config().status }}</div>
            </mat-list-item>
          </mat-list>
        } @else {
          <div class="subtle">No organization loaded.</div>
        }
      </mat-card>
    </div>

    <mat-card class="card">
      <h3>Organization limits</h3>
      <div class="divider"></div>
      <div class="limits-grid">
        <div class="limit-item">
          <div class="limit-value">{{ config().maxDomainGroups }}</div>
          <div class="subtle">Max domain groups</div>
        </div>
        <div class="limit-item">
          <div class="limit-value">{{ config().maxDomainsPerGroup }}</div>
          <div class="subtle">Domains per group</div>
        </div>
        <div class="limit-item">
          <div class="limit-value">{{ config().maxTotalDomains }}</div>
          <div class="subtle">Total domains</div>
        </div>
        <div class="limit-item">
          <div class="limit-value">{{ config().maxRulesPerGroup }}</div>
          <div class="subtle">Rules per group</div>
        </div>
        <div class="limit-item">
          <div class="limit-value">{{ config().maxTotalRules }}</div>
          <div class="subtle">Total rules</div>
        </div>
        <div class="limit-item">
          <div class="limit-value">{{ config().redirectionLimitPerMinute }}</div>
          <div class="subtle">Redirections per minute</div>
        </div>
      </div>
    </mat-card>
  `,
  styles: [
    `
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }

      .limits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }

      .limit-item {
        border-radius: 16px;
        padding: 16px;
        background: rgba(216, 76, 119, 0.08);
      }

      .limit-value {
        font-size: 22px;
        font-weight: 600;
      }
    `
  ]
})
export class DashboardPageComponent {
  private readonly authStore = inject(AuthStore);

  readonly user = computed(() => this.authStore.user());
  readonly organization = computed(() => this.authStore.organization());
  readonly config = computed(() => {
    const org = this.authStore.organization();
    const rawConfig = org?.configuration ?? undefined;
    return OrganizationConfiguration.fromJson(rawConfig);
  });
}
