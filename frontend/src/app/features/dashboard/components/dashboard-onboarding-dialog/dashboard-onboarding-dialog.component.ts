import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../../core/store/auth.store';
import { APP_CONFIG } from '../../../../core/config/app-runtime-config';
import { DomainGroupStore } from '../../../../core/store/domain-group.store';
import { LinkMapStore } from '../../../../core/store/link-map.store';
import { RedirectRuleStore } from '../../../../core/store/redirect-rule.store';
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

const STARTER_LINK_MAP_NAME = 'First link map';
const STARTER_RULE_SOURCE = '/short';

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
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly appConfig = inject(APP_CONFIG);

  readonly organization = computed(() => this.authStore.organization());
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly subdomains = this.subdomainStore.selectList();
  readonly linkMaps = this.linkMapStore.selectList();
  readonly redirectRules = this.redirectRuleStore.selectList();
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
        shortUrlPattern: `${subdomain.name}.${this.subdomainBaseHost()}/short/{key}`,
      })),
  );
  readonly starterLinkMap = computed(
    () =>
      this.linkMaps().find((linkMap) => linkMap.name === STARTER_LINK_MAP_NAME) ??
      this.linkMaps()[0] ??
      null,
  );
  readonly starterRedirectRule = computed(
    () =>
      this.redirectRules().find((rule) => rule.source === STARTER_RULE_SOURCE) ??
      this.redirectRules()[0] ??
      null,
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
          title: 'Your workspace is ready',
          description:
            'Your site, starter subdomain, and /short prefix are set up. Create your first short link when you are ready.',
        },
        {
          id: 'next',
          label: 'Next steps',
          title: 'What to do now',
          description:
            'Create your first short link, then share it and track clicks in Analytics.',
        },
      ];
    }

    return [
      {
        id: 'welcome',
        label: 'Welcome',
        title: 'Your workspace is ready',
        description:
          'Your domain group, starter subdomain, link map, and /short prefix rule are already in place.',
      },
      {
        id: 'next',
        label: 'Next steps',
        title: 'What to do now',
        description:
          'Review the starter routing, add links to your link map, and run a redirect test.',
      },
    ];
  });

  constructor() {
    this.domainGroupStore.searchList();
    this.subdomainStore.searchList();
    this.linkMapStore.searchList();
    this.redirectRuleStore.searchList();
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

  onReviewStarterRouting(): void {
    this.dialogRef.close({ confirmed: true, navigateTo: '/redirect-rules' });
  }
}
