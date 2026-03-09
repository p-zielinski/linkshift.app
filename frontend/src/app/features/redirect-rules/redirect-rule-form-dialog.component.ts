import { Component, computed, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { form, required, FormField } from '@angular/forms/signals';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { RedirectTestResultsStore } from '../../core/store/redirect-test-results.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import { applyZodField } from '../../core/forms/zod-validators';
import {
  redirectRuleSchema,
  redirectRuleMatchMethods,
  redirectRuleStatusCodes,
  redirectRuleQueryMatches,
  redirectRulePathMatches,
} from './redirect-rule.schemas';
import type {
  RedirectRule,
  RedirectQueryMatch,
  RedirectPathMatch,
} from '../../core/models/redirect-rule.model';
import type { LinkMap } from '../../core/models/link-map.model';
import { CREATE_ENTITY_ID, getFilterKey } from '../../core/store/entity/entity-store.utils';
import { HttpMethod } from '../../core/models/http-method.model';
import { ensureLeadingSlash, splitPathWithQuery } from '../tests/redirect-test.utils';
import type { RedirectTestFormPrefill } from '../tests/redirect-test-form-dialog.component';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import {
  LinkMapFormDialogComponent,
  type LinkMapDialogData,
  type LinkMapDialogResult,
} from '../link-maps/link-map-form-dialog.component';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { AuthStore } from '../../core/store/auth.store';
import { OrganizationConfiguration } from '@shared/models/organization-config.model';

type RedirectRuleFormModel = {
  domainGroupId: string;
  source: string;
  destination: string;
  statusCode: string;
  matchMethod: HttpMethod[];
  queryMatch: RedirectQueryMatch;
  pathMatch: RedirectPathMatch;
  linkMapId: string | null;
  priority: string;
};


export type RedirectRuleDialogData = {
  domainGroupId?: string;
  rule?: RedirectRule;
};

export type RedirectRuleDialogResult = {
  saved: boolean;
  openTestWizard?: boolean;
  testPrefill?: RedirectTestFormPrefill;
};

@Component({
  selector: 'app-redirect-rule-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatExpansionModule,
    FormField,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective,
  ],
  templateUrl: './redirect-rule-form-dialog.component.html',
  styleUrl: './redirect-rule-form-dialog.component.css',
})
export class RedirectRuleFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RedirectRuleFormDialogComponent>);
  private readonly data = inject<RedirectRuleDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly redirectTestResultsStore = inject(RedirectTestResultsStore);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly authStore = inject(AuthStore);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly matchMethodOptions = redirectRuleMatchMethods;
  readonly queryMatchOptions = redirectRuleQueryMatches;
  readonly pathMatchOptions = redirectRulePathMatches;
  readonly rule = this.data?.rule ?? null;
  readonly isEdit = !!this.rule;
  readonly dialogTitle = computed(() => {
    const title = this.isEdit ? 'Edit redirect rule' : 'Create redirect rule';
    return `${title} for domain group ${this.selectedGroupLabel()}`;
  });
  readonly submitLabel = this.isEdit ? 'Save' : 'Create';
  readonly subtitle = this.isEdit
    ? 'Update how this rule matches requests and routes traffic.'
    : 'Define how requests should be matched and routed.';
  readonly groupMap = computed(() => {
    const map: Record<string, { name: string } | undefined> = {};
    for (const group of this.domainGroups()) {
      map[group.id] = { name: group.name };
    }
    return map;
  });
  readonly selectedGroupLabel = computed(() => {
    const groupId = this.ruleModel().domainGroupId;
    return this.groupMap()[groupId]?.name ?? groupId;
  });
  readonly selectedGroupId = computed(() => this.ruleModel().domainGroupId);
  readonly config = computed(() => {
    const org = this.authStore.organization();
    const rawConfig = org?.configuration ?? undefined;
    return OrganizationConfiguration.fromJson(rawConfig);
  });
  readonly limits = computed(() => this.config().activeSubscription.limits);
  readonly usage = computed(() => this.usageStore.usage());
  readonly usageLoading = computed(() => this.usageStore.isLoading());
  readonly usageError = computed(() => this.usageStore.error());
  readonly linkMapLimitReached = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return false;
    }
    return usage.linkMaps >= this.limits().maxLinkMaps;
  });
  readonly linkMapCreateDisabled = computed(() => {
    if (this.usageLoading() || this.usageError()) {
      return true;
    }
    return this.linkMapLimitReached();
  });
  readonly linkMapLimitLabel = computed(() => {
    const usage = this.usage();
    if (!usage) {
      return this.usageLoading() ? 'Loading limits...' : 'Usage unavailable.';
    }
    return `${usage.linkMaps}/${this.limits().maxLinkMaps} link maps used`;
  });

  private readonly initialStatusCode = this.rule?.statusCode ?? 302;

  ruleModel = signal({
    domainGroupId: this.rule?.domainGroupId ?? this.data?.domainGroupId ?? '',
    source: this.rule?.source ?? '',
    destination: this.rule?.destination ?? (this.rule?.linkMapId ? '' : 'https://'),
    statusCode: String(this.initialStatusCode),
    matchMethod: this.rule?.matchMethod ?? [],
    queryMatch: this.rule?.queryMatch ?? 'exact',
    pathMatch: this.rule?.pathMatch ?? 'exact',
    linkMapId: this.rule?.linkMapId ?? null,
    priority: String(this.rule?.priority ?? 0),
  });

  readonly pendingSubmit = signal(false);
  private readonly submitKey = signal(CREATE_ENTITY_ID);
  private readonly submitErrorSequence = signal(0);
  private readonly submitLoadingSeen = signal(false);
  private readonly lastSubmittedValue = signal<RedirectRuleFormModel | null>(null);

  ruleForm = form(this.ruleModel, (f) => {
    required(f.domainGroupId);
    required(f.source);
    required(f.destination);
    required(f.statusCode);
    required(f.priority);
    applyZodField(f.domainGroupId, redirectRuleSchema.shape.domainGroupId);
    applyZodField(f.source, redirectRuleSchema.shape.source);
    applyZodField(f.destination, redirectRuleSchema.shape.destination);
    applyZodField(f.statusCode, redirectRuleSchema.shape.statusCode);
    applyZodField(f.matchMethod, redirectRuleSchema.shape.matchMethod);
    applyZodField(f.queryMatch, redirectRuleSchema.shape.queryMatch);
    applyZodField(f.pathMatch, redirectRuleSchema.shape.pathMatch);
    applyZodField(f.linkMapId, redirectRuleSchema.shape.linkMapId);
    applyZodField(f.priority, redirectRuleSchema.shape.priority);
  });

  field(key: keyof RedirectRuleFormModel): any {
    return (this.ruleForm as unknown as Record<string, unknown>)[key];
  }

  formatMatchMethods(methods: HttpMethod[] | undefined): string {
    if (!methods || methods.length === 0) {
      return 'All methods';
    }
    return methods.join(', ');
  }

  formatPathMatch(value: RedirectPathMatch): string {
    return value === 'prefix' ? 'Prefix' : 'Exact';
  }

  formatQueryMatch(value: RedirectQueryMatch): string {
    if (value === 'ignore') {
      return 'Ignore';
    }
    if (value === 'subset') {
      return 'Subset';
    }
    return 'Exact';
  }

  sourceError = computed(() => this.getFieldError(this.ruleForm.source()));
  destinationError = computed(() => this.getFieldError(this.ruleForm.destination()));
  statusError = computed(() => this.getFieldError(this.ruleForm.statusCode()));
  matchMethodError = computed(() => this.getFieldError(this.ruleForm.matchMethod()));
  queryMatchError = computed(() => this.getFieldError(this.ruleForm.queryMatch()));
  pathMatchError = computed(() => this.getFieldError(this.ruleForm.pathMatch()));
  priorityError = computed(() => this.getFieldError(this.ruleForm.priority()));
  scopeValid = computed(
    () => this.ruleForm.domainGroupId().valid() && this.ruleForm.priority().valid(),
  );
  private readonly sourceValue = computed(() => this.ruleModel().source.trim());
  private readonly destinationValue = computed(() => this.ruleModel().destination.trim());
  private readonly destinationHasProtocol = computed(() =>
    this.isLinkMapRule() ? true : /^https?:\/\//i.test(this.destinationValue()),
  );
  readonly statusCodeOptions = computed(() => redirectRuleStatusCodes);
  private readonly linkMapsErrorSequence = signal<number | null>(null);
  readonly linkMaps = computed(() => {
    const groupId = this.selectedGroupId();
    if (!groupId) {
      return [] as LinkMap[];
    }
    return this.linkMapStore.selectList({ domainGroupId: groupId })();
  });
  readonly linkMapsLoading = computed(() => {
    const groupId = this.selectedGroupId();
    if (!groupId) {
      return false;
    }
    const key = getFilterKey({ domainGroupId: groupId });
    return !!this.linkMapStore.isLoading()[key];
  });
  readonly linkMapsError = signal<string | null>(null);
  readonly selectedLinkMap = computed(() => {
    const linkMapId = this.ruleModel().linkMapId;
    if (!linkMapId) {
      return null;
    }
    return this.linkMaps().find((map) => map.id === linkMapId) ?? null;
  });
  readonly isLinkMapRule = computed(() => Boolean(this.ruleModel().linkMapId));
  readonly linkMapSourceIssue = computed(() => {
    if (!this.isLinkMapRule()) {
      return null;
    }
    const source = this.sourceValue();
    if (!source) {
      return 'Source is required for link map rules.';
    }
    if (source === '*') {
      return 'Link map rules cannot use a catch-all (*).';
    }
    if (source.includes('?')) {
      return 'Link map rules cannot include query params in the source.';
    }
    if (source.startsWith('/') && source.lastIndexOf('/') > 0) {
      return 'Link map rules do not support regex sources.';
    }
    return null;
  });
  readonly linkMapMissing = computed(() => {
    const linkMapId = this.ruleModel().linkMapId;
    if (!linkMapId) {
      return null;
    }
    if (this.linkMapsLoading()) {
      return null;
    }
    if (this.linkMapsError()) {
      return null;
    }
    return this.selectedLinkMap() ? null : 'Selected link map is missing for this domain group.';
  });

  matchValid = computed(
    () =>
      this.ruleForm.source().valid() && this.sourceValue().length > 0 && !this.linkMapSourceIssue(),
  );
  destinationValid = computed(() => {
    if (this.isLinkMapRule()) {
      return true;
    }
    return (
      this.ruleForm.destination().valid() &&
      this.destinationValue().length > 0 &&
      this.destinationHasProtocol()
    );
  });
  statusValid = computed(() => this.ruleForm.statusCode().valid());
  canSubmit = computed(() => {
    return (
      this.scopeValid() &&
      this.matchValid() &&
      this.destinationValid() &&
      this.ruleForm.statusCode().valid() &&
      this.ruleForm.matchMethod().valid() &&
      this.ruleForm.queryMatch().valid() &&
      this.ruleForm.pathMatch().valid() &&
      this.sourceValue().length > 0 &&
      (this.isLinkMapRule() || this.destinationValue().length > 0) &&
      !this.linkMapSourceIssue() &&
      !this.linkMapMissing()
    );
  });
  readonly submitDisabled = computed(
    () => !this.canSubmit() || this.ruleForm().submitting() || this.pendingSubmit(),
  );
  readonly submitTooltip = computed(() => {
    const errors = new Set<string>();

    if (this.pendingSubmit() || this.ruleForm().submitting()) {
      errors.add('Saving in progress...');
    }
    if (!this.ruleForm.domainGroupId().valid()) {
      errors.add('Domain group is missing.');
    }

    const sourceValue = this.sourceValue();
    if (!sourceValue) {
      errors.add('Source is required.');
    } else if (!this.ruleForm.source().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.source());
      errors.add(message ?? 'Source is invalid.');
    }

    const destinationValue = this.destinationValue();
    if (!this.isLinkMapRule()) {
      if (!destinationValue) {
        errors.add('Destination is required.');
      } else if (!this.destinationHasProtocol()) {
        errors.add('Destination must be a full URL starting with http:// or https://.');
      } else if (!this.ruleForm.destination().valid()) {
        const message = this.getFieldErrorMessage(this.ruleForm.destination());
        errors.add(message ?? 'Destination is invalid.');
      }
    }

    if (!this.ruleForm.statusCode().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.statusCode());
      errors.add(message ?? 'Status code is invalid.');
    }

    if (!this.ruleForm.matchMethod().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.matchMethod());
      errors.add(message ?? 'Request method is invalid.');
    }

    if (!this.ruleForm.queryMatch().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.queryMatch());
      errors.add(message ?? 'Query match is invalid.');
    }

    if (!this.ruleForm.pathMatch().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.pathMatch());
      errors.add(message ?? 'Path match is invalid.');
    }

    if (this.linkMapSourceIssue()) {
      errors.add(this.linkMapSourceIssue() ?? 'Link map rule source is invalid.');
    }

    if (this.linkMapMissing()) {
      errors.add(this.linkMapMissing() ?? 'Link map selection is invalid.');
    }

    if (!this.ruleForm.priority().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.priority());
      errors.add(message ?? 'Priority is invalid.');
    }

    return Array.from(errors).join('\n');
  });
  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'scope',
      label: 'Scope',
      title: 'Scope & priority',
      description: 'Pick priority for evaluation order.',
      complete: this.scopeValid(),
    },
    {
      id: 'match',
      label: 'Match',
      title: 'Request matching',
      description: 'Define source, method, and optional link map routing.',
      complete: this.matchValid() && !this.linkMapMissing(),
    },
    {
      id: 'destination',
      label: 'Destination',
      title: 'Destination logic',
      description: 'Configure destination or use link map routing.',
      complete: this.destinationValid(),
    },
    {
      id: 'status',
      label: 'Status',
      title: 'Status code',
      description: 'Select redirect status code behavior.',
      complete: this.statusValid(),
    },
    {
      id: 'summary',
      label: 'Summary',
      title: 'Review',
      description: 'Confirm the rule before saving.',
      complete: this.canSubmit(),
    },
  ]);

  readonly variableReferences = [
    {
      token: 'domain.fqdn',
      description: 'Full hostname.',
      example: 'https://{domain.fqdn}/welcome',
    },
    {
      token: 'domain.label',
      description: 'Hostname without TLD.',
      example: 'https://{domain.label}.example.com',
    },
    {
      token: 'domain.root',
      description: 'Root label only.',
      example: 'https://store.example.com?brand={domain.root}',
    },
    {
      token: 'domain.extension',
      description: 'TLD like com/pl.',
      example: 'https://example.com?tld={domain.extension}',
    },
    {
      token: 'domain.subdomain',
      description: 'Subdomain portion only.',
      example: 'https://example.com/tenant/{domain.subdomain}',
    },
    {
      token: 'path',
      description: 'Path without leading slash.',
      example: 'https://site.com/{path}',
    },
    {
      token: 'segments.0',
      description: 'Path segment by index.',
      example: 'https://example.com/category/{segments.0}',
    },
    {
      token: 'query.ref',
      description: 'Query param by key.',
      example: 'https://target.com?ref={query.ref}',
    },
    {
      token: 'domain.subdomains.0',
      description: 'Subdomain by index.',
      example: 'https://example.com/region/{domain.subdomains.0}',
    },
    {
      token: 'method',
      description: 'HTTP method.',
      example: 'https://example.com/route/{method}',
    },
    {
      token: 'ip',
      description: 'Client IP address.',
      example: 'https://example.com/audit?ip={ip}',
    },
    {
      token: 'user-agent',
      description: 'User-Agent header.',
      example: 'https://example.com/ua/{user-agent}',
    },
  ];

  readonly manipulatorReferences = [
    {
      token: 'to_lower_case',
      description: 'Lowercase.',
      example: '{path:to_lower_case}',
    },
    {
      token: 'to_upper_case',
      description: 'Uppercase.',
      example: '{domain.root:to_upper_case}',
    },
    {
      token: 'url_encode',
      description: 'URL encode.',
      example: '{query.q:url_encode}',
    },
    {
      token: 'url_decode',
      description: 'URL decode.',
      example: '{query.q:url_decode}',
    },
    {
      token: 'base64_encode',
      description: 'Base64 encode.',
      example: '{path:base64_encode}',
    },
    {
      token: 'to_iso_string',
      description: 'Convert a timestamp to ISO string.',
      example: '{time():to_iso_string}',
    },
    {
      token: 'auto_trailing_slash',
      description: 'Ensure trailing slash.',
      example: '{path:auto_trailing_slash}',
    },
    {
      token: 'multiply_10',
      description: 'Multiply by 10.',
      example: '{query.amount:multiply_10}',
    },
    {
      token: 'divide_10',
      description: 'Divide by 10.',
      example: '{query.amount:divide_10}',
    },
    {
      token: 'add_10',
      description: 'Add 10.',
      example: '{query.amount:add_10}',
    },
    {
      token: 'multiply_2',
      description: 'Multiply by 2.',
      example: '{query.amount:multiply_2}',
    },
    {
      token: 'round',
      description: 'Round number.',
      example: '{query.amount:round}',
    },
  ];

  readonly operatorReferences = [
    {
      token: '==',
      description: 'Equals',
      example: "{method} == 'POST'",
    },
    {
      token: '!=',
      description: 'Not equals',
      example: "{method} != 'POST'",
    },
    {
      token: '<',
      description: 'Less than',
      example: 'random(0,100) < 30',
    },
    {
      token: '>',
      description: 'Greater than',
      example: 'random(0,100) > 70',
    },
    {
      token: '<=',
      description: 'Less or equal',
      example: 'time() <= datetime("2024-01-01")',
    },
    {
      token: '>=',
      description: 'Greater or equal',
      example: 'time() >= datetime("2024-01-01")',
    },
    {
      token: '~=',
      description: 'Regex match',
      example: '{user-agent} ~= /mobile/i',
    },
    {
      token: 'includes',
      description: 'Substring match',
      example: "{path} includes 'admin'",
    },
  ];

  readonly functionReferences = [
    {
      token: 'time()',
      description: 'Current time in milliseconds (use :to_iso_string for ISO).',
      example: 'time() > datetime("2024-01-01")',
    },
    {
      token: 'random(0,100)',
      description: 'Random number in range (0-100).',
      example: 'random(0,100) < 30',
    },
    {
      token: "datetime('2024-01-01', 'Europe/Warsaw')",
      description: 'Parse date/time.',
      example: "datetime('2024-01-01', 'Europe/Warsaw')",
    },
  ];

  constructor() {
    this.domainGroupStore.searchList();
    this.usageStore.loadUsage();
    this.observeLinkMapSelection();
    this.observeLinkMapList();

    effect(() => {
      if (!this.pendingSubmit()) {
        return;
      }

      const key = this.submitKey();
      const loading = this.redirectRuleStore.isLoading()[key] ?? false;
      if (loading) {
        if (!this.submitLoadingSeen()) {
          this.submitLoadingSeen.set(true);
        }
        return;
      }

      if (!this.submitLoadingSeen()) {
        return;
      }

      const hadError = this.redirectRuleStore.errorSequence() !== this.submitErrorSequence();
      this.pendingSubmit.set(false);
      this.submitLoadingSeen.set(false);
      this.submitKey.set(CREATE_ENTITY_ID);

      if (!hadError) {
        this.redirectTestResultsStore.clearAll();
        if (!this.isEdit) {
          const lastValue = this.lastSubmittedValue();
          const testPrefill = lastValue ? this.buildTestPrefill(lastValue) : undefined;
          this.dialogRef.close({
            saved: true,
            openTestWizard: true,
            testPrefill,
          });
          return;
        }
        this.dialogRef.close({ saved: true });
      }
    });
  }

  private observeLinkMapSelection(): void {
    effect(() => {
      if (!this.isLinkMapRule()) {
        return;
      }

      if (this.ruleModel().pathMatch !== 'prefix') {
        this.ruleModel.update((model) => ({ ...model, pathMatch: 'prefix' }));
      }
      if (this.ruleModel().queryMatch !== 'ignore') {
        this.ruleModel.update((model) => ({ ...model, queryMatch: 'ignore' }));
      }

      const destinationValue = this.destinationValue();
      if (destinationValue) {
        this.ruleModel.update((model) => ({ ...model, destination: '' }));
      }
    });
  }

  private observeLinkMapList(): void {
    effect(() => {
      const groupId = this.selectedGroupId();
      if (!groupId) {
        this.linkMapsError.set(null);
        this.linkMapsErrorSequence.set(null);
        return;
      }
      this.loadLinkMaps(groupId);
    });

    effect(() => {
      const sequenceAtLoad = this.linkMapsErrorSequence();
      if (sequenceAtLoad === null) {
        return;
      }
      if (this.linkMapsLoading()) {
        return;
      }
      if (this.linkMapStore.errorSequence() > sequenceAtLoad) {
        this.linkMapsError.set(this.linkMapStore.lastError());
        this.linkMapStore.clearError();
      }
      this.linkMapsErrorSequence.set(null);
    });

    effect(() => {
      const linkMapId = this.ruleModel().linkMapId;
      if (!linkMapId) {
        return;
      }
      if (this.linkMapsLoading() || this.linkMapsError()) {
        return;
      }
      const exists = this.linkMaps().some((map) => map.id === linkMapId);
      if (!exists) {
        this.ruleModel.update((model) => ({ ...model, linkMapId: null }));
      }
    });
  }

  private loadLinkMaps(domainGroupId: string): void {
    this.linkMapsError.set(null);
    this.linkMapsErrorSequence.set(this.linkMapStore.errorSequence());
    this.linkMapStore.searchList({ domainGroupId });
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();

    // The `submit()` utility from '@angular/forms/signals' strictly blocks the callback execution
    // if the underlying form evaluates to `invalid` based on the schema and `required()` flags.
    // Because `destination` is empty when `linkMapId` is selected, the strict form schema thinks it's invalid.
    // By bypassing `submit()`, we rely solely on our own robust `canSubmit` and `submitDisabled` logic
    // which correctly validates the form conditionally.

    // Guard against 'Enter' key presses triggering submission when the form is not fully valid
    if (this.submitDisabled()) {
      return;
    }

    // Extract value safely directly from the signal holding the current state
    const value = this.ruleModel();
    this.lastSubmittedValue.set(value);

    const payload = {
      source: value.source,
      destination: this.isLinkMapRule() ? null : value.destination,
      statusCode: Number(value.statusCode),
      matchMethod: value.matchMethod,
      queryMatch: value.queryMatch,
      pathMatch: value.pathMatch,
      linkMapId: value.linkMapId,
      priority: Number(value.priority),
    };

    const key = this.isEdit && this.rule ? this.rule.id : CREATE_ENTITY_ID;
    this.submitKey.set(key);
    this.submitErrorSequence.set(this.redirectRuleStore.errorSequence());
    this.submitLoadingSeen.set(false);
    this.pendingSubmit.set(true);

    if (this.isEdit && this.rule) {
      this.redirectRuleStore.upsert({
        id: this.rule.id,
        entity: payload,
      });
    } else {
      this.redirectRuleStore.upsert({
        entity: {
          ...payload,
          domainGroupId: value.domainGroupId,
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  openCreateLinkMap(): void {
    if (!this.selectedGroupId() || this.linkMapCreateDisabled()) {
      return;
    }
    this.openLinkMapWizard();
  }

  openEditLinkMap(): void {
    const map = this.selectedLinkMap();
    if (!map) {
      return;
    }
    this.openLinkMapWizard(map.id);
  }

  private openLinkMapWizard(linkMapId?: string): void {
    const groupId = this.selectedGroupId();
    if (!groupId) {
      return;
    }
    const dialogRef = this.wizardDialog.openWizard<
      LinkMapFormDialogComponent,
      LinkMapDialogData,
      LinkMapDialogResult
    >(LinkMapFormDialogComponent, { domainGroupId: groupId, linkMapId }, 1);

    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.saved) {
        return;
      }
      this.linkMapStore.searchList({ domainGroupId: groupId }, true);
      this.usageStore.loadUsage();
      if (result.linkMapId) {
        this.ruleModel.update((model) => ({ ...model, linkMapId: result.linkMapId ?? null }));
      }
    });
  }

  private buildTestPrefill(model: RedirectRuleFormModel): RedirectTestFormPrefill {
    const source = model.source.trim();
    let path = '/';
    let query = '';

    if (source) {
      try {
        const parsed = splitPathWithQuery(source);
        path = parsed.path;
        query = parsed.query;
      } catch {
        const [rawPath, rawQuery] = source.split('?');
        path = ensureLeadingSlash(rawPath.trim());
        query = rawQuery?.trim() ?? '';
      }
    }

    return {
      domainGroupId: model.domainGroupId,
      path,
      query,
      method: model.matchMethod.length === 1 ? model.matchMethod[0] : '',
      expectedStatusCode: model.statusCode,
      expectedTarget: model.linkMapId ? '' : model.destination.trim(),
    };
  }

  private getFieldError(field: any): string | null {
    if (!field.touched()) {
      return null;
    }

    const errors = field.errors?.();
    if (!errors || errors.length === 0) {
      return null;
    }

    return errors[0].message ?? 'Invalid value';
  }

  private getFieldErrorMessage(field: any): string | null {
    const errors = field.errors?.();
    if (!errors || errors.length === 0) {
      return null;
    }

    const message = errors[0].message ?? 'Invalid value';
    return message === 'Invalid value' ? null : message;
  }
}
