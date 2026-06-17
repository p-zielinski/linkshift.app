import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { APP_CONFIG } from '../../../core/config/app-runtime-config';
import { DashboardModeService } from '../../../core/layout/dashboard-mode.service';
import { AuthStore } from '../../../core/store/auth.store';
import { DomainStore } from '../../../core/store/domain.store';
import { DomainGroupStore } from '../../../core/store/domain-group.store';
import { OrganizationMembersStore } from '../../../core/store/organization-members.store';
import { OrganizationUsageStore } from '../../../core/store/organization-usage.store';
import { SubdomainStore } from '../../../core/store/subdomain.store';
import { resolveSubdomainBaseHost } from '../../../features/links/links-aggregation.util';
import {
  SETUP_CHECKLIST_INVITE_SENT_KEY,
  SETUP_CHECKLIST_REDIRECT_TESTER_USED_KEY,
  countOrganizationHosts,
  deriveSetupChecklistAutoComplete,
  isSetupChecklistItemAutoCompleted,
  isSetupChecklistItemEffectivelyChecked,
  organizationHasConnectedHosts,
  readSetupChecklistLocalFlag,
  setupChecklistEffectiveCompletedCount,
  writeSetupChecklistLocalFlag,
} from './setup-checklist.auto-complete.util';
import {
  DEFAULT_SETUP_CHECKLIST_STATE,
  SETUP_CHECKLIST_STORAGE_KEY,
  type SetupChecklistItemId,
  type SetupChecklistState,
  dismissSetupChecklist,
  parseSetupChecklistState,
  reopenSetupChecklist,
  resolveSetupChecklistItems,
  serializeSetupChecklistState,
  toggleSetupChecklistItem,
} from './setup-checklist.state';

@Injectable({
  providedIn: 'root',
})
export class SetupChecklistService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly dashboardMode = inject(DashboardModeService);
  private readonly authStore = inject(AuthStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly domainStore = inject(DomainStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly membersStore = inject(OrganizationMembersStore);
  private readonly appConfig = inject(APP_CONFIG);

  private readonly state = signal<SetupChecklistState>(this.readStoredState());
  private readonly inviteSentRecorded = signal(this.readLocalFlag(SETUP_CHECKLIST_INVITE_SENT_KEY));
  private readonly redirectTesterUsedRecorded = signal(
    this.readLocalFlag(SETUP_CHECKLIST_REDIRECT_TESTER_USED_KEY),
  );

  private readonly domainGroups = this.domainGroupStore.selectList();
  private readonly subdomains = this.subdomainStore.selectList();
  private readonly domains = this.domainStore.selectList();

  private readonly subdomainBaseHost = computed(() => {
    const configuredBaseUrl = this.appConfig.APP_SUBDOMAIN_BASE_URL || this.appConfig.APP_BASE_URL;
    return resolveSubdomainBaseHost(configuredBaseUrl);
  });

  private readonly hostCount = computed(() =>
    countOrganizationHosts(
      this.domainGroups(),
      this.subdomains(),
      this.domains(),
      this.subdomainBaseHost(),
    ),
  );

  private readonly hasConnectedHosts = computed(() =>
    organizationHasConnectedHosts(this.domainGroups().length, this.hostCount()),
  );

  private readonly autoComplete = computed(() =>
    deriveSetupChecklistAutoComplete({
      mode: this.dashboardMode.mode(),
      domainGroupCount: this.domainGroups().length,
      hostCount: this.hostCount(),
      linkMapCount: this.usageStore.usage()?.linkMaps ?? 0,
      redirectRuleCount: this.usageStore.usage()?.rules ?? 0,
      linkMapEntryCount: this.usageStore.usage()?.linkMapEntries ?? 0,
      redirectTestCount: this.usageStore.usage()?.tests ?? 0,
      memberCount: this.membersStore.members().length,
      inviteSentRecorded: this.inviteSentRecorded(),
      redirectTesterUsedRecorded: this.redirectTesterUsedRecorded(),
    }),
  );

  readonly items = computed(() =>
    resolveSetupChecklistItems(this.dashboardMode.mode(), {
      hasConnectedHosts: this.hasConnectedHosts(),
    }),
  );
  readonly dismissed = computed(() => this.state().dismissed);
  readonly completedCount = computed(() =>
    setupChecklistEffectiveCompletedCount(
      this.state().checked,
      this.autoComplete(),
      this.items().map((item) => item.id),
    ),
  );
  readonly totalCount = computed(() => this.items().length);

  readonly itemViews = computed(() =>
    this.items().map((item) => ({
      id: item.id,
      label: item.label,
      routerLink: item.route,
      queryParams: item.queryParams ?? null,
      checked: isSetupChecklistItemEffectivelyChecked(
        this.state().checked,
        this.autoComplete(),
        item.id,
      ),
      autoCompleted: isSetupChecklistItemAutoCompleted(this.autoComplete(), item.id),
    })),
  );

  constructor() {
    effect(() => {
      if (!this.authStore.isAuthenticated()) {
        return;
      }

      this.usageStore.loadUsage();
      this.membersStore.loadMembers();
    });
  }

  isChecked(itemId: SetupChecklistItemId): boolean {
    return isSetupChecklistItemEffectivelyChecked(
      this.state().checked,
      this.autoComplete(),
      itemId,
    );
  }

  isAutoCompleted(itemId: SetupChecklistItemId): boolean {
    return isSetupChecklistItemAutoCompleted(this.autoComplete(), itemId);
  }

  setChecked(itemId: SetupChecklistItemId, checked: boolean): void {
    if (this.isAutoCompleted(itemId)) {
      return;
    }

    const next = toggleSetupChecklistItem(this.state(), itemId, checked);
    this.updateState(next);
  }

  markInviteSent(): void {
    if (this.inviteSentRecorded()) {
      return;
    }

    this.writeLocalFlag(SETUP_CHECKLIST_INVITE_SENT_KEY);
    this.inviteSentRecorded.set(true);
  }

  markRedirectTesterUsed(): void {
    if (this.redirectTesterUsedRecorded()) {
      return;
    }

    this.writeLocalFlag(SETUP_CHECKLIST_REDIRECT_TESTER_USED_KEY);
    this.redirectTesterUsedRecorded.set(true);
  }

  dismiss(): void {
    this.updateState(dismissSetupChecklist(this.state()));
  }

  reopen(): void {
    this.updateState(reopenSetupChecklist(this.state()));
  }

  private updateState(next: SetupChecklistState): void {
    this.state.set(next);
    this.persistState(next);
  }

  private readStoredState(): SetupChecklistState {
    if (!isPlatformBrowser(this.platformId)) {
      return { ...DEFAULT_SETUP_CHECKLIST_STATE };
    }

    return parseSetupChecklistState(localStorage.getItem(SETUP_CHECKLIST_STORAGE_KEY));
  }

  private persistState(state: SetupChecklistState): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(SETUP_CHECKLIST_STORAGE_KEY, serializeSetupChecklistState(state));
  }

  private readLocalFlag(key: string): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return readSetupChecklistLocalFlag(localStorage, key);
  }

  private writeLocalFlag(key: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    writeSetupChecklistLocalFlag(localStorage, key);
  }
}
