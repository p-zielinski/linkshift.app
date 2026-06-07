import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormField, form, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import type { DomainGroup } from '../../core/models/domain-group.model';
import type { LinkMap, LinkMapEntry } from '../../core/models/link-map.model';
import type { RedirectRule } from '../../core/models/redirect-rule.model';
import { LinkMapsApiService } from '../../core/api/link-maps-api.service';
import { LinkMapEntriesApiService } from '../../core/api/link-map-entries-api.service';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import { DashboardContextService } from '../../core/layout/dashboard-context.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { resolveDashboardAnalyticsPath } from '../../core/layout/dashboard-mode-toggle-navigation.util';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';
import { buildShortPath, buildShortUrlsForHosts, formatShortUrlsForClipboard, type LinksHostOption } from './links-aggregation.util';
import {
  buildDefaultLinkMapPayload,
  buildDefaultPrefixRulePayload,
  isValidHttpsDestination,
  isValidLinkKey,
  normalizeDestinationUrl,
  planLinkProvisioning,
  sanitizeLinkKey,
} from './links-provisioning.util';

export type CreateLinkWizardDialogData = {
  domainGroups: DomainGroup[];
  hostOptions: LinksHostOption[];
  linkMaps: LinkMap[];
  redirectRules: RedirectRule[];
  initialDomainGroupId?: string;
};

export type CreateLinkWizardDialogResult = {
  created: boolean;
  openAdvanced?: boolean;
  openConnectDomain?: boolean;
  domainGroupId?: string;
  linkMapId?: string;
  entryId?: string;
};

type CreateLinkWizardModel = {
  domainGroupId: string;
  key: string;
  destination: string;
};

const CREATE_LINK_SUMMARY_STEP_ID = 'summary';
const CREATE_LINK_SITE_STEP_ID = 'site';

@Component({
  selector: 'app-create-link-wizard-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    FormField,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective,
  ],
  templateUrl: './create-link-wizard-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLinkWizardDialogComponent {
  @ViewChild(WizardComponent) private wizard?: WizardComponent;

  private readonly dialogRef = inject(
    MatDialogRef<CreateLinkWizardDialogComponent, CreateLinkWizardDialogResult>,
  );
  private readonly data = inject<CreateLinkWizardDialogData>(MAT_DIALOG_DATA);
  private readonly linkMapsApi = inject(LinkMapsApiService);
  private readonly linkMapEntriesApi = inject(LinkMapEntriesApiService);
  private readonly redirectRulesApi = inject(RedirectRulesApiService);
  private readonly dashboardModeService = inject(DashboardModeService);
  private readonly dashboardContext = inject(DashboardContextService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  private readonly availableMaps = signal<LinkMap[]>(this.data.linkMaps ?? []);
  private readonly availableRules = signal<RedirectRule[]>(this.data.redirectRules ?? []);

  readonly pending = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly activeStepId = signal(CREATE_LINK_SITE_STEP_ID);
  readonly createdEntry = signal<LinkMapEntry | null>(null);
  readonly createdLinkMapId = signal<string | null>(null);
  readonly createdShortPath = signal('');
  readonly createdShortUrls = signal<string[]>([]);
  readonly createdRedirectRuleId = signal<string | null>(null);
  readonly sessionCreatedLinkMap = signal(false);
  readonly sessionCreatedPrefixRule = signal(false);

  readonly provisioningDisclosureVisible = computed(
    () => this.sessionCreatedLinkMap() || this.sessionCreatedPrefixRule(),
  );
  readonly provisioningDisclosureCopy = 'Routing setup was created automatically';

  readonly domainGroups = this.data.domainGroups ?? [];
  readonly groupMap = computed(() => {
    const map: Record<string, string> = {};
    for (const group of this.domainGroups) {
      map[group.id] = group.name;
    }
    return map;
  });

  readonly model = signal<CreateLinkWizardModel>({
    domainGroupId: this.initialDomainGroupId(),
    key: '',
    destination: 'https://',
  });

  readonly wizardForm = form(this.model, (formGroup) => {
    required(formGroup.domainGroupId);
    required(formGroup.key);
    required(formGroup.destination);
  });

  readonly hostsForSelectedGroup = computed(() =>
    this.data.hostOptions.filter((option) => option.domainGroupId === this.model().domainGroupId),
  );

  readonly keyValue = computed(() => sanitizeLinkKey(this.model().key));
  readonly destinationValue = computed(() => normalizeDestinationUrl(this.model().destination));
  readonly keyValid = computed(() => isValidLinkKey(this.model().key));
  readonly destinationValid = computed(() => isValidHttpsDestination(this.model().destination));
  readonly siteValid = computed(
    () => !!this.model().domainGroupId && this.hostsForSelectedGroup().length > 0,
  );

  readonly provisioningPlan = computed(() =>
    planLinkProvisioning({
      domainGroupId: this.model().domainGroupId,
      linkMaps: this.availableMaps(),
      redirectRules: this.availableRules(),
    }),
  );

  readonly previewShortPath = computed(() => {
    if (!this.keyValid()) {
      return '';
    }
    return buildShortPath(this.provisioningPlan().sourcePath, this.keyValue());
  });

  readonly previewShortUrls = computed(() =>
    buildShortUrlsForHosts(this.hostsForSelectedGroup(), this.previewShortPath()),
  );

  /** QR generator accepts one URL; first connected host is a reasonable default. */
  readonly primaryCreatedShortUrl = computed(() => this.createdShortUrls()[0] ?? '');

  readonly copyUrlTooltip =
    'Copies all full URLs (one per host). Every listed host serves the same short path.';

  readonly canCreate = computed(
    () => this.siteValid() && this.keyValid() && this.destinationValid() && !this.pending(),
  );
  readonly isCreated = computed(() => !!this.createdEntry());

  readonly saveLabel = computed(() => {
    if (this.isCreated()) {
      return 'Done';
    }
    if (this.pending()) {
      return 'Creating…';
    }
    return 'Create link';
  });
  readonly saveDisabled = computed(() => {
    if (this.isCreated()) {
      return false;
    }
    if (this.activeStepId() !== CREATE_LINK_SUMMARY_STEP_ID) {
      return true;
    }
    return !this.canCreate();
  });
  readonly advancedOptionsTooltip =
    'Opens Advanced view with redirect rules and full routing controls';

  readonly saveTooltip = computed(() => {
    if (this.isCreated()) {
      return '';
    }
    if (this.activeStepId() !== CREATE_LINK_SUMMARY_STEP_ID) {
      return 'Review the summary step to create your link';
    }
    if (this.canCreate()) {
      return '';
    }
    if (!this.siteValid()) {
      return 'Select a site with at least one connected host';
    }
    if (!this.keyValid()) {
      return 'Use lowercase letters, numbers, and hyphens only';
    }
    if (!this.destinationValid()) {
      return 'Destination must be a valid https URL';
    }
    return '';
  });

  readonly steps = computed<WizardStep[]>(() => {
    const lockEarlierSteps = this.isCreated();

    return [
      {
        id: CREATE_LINK_SITE_STEP_ID,
        label: 'Site',
        title: 'Choose site',
        description: 'Pick the site where this short link will live',
        complete: this.siteValid(),
        disabled: lockEarlierSteps,
      },
      {
        id: 'path',
        label: 'Path',
        title: 'Link path',
        description: 'Use lowercase letters, numbers, and hyphens',
        complete: this.keyValid(),
        disabled: lockEarlierSteps,
      },
      {
        id: 'destination',
        label: 'Destination',
        title: 'Destination URL',
        description: 'Use a secure URL starting with https://',
        complete: this.destinationValid(),
        disabled: lockEarlierSteps,
      },
      {
        id: CREATE_LINK_SUMMARY_STEP_ID,
        label: 'Summary',
        title: this.isCreated() ? 'Short link is ready' : 'Review and create',
        description: this.isCreated()
          ? 'Copy a short URL, open analytics, or create a QR code'
          : 'Confirm details and create short link in one flow',
        complete: this.isCreated() || this.canCreate(),
      },
    ];
  });

  onStepChange(stepId: string): void {
    this.activeStepId.set(stepId);
  }

  async onSave(): Promise<void> {
    if (this.isCreated()) {
      this.dialogRef.close(this.buildCreatedCloseResult());
      return;
    }

    if (this.activeStepId() !== CREATE_LINK_SUMMARY_STEP_ID) {
      return;
    }

    await this.createLink();

    if (this.isCreated()) {
      this.goToSummaryStep();
    }
  }

  onCancel(): void {
    this.dialogRef.close({ created: false });
  }

  openConnectDomain(): void {
    this.dialogRef.close({
      created: false,
      openConnectDomain: true,
      domainGroupId: this.model().domainGroupId,
    });
  }

  copyCreatedUrl(): void {
    const urls = this.createdShortUrls();
    const payload = urls.length > 0 ? formatShortUrlsForClipboard(urls) : this.createdShortPath();
    if (!payload) {
      return;
    }

    const copied = this.clipboard.copy(payload);
    this.snackBar.open(copied ? 'Copied to clipboard.' : "Couldn't copy to clipboard.", 'Dismiss', {
      duration: 3000,
    });
  }

  openAnalytics(): void {
    const entry = this.createdEntry();
    const linkMapId = this.createdLinkMapId();
    if (!entry || !linkMapId) {
      return;
    }

    const domainGroupId = this.model().domainGroupId;
    this.dashboardContext.setSelectedDomainGroupId(domainGroupId);
    this.dialogRef.close(this.buildCreatedCloseResult());
    void this.router.navigate([resolveDashboardAnalyticsPath(this.dashboardModeService.mode())], {
      queryParams: {
        workspace: domainGroupId,
        ruleId: this.createdRedirectRuleId() ?? undefined,
        linkMapId,
        linkKey: entry.key,
      },
    });
  }

  openQrGenerator(): void {
    const url = this.primaryCreatedShortUrl();
    if (!url) {
      return;
    }

    this.dialogRef.close(this.buildCreatedCloseResult());
    void this.router.navigate(['/tools/qr-code-generator'], {
      queryParams: { url },
    });
  }

  openAdvancedOptions(): void {
    const confirmData: ConfirmDialogData = {
      title: 'Switch to advanced view?',
      message:
        "You'll leave this wizard and open redirect rules in Advanced view. Routing and link map controls live there.",
      confirmLabel: 'Switch to advanced',
      cancelLabel: 'Stay here',
    };

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: confirmData,
    });

    confirmDialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.dialogRef.close({
        created: this.isCreated(),
        openAdvanced: true,
        domainGroupId: this.model().domainGroupId,
        linkMapId: this.createdLinkMapId() ?? undefined,
      });
    });
  }

  private goToSummaryStep(): void {
    const summaryIndex = this.steps().findIndex((step) => step.id === CREATE_LINK_SUMMARY_STEP_ID);
    if (summaryIndex < 0) {
      return;
    }
    this.wizard?.setActiveStep(summaryIndex);
    this.activeStepId.set(CREATE_LINK_SUMMARY_STEP_ID);
  }

  private async createLink(): Promise<void> {
    if (this.activeStepId() !== CREATE_LINK_SUMMARY_STEP_ID || !this.canCreate()) {
      return;
    }

    this.pending.set(true);
    this.submitError.set(null);

    try {
      const groupId = this.model().domainGroupId;
      const key = this.keyValue();
      const destination = this.destinationValue();

      let maps = this.availableMaps();
      let rules = this.availableRules();
      let plan = planLinkProvisioning({
        domainGroupId: groupId,
        linkMaps: maps,
        redirectRules: rules,
      });
      let selectedMap = plan.selectedMap;

      if (plan.createDefaultMap) {
        selectedMap = await firstValueFrom(this.linkMapsApi.create(buildDefaultLinkMapPayload(groupId)));
        this.sessionCreatedLinkMap.set(true);
        maps = [...maps, selectedMap];
        this.availableMaps.set(maps);
        plan = planLinkProvisioning({
          domainGroupId: groupId,
          linkMaps: maps,
          redirectRules: rules,
        });
      }

      if (!selectedMap) {
        throw new Error("Couldn't set up link routing. Try again.");
      }

      if (plan.createPrefixRule) {
        const createdRule = await firstValueFrom(
          this.redirectRulesApi.create(
            buildDefaultPrefixRulePayload({
              domainGroupId: groupId,
              linkMapId: selectedMap.id,
              sourcePath: plan.sourcePath,
            }),
          ),
        );
        this.sessionCreatedPrefixRule.set(true);
        rules = [...rules, createdRule];
        this.availableRules.set(rules);
        plan = planLinkProvisioning({
          domainGroupId: groupId,
          linkMaps: maps,
          redirectRules: rules,
        });
      }

      const entry = await firstValueFrom(
        this.linkMapEntriesApi.create({
          linkMapId: selectedMap.id,
          key,
          destination,
        }),
      );

      const shortPath = buildShortPath(plan.sourcePath, entry.key);
      const routingRule = rules
        .filter(
          (rule) =>
            rule.linkMapId === selectedMap.id &&
            rule.pathMatch === 'prefix' &&
            rule.queryMatch === 'ignore' &&
            !rule.isBlocked,
        )
        .sort((left, right) => {
          if (left.priority !== right.priority) {
            return left.priority - right.priority;
          }
          return left.createdAt.localeCompare(right.createdAt);
        })[0];

      this.createdEntry.set(entry);
      this.createdLinkMapId.set(selectedMap.id);
      this.createdRedirectRuleId.set(routingRule?.id ?? null);
      this.createdShortPath.set(shortPath);
      this.createdShortUrls.set(buildShortUrlsForHosts(this.hostsForSelectedGroup(), shortPath));
    } catch (error) {
      this.submitError.set(extractErrorMessage(error, "Couldn't create link. Try again."));
    } finally {
      this.pending.set(false);
    }
  }

  private buildCreatedCloseResult(): CreateLinkWizardDialogResult {
    return {
      created: true,
      domainGroupId: this.model().domainGroupId,
      linkMapId: this.createdLinkMapId() ?? undefined,
      entryId: this.createdEntry()?.id,
    };
  }

  private initialDomainGroupId(): string {
    if (
      this.data.initialDomainGroupId &&
      this.domainGroups.some((group) => group.id === this.data.initialDomainGroupId)
    ) {
      return this.data.initialDomainGroupId;
    }
    return this.domainGroups[0]?.id ?? '';
  }
}
