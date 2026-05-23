import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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

export type DashboardOnboardingDialogResult = {
  confirmed: boolean;
};

@Component({
  selector: 'app-dashboard-onboarding-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective,
  ],
  templateUrl: './dashboard-onboarding-dialog.component.html',
})
export class DashboardOnboardingDialogComponent {
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
  readonly subdomainPreview = computed(() => this.subdomains().slice(0, 4));
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
  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'welcome',
      label: 'Welcome',
      title: 'You are ready to ship redirects',
      description: 'A quick intro to the core flow. It takes around one minute.',
      complete: true,
    },
    {
      id: 'domains',
      label: 'Domains',
      title: 'Domain groups and hosts',
      description:
        'Domain groups are containers. Inside them you attach custom domains or use starter subdomains.',
      complete: true,
    },
    {
      id: 'rules',
      label: 'Rules',
      title: 'Redirect hierarchy',
      description:
        'Create redirect rules to route traffic. Link maps (shortlinks) run inside a selected rule path.',
      complete: true,
    },
    {
      id: 'next',
      label: 'Next steps',
      title: 'What to do now',
      description: 'Use the sidebar to refine domains, then add your first redirect rule.',
      complete: true,
    },
  ]);

  constructor() {
    this.domainGroupStore.searchList();
    this.subdomainStore.searchList();
  }

  formatSubdomainHost(name: string): string {
    return `${name}.${this.subdomainBaseHost()}`;
  }

  onConfirm(): void {
    this.dialogRef.close({ confirmed: true });
  }

  onSkip(): void {
    this.dialogRef.close({ confirmed: false });
  }
}
