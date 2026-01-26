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
  templateUrl: './dashboard-page.component.html'
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
