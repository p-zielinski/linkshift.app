import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../../core/store/auth.store';
import { APP_CONFIG } from '../../../../core/config/app-runtime-config';
import { DomainGroupStore } from '../../../../core/store/domain-group.store';
import { DomainStore } from '../../../../core/store/domain.store';
import { LinkMapStore } from '../../../../core/store/link-map.store';
import { RedirectRuleStore } from '../../../../core/store/redirect-rule.store';
import { SubdomainStore } from '../../../../core/store/subdomain.store';
import {
  buildOnboardingConnectDomainData,
  resolveNeedsSubdomainChoice,
} from '../../../campaign-connect-domain/campaign-connect-domain.util';
import type { CampaignConnectDomainDialogData } from '../../../campaign-connect-domain/campaign-connect-domain-dialog.component';
import {
  prefetchDomainGroupScopedLists,
  selectEntitiesForDomainGroups,
} from '../../../../core/store/prefetch-domain-group-scoped-lists.util';
import { buildRedirectRuleListFilter } from '../../../../core/utils/redirect-rules-list.util';
import { getFilterKey } from '../../../../core/store/entity/entity-store.utils';
import { WizardComponent, type WizardStep } from '../../../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../../../shared/components/wizard/wizard-step.directive';

export type DashboardOnboardingDialogData = {
  campaignMode?: boolean;
  /** Set after the user picked a subdomain during onboarding handoff. */
  subdomainChoiceCompleted?: boolean;
  /** Jump to a step when resuming onboarding (e.g. after connect-domain). */
  initialStepId?: 'welcome' | 'next';
};

export type DashboardOnboardingDialogResult = {
  confirmed: boolean;
  openCreate?: boolean;
  navigateTo?: string;
  openConnectDomain?: boolean;
  connectDomainData?: Partial<CampaignConnectDomainDialogData>;
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
export class DashboardOnboardingDialogComponent implements AfterViewInit {
  @ViewChild(WizardComponent) private wizard?: WizardComponent;

  private readonly dialogData = inject<DashboardOnboardingDialogData>(MAT_DIALOG_DATA, {
    optional: true,
  });
  readonly campaignMode = signal(this.dialogData?.campaignMode ?? false);

  private readonly dialogRef = inject(
    MatDialogRef<DashboardOnboardingDialogComponent, DashboardOnboardingDialogResult>,
  );
  private readonly authStore = inject(AuthStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly domainStore = inject(DomainStore);
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly appConfig = inject(APP_CONFIG);

  readonly organization = computed(() => this.authStore.organization());
  readonly domainGroups = this.domainGroupStore.selectList();
  readonly domains = this.domainStore.selectList();
  readonly subdomains = this.subdomainStore.selectList();
  readonly hasConnectedHosts = computed(
    () => this.subdomains().length > 0 || this.domains().length > 0,
  );
  readonly needsSubdomainChoice = computed(() => {
    if (this.dialogData?.subdomainChoiceCompleted) {
      return false;
    }
    return resolveNeedsSubdomainChoice(this.subdomains(), this.domains());
  });
  readonly linkMaps = computed(() =>
    selectEntitiesForDomainGroups(this.domainGroups(), (domainGroupId) =>
      this.linkMapStore.selectList({ domainGroupId })(),
    ),
  );
  readonly redirectRules = computed(() =>
    selectEntitiesForDomainGroups(this.domainGroups(), (domainGroupId) =>
      this.redirectRuleStore.selectList(buildRedirectRuleListFilter(domainGroupId))(),
    ),
  );
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
  readonly starterRoutingPreview = computed(() => {
    const linkMap = this.starterLinkMap();
    const rule = this.starterRedirectRule();

    if (!linkMap && !rule) {
      return null;
    }

    return {
      linkMapName: linkMap?.name ?? null,
      ruleSource: rule?.source ?? null,
      rulePathMatch: rule?.pathMatch ?? null,
      ruleRoutesTo: linkMap?.name ?? null,
    };
  });
  readonly starterResourcesLoading = computed(() => {
    const groups = this.domainGroups();
    if (groups.length === 0) {
      return false;
    }

    const linkMapLoading = this.linkMapStore.isLoading();
    const redirectRuleLoading = this.redirectRuleStore.isLoading();

    return groups.some((group) => {
      const linkMapFilter = { domainGroupId: group.id };
      const ruleFilter = buildRedirectRuleListFilter(group.id);
      const linkMapKey = getFilterKey(linkMapFilter);
      const ruleKey = getFilterKey(ruleFilter);

      if (linkMapLoading[linkMapKey] || redirectRuleLoading[ruleKey]) {
        return true;
      }

      return (
        this.linkMapStore.selectListResult(linkMapFilter)() === null ||
        this.redirectRuleStore.selectListResult(ruleFilter)() === null
      );
    });
  });
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
    const needsChoice = this.needsSubdomainChoice();
    const hasHosts = this.hasConnectedHosts() && !needsChoice;

    if (this.campaignMode()) {
      return [
        {
          id: 'welcome',
          label: 'Welcome',
          title: hasHosts ? 'Your workspace is ready' : 'Your workspace is ready',
          description: needsChoice
            ? 'Your site, link map, and /short redirect rule are ready. Choose your short-link subdomain next.'
            : hasHosts
              ? 'Your site, starter subdomain, link map, and /short redirect rule are ready for you. Create your first short link when you are ready.'
              : 'Your site, link map, and /short redirect rule are ready, but you do not have a short-link host yet. Connect a domain to get started.',
        },
        {
          id: 'next',
          label: 'Next steps',
          title: 'What to do now',
          description: needsChoice
            ? 'Pick your subdomain, then create your first short link and track clicks in Analytics.'
            : hasHosts
              ? 'Create your first short link, then share it and track clicks in Analytics.'
              : 'Connect a domain for short links, then create your first link and track clicks in Analytics.',
        },
      ];
    }

    return [
      {
        id: 'welcome',
        label: 'Welcome',
        title: 'Your workspace is ready',
        description: needsChoice
          ? 'Your domain group, link map, and /short redirect rule are ready. Choose your short-link subdomain next.'
          : hasHosts
            ? 'Your domain group, starter subdomain, link map, and /short redirect rule are ready for you.'
            : 'Your domain group, link map, and /short redirect rule are ready, but you do not have a short-link host yet. Connect a domain to get started.',
      },
      {
        id: 'next',
        label: 'Next steps',
        title: 'What to do now',
        description: needsChoice
          ? 'Pick your subdomain, then add links to your link map and run a redirect test.'
          : hasHosts
            ? 'Review the starter routing, add links to your link map, and run a redirect test.'
            : 'Connect a domain for short links, then add links to your link map and run a redirect test.',
      },
    ];
  });

  constructor() {
    this.domainGroupStore.searchList(undefined, true);
    this.subdomainStore.searchList(undefined, true);
    this.domainStore.searchList(undefined, true);

    effect(() => {
      const groups = this.domainGroups();
      if (groups.length === 0) {
        return;
      }

      prefetchDomainGroupScopedLists(
        groups.map((group) => group.id),
        {
          linkMapStore: this.linkMapStore,
          redirectRuleStore: this.redirectRuleStore,
        },
        true,
      );
    });
  }

  ngAfterViewInit(): void {
    const initialStepId = this.dialogData?.initialStepId;
    if (!initialStepId) {
      return;
    }

    const index = this.steps().findIndex((step) => step.id === initialStepId);
    if (index > 0) {
      this.wizard?.setActiveStep(index);
    }
  }

  onConfirm(): void {
    if (this.needsSubdomainChoice()) {
      this.dialogRef.close({
        confirmed: true,
        openConnectDomain: true,
        connectDomainData: buildOnboardingConnectDomainData({
          domainGroups: this.domainGroups(),
          subdomains: this.subdomains(),
          domains: this.domains(),
        }),
      });
      return;
    }

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

  onConnectDomain(): void {
    this.dialogRef.close({
      confirmed: true,
      openConnectDomain: true,
      connectDomainData: buildOnboardingConnectDomainData({
        domainGroups: this.domainGroups(),
        subdomains: this.subdomains(),
        domains: this.domains(),
      }),
    });
  }
}
