import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormField, form, validate } from '@angular/forms/signals';
import { DOMAIN_SETUP_CONFIG } from '../../core/config/domain-setup-config';
import { DomainGroupsApiService } from '../../core/api/domain-groups-api.service';
import { DomainsApiService } from '../../core/api/domains-api.service';
import { SubdomainsApiService } from '../../core/api/subdomains-api.service';
import { applyZodField } from '../../core/forms/zod-validators';
import type { DomainGroup } from '../../core/models/domain-group.model';
import { AuthStore } from '../../core/store/auth.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { resolveOrganizationConfig } from '../../core/utils/organization-config.util';
import { domainSchema } from '../domains/domain.schemas';
import { subdomainSchema } from '../subdomains/subdomain.schemas';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';
import {
  type CampaignConnectDomainModel,
  type CampaignWorkspaceMode,
  buildCampaignSubdomainHost,
  createCampaignConnectDomainModel,
  isCampaignHostStepValid,
  isCampaignSiteStepValid,
  normalizeCampaignWorkspaceName,
  provisionCampaignConnectDomain,
  resolveCampaignConnectCanCreateNewSite,
  resolveCampaignConnectInitialDomainGroupId,
} from './campaign-connect-domain.util';

export type CampaignConnectDomainDialogData = {
  subdomainBaseHost: string;
  domainGroups: DomainGroup[];
  /** When set, skip the site step and add the host to this site. */
  domainGroupId?: string;
  existingWorkspaceName?: string;
  /** Pre-select a site on the site step without locking add-host mode. */
  initialDomainGroupId?: string;
  /** During onboarding, replace a placeholder subdomain before creating the chosen name. */
  replaceSubdomainId?: string;
  replaceSubdomainName?: string;
};

export type CampaignConnectDomainDialogResult = {
  connected: true;
  domainGroupId: string;
  host: string;
  openCreateLink?: boolean;
  addedHostToExistingSite?: boolean;
};

@Component({
  selector: 'app-campaign-connect-domain-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    FormField,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective,
  ],
  templateUrl: './campaign-connect-domain-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignConnectDomainDialogComponent implements AfterViewInit {
  @ViewChild(WizardComponent) private wizard?: WizardComponent;

  private readonly dialogRef = inject(
    MatDialogRef<CampaignConnectDomainDialogComponent, CampaignConnectDomainDialogResult>,
  );
  readonly dialogData = inject<CampaignConnectDomainDialogData>(MAT_DIALOG_DATA);
  private readonly domainGroupsApi = inject(DomainGroupsApiService);
  private readonly subdomainsApi = inject(SubdomainsApiService);
  private readonly domainsApi = inject(DomainsApiService);
  private readonly authStore = inject(AuthStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly domainStore = inject(DomainStore);
  private readonly domainSetupConfig = inject(DOMAIN_SETUP_CONFIG);

  readonly domainGroups = this.dialogData.domainGroups ?? [];
  readonly pending = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly provisioned = signal(false);
  readonly connectedHost = signal('');
  readonly connectedDomainGroupId = signal('');
  readonly siteStepAttempted = signal(false);
  readonly hostStepAttempted = signal(false);

  readonly isAddHostMode = computed(() => !!this.dialogData.domainGroupId);
  readonly hasExistingSites = computed(() => this.domainGroups.length > 0);
  readonly maxDomainGroups = computed(
    () =>
      resolveOrganizationConfig(this.authStore.organization()?.configuration).activeSubscription
        .limits.maxDomainGroups,
  );
  readonly canCreateNewSite = computed(() =>
    resolveCampaignConnectCanCreateNewSite(this.domainGroups.length, this.maxDomainGroups()),
  );
  readonly existingWorkspaceDisplayName = computed(
    () => this.dialogData.existingWorkspaceName?.trim() ?? '',
  );
  readonly wizardTitle = computed(() => {
    if (this.dialogData.replaceSubdomainId) {
      return 'Choose your subdomain';
    }
    return this.isAddHostMode() ? 'Add host' : 'Connect your domain';
  });
  readonly wizardSubtitle = computed(() => {
    if (!this.isAddHostMode()) {
      return this.hasExistingSites()
        ? this.canCreateNewSite()
          ? 'Choose a site, then add a host for short links.'
          : 'Add a host to your existing site.'
        : 'Create a site, then add a host for short links.';
    }
    const siteName = this.existingWorkspaceDisplayName();
    return siteName
      ? `Add a host to ${siteName}.`
      : 'Add a subdomain or custom domain to your site.';
  });
  readonly activeStepId = signal(this.dialogData.domainGroupId ? 'host' : 'site');

  readonly model = signal<CampaignConnectDomainModel>(
    createCampaignConnectDomainModel({
      initialDomainGroupId: this.resolveInitialDomainGroupId(),
      hasExistingSites: this.domainGroups.length > 0,
      canCreateNewSite: resolveCampaignConnectCanCreateNewSite(
        this.domainGroups.length,
        resolveOrganizationConfig(this.authStore.organization()?.configuration).activeSubscription
          .limits.maxDomainGroups,
      ),
    }),
  );

  readonly connectForm = form(this.model, (f) => {
    validate(f.selectedDomainGroupId, ({ value, valueOf }) => {
      if (valueOf(f.workspaceMode) !== 'existing') {
        return undefined;
      }
      return value().trim() ? undefined : { kind: 'required', message: 'Select a site' };
    });
    applyZodField(f.subdomainName, subdomainSchema.shape.name);
    applyZodField(f.customDomainName, domainSchema.shape.name);
  });

  readonly subdomainPreviewHost = computed(() => {
    const name = this.model().subdomainName.trim();
    if (!name) {
      return '';
    }
    return buildCampaignSubdomainHost(name, this.dialogData.subdomainBaseHost);
  });

  readonly siteStepValid = computed(() => isCampaignSiteStepValid(this.model()));
  readonly hostStepValid = computed(() => isCampaignHostStepValid(this.model()));
  readonly selectedSiteLabel = computed(() => {
    const groupId = this.model().selectedDomainGroupId;
    if (!groupId) {
      return 'Select site';
    }
    return this.domainGroups.find((group) => group.id === groupId)?.name ?? 'Select site';
  });
  readonly siteSummaryLabel = computed(() => {
    if (this.model().workspaceMode === 'new') {
      return normalizeCampaignWorkspaceName(this.model().workspaceName);
    }
    return this.selectedSiteLabel();
  });
  readonly selectedSiteError = computed(() =>
    this.getFieldError(this.connectForm.selectedDomainGroupId(), {
      active: this.model().workspaceMode === 'existing',
      attempted: this.siteStepAttempted(),
    }),
  );
  readonly workspaceNameError = computed(() =>
    this.getFieldError(this.connectForm.workspaceName(), {
      active: this.model().workspaceMode === 'new',
      attempted: this.siteStepAttempted(),
    }),
  );
  readonly subdomainError = computed(() =>
    this.getFieldError(this.connectForm.subdomainName(), {
      active: this.model().hostKind === 'subdomain',
      attempted: this.hostStepAttempted(),
    }),
  );
  readonly customDomainError = computed(() =>
    this.getFieldError(this.connectForm.customDomainName(), {
      active: this.model().hostKind === 'custom-domain',
      attempted: this.hostStepAttempted(),
    }),
  );

  readonly targetIp = computed(() => this.domainSetupConfig.targetIp?.trim() ?? '');
  readonly hasTargetIp = computed(() => this.targetIp().length > 0);
  readonly isCustomDomainConnected = computed(
    () => this.provisioned() && this.model().hostKind === 'custom-domain',
  );

  readonly steps = computed<WizardStep[]>(() => {
    const hostStep: WizardStep = {
      id: 'host',
      label: 'Host',
      title: this.isAddHostMode() ? 'Add a host' : 'Connect a host',
      description: 'Choose a LinkShift subdomain or bring your own domain.',
      complete: this.hostStepValid(),
      disabled: this.pending(),
    };
    const doneStep: WizardStep = this.provisioned()
      ? {
          id: 'done',
          label: 'Done',
          title: this.isCustomDomainConnected() ? 'Configure DNS' : 'Host connected',
          description: this.isCustomDomainConnected()
            ? 'Point your domain to LinkShift before short links work.'
            : 'Your site is ready for short links.',
          complete: true,
        }
      : {
          id: 'done',
          label: 'Done',
          title: 'Finish setup',
          description: 'Connect your host to open this step.',
          complete: false,
          disabled: true,
        };

    if (this.isAddHostMode()) {
      return [hostStep, doneStep];
    }

    const siteStep: WizardStep = this.hasExistingSites()
      ? {
          id: 'site',
          label: 'Site',
          title: 'Choose a site',
          description: this.canCreateNewSite()
            ? 'Add a host to an existing site or create a new one.'
            : 'Your plan includes one site. Continue to add a host.',
          complete: this.siteStepValid(),
        }
      : {
          id: 'site',
          label: 'Site',
          title: 'Name your site',
          description: 'Create a site for your short links.',
          complete: this.siteStepValid(),
        };

    return [siteStep, hostStep, doneStep];
  });

  readonly hideWizardSave = computed(() => this.provisioned());
  readonly cancelLabel = computed(() =>
    this.provisioned() || this.activeStepId() === 'done' ? 'Done' : 'Cancel',
  );
  readonly saveLabel = computed(() => {
    if (this.pending() && this.activeStepId() === 'host') {
      return 'Connecting…';
    }
    if (this.activeStepId() === 'host') {
      return 'Connect domain';
    }
    return 'Continue';
  });
  readonly saveDisabled = computed(() => {
    if (this.pending()) {
      return true;
    }
    if (this.activeStepId() === 'site') {
      return !this.siteStepValid();
    }
    if (this.activeStepId() === 'host') {
      return !this.hostStepValid();
    }
    return true;
  });

  ngAfterViewInit(): void {
    if (this.isAddHostMode()) {
      this.wizard?.setActiveStep(0);
      this.activeStepId.set('host');
    }
  }

  onStepChange(stepId: string): void {
    this.activeStepId.set(stepId);
  }

  onCancel(): void {
    if (this.provisioned()) {
      this.closeWithResult();
      return;
    }
    this.dialogRef.close();
  }

  async onSave(): Promise<void> {
    this.submitError.set(null);

    if (this.activeStepId() === 'site') {
      this.siteStepAttempted.set(true);
      this.connectForm.selectedDomainGroupId().markAsTouched();
      this.connectForm.workspaceName().markAsTouched();
      if (!this.siteStepValid()) {
        return;
      }
      this.wizard?.next();
      return;
    }

    if (this.activeStepId() !== 'host' || this.pending()) {
      return;
    }

    this.hostStepAttempted.set(true);
    this.connectForm.subdomainName().markAsTouched();
    this.connectForm.customDomainName().markAsTouched();
    if (!this.hostStepValid()) {
      return;
    }

    this.pending.set(true);
    try {
      const result = await provisionCampaignConnectDomain({
        model: this.model(),
        subdomainBaseHost: this.dialogData.subdomainBaseHost,
        lockedDomainGroupId: this.dialogData.domainGroupId,
        replaceSubdomainId: this.dialogData.replaceSubdomainId,
        replaceSubdomainName: this.dialogData.replaceSubdomainName,
        domainGroupsApi: this.domainGroupsApi,
        subdomainsApi: this.subdomainsApi,
        domainsApi: this.domainsApi,
      });
      this.refreshStores();
      this.connectedHost.set(result.host);
      this.connectedDomainGroupId.set(result.domainGroupId);
      this.provisioned.set(true);
      this.wizard?.next();
      this.activeStepId.set('done');
    } catch (error) {
      this.submitError.set(
        extractErrorMessage(error, "Couldn't connect your domain. Check the details and try again."),
      );
    } finally {
      this.pending.set(false);
    }
  }

  createFirstLink(): void {
    this.dialogRef.close({
      connected: true,
      domainGroupId: this.connectedDomainGroupId(),
      host: this.connectedHost(),
      openCreateLink: true,
      addedHostToExistingSite:
        !!this.dialogData.domainGroupId || this.model().workspaceMode === 'existing',
    });
  }

  finish(): void {
    this.closeWithResult();
  }

  setWorkspaceMode(mode: CampaignWorkspaceMode): void {
    if (mode === 'new' && !this.canCreateNewSite()) {
      return;
    }

    this.siteStepAttempted.set(false);
    this.model.update((current) => ({ ...current, workspaceMode: mode }));
  }

  setHostKind(kind: CampaignConnectDomainModel['hostKind']): void {
    this.hostStepAttempted.set(false);
    this.model.update((current) => ({ ...current, hostKind: kind }));
  }

  private resolveInitialDomainGroupId(): string {
    return resolveCampaignConnectInitialDomainGroupId({
      lockedDomainGroupId: this.dialogData.domainGroupId,
      initialDomainGroupId: this.dialogData.initialDomainGroupId,
      domainGroups: this.domainGroups,
      canCreateNewSite: resolveCampaignConnectCanCreateNewSite(
        this.domainGroups.length,
        resolveOrganizationConfig(this.authStore.organization()?.configuration).activeSubscription
          .limits.maxDomainGroups,
      ),
    });
  }

  private closeWithResult(): void {
    this.dialogRef.close({
      connected: true,
      domainGroupId: this.connectedDomainGroupId(),
      host: this.connectedHost(),
      addedHostToExistingSite:
        !!this.dialogData.domainGroupId || this.model().workspaceMode === 'existing',
    });
  }

  private refreshStores(): void {
    this.domainGroupStore.searchList(undefined, true);
    this.subdomainStore.searchList(undefined, true);
    this.domainStore.searchList(undefined, true);
  }

  private getFieldError(
    field: { touched: () => boolean; errors?: () => Array<{ message?: string }> },
    options: { active: boolean; attempted: boolean },
  ): string | null {
    if (!options.active) {
      return null;
    }
    if (!field.touched() && !options.attempted) {
      return null;
    }

    const errors = field.errors?.();
    if (!errors || errors.length === 0) {
      return null;
    }

    return errors[0].message ?? 'Invalid value';
  }
}
