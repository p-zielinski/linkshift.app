import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../../core/store/auth.store';
import { APP_CONFIG } from '../../../../core/config/app-runtime-config';
import { DomainGroupStore } from '../../../../core/store/domain-group.store';
import { SubdomainStore } from '../../../../core/store/subdomain.store';
import { WizardComponent, type WizardStep } from '../../../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../../../shared/components/wizard/wizard-step.directive';

export type DashboardOnboardingDialogData = {
  campaignMode?: boolean;
};

export type DashboardOnboardingDialogResult = {
  confirmed: boolean;
  openCreate?: boolean;
  navigateTo?: string;
};

@Component({
  selector: 'app-dashboard-onboarding-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective,
  ],
  templateUrl: './dashboard-onboarding-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOnboardingDialogComponent {
  private readonly dialogData = inject<DashboardOnboardingDialogData>(MAT_DIALOG_DATA, {
    optional: true,
  });
  readonly campaignMode = signal(this.dialogData?.campaignMode ?? false);

  private readonly dialogRef = inject(
    MatDialogRef<DashboardOnboardingDialogComponent, DashboardOnboardingDialogResult>,
  );
  private readonly authStore = inject(AuthStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly appConfig = inject(APP_CONFIG);

  readonly organization = computed(() => this.authStore.organization());
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly subdomains = this.subdomainStore.selectList();
  readonly subdomainBaseHost = computed(() => {
    const configured = this.appConfig.APP_SUBDOMAIN_BASE_URL || this.appConfig.APP_BASE_URL;
    return configured.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  });
  readonly domainGroupPreview = computed(() => this.domainGroups().slice(0, 4));
  readonly subdomainPreview = computed(() =>
    this.subdomains()
      .slice(0, 4)
      .map((subdomain) => ({
        id: subdomain.id,
        name: subdomain.name,
        displayHost: `${subdomain.name}.${this.subdomainBaseHost()}`,
      })),
  );
  readonly domainGroupOverflow = computed(
    () => Math.max(0, this.domainGroups().length - this.domainGroupPreview().length),
  );
  readonly subdomainOverflow = computed(
    () => Math.max(0, this.subdomains().length - this.subdomainPreview().length),
  );
  readonly title = computed(() => {
    const organizationName = this.organization()?.name ?? 'your organization';
    return `Welcome to LinkShift, ${organizationName}`;
  });
  readonly steps = computed<WizardStep[]>(() => {
    if (this.campaignMode()) {
      return [
        {
          id: 'welcome',
          label: 'Welcome',
          title: 'You are ready to create short links',
          description:
            'Connect a custom domain or use a starter subdomain on your site to publish short links.',
        },
        {
          id: 'next',
          label: 'Next steps',
          title: 'What to do now',
          description:
            'Connect a host on your site, then create your first short link from Overview or Links.',
        },
      ];
    }

    return [
      {
        id: 'welcome',
        label: 'Welcome',
        title: 'You are ready to ship redirects',
        description:
          'Domain groups are containers. Inside them you attach custom domains or use starter subdomains.',
      },
      {
        id: 'next',
        label: 'Next steps',
        title: 'What to do now',
        description:
          'Use the sidebar to refine domain groups and hosts, then add your first redirect rule.',
      },
    ];
  });

  constructor() {
    this.domainGroupStore.searchList();
    this.subdomainStore.searchList();
  }

  onConfirm(): void {
    this.dialogRef.close({ confirmed: true });
  }

  onSkip(): void {
    this.dialogRef.close({ confirmed: false });
  }

  onCreateFirstLink(): void {
    this.dialogRef.close({ confirmed: true, openCreate: true });
  }

  onViewDomainGroups(): void {
    this.dialogRef.close({ confirmed: true, navigateTo: '/domain-groups' });
  }
}
