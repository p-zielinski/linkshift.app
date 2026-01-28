import { Component, computed, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { form, required, submit, FormField } from '@angular/forms/signals';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { applyZodField } from '../../core/forms/zod-validators';
import {
  redirectRuleSchema,
  redirectRuleMatchMethods,
  redirectRuleStatusCodes
} from './redirect-rule.schemas';
import type { RedirectRule } from '../../core/models/redirect-rule.model';
import { CREATE_ENTITY_ID } from '../../core/store/entity/entity-store.utils';
import { $Enums } from '@shared/prisma-client';
import HttpMethod = $Enums.HttpMethod;

type WizardMode = 'guided' | 'fast';
type RedirectRuleFormModel = {
  domainGroupId: string;
  source: string;
  destination: string;
  statusCode: string;
  matchMethod: HttpMethod[];
  priority: string;
};

const WIZARD_MODE_KEY = 'redirectRulesWizardMode';

export type RedirectRuleDialogData = {
  domainGroupId?: string;
  rule?: RedirectRule;
};

@Component({
  selector: 'app-redirect-rule-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatStepperModule,
    MatExpansionModule,
    MatTooltipModule,
    FormField
  ],
  templateUrl: './redirect-rule-form-dialog.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      :host ::ng-deep .wizard-stepper {
        height: 100%;
        --mat-stepper-header-height: 44px;
      }

      :host ::ng-deep .wizard-stepper .mat-horizontal-stepper-wrapper {
        display: grid;
        grid-template-columns: 200px minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
        height: 100%;
      }

      :host ::ng-deep .wizard-stepper .mat-horizontal-stepper-header-wrapper {
        grid-column: 1;
        grid-row: 1;
      }

      :host ::ng-deep .wizard-stepper .mat-horizontal-stepper-header-container {
        grid-column: 1;
        grid-row: 1;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding: 8px 12px 12px 0;
        border-right: 1px solid var(--app-border-soft, rgba(0, 0, 0, 0.08));
        overflow: auto;
        white-space: normal;
      }

      :host ::ng-deep .wizard-stepper .mat-horizontal-stepper-header {
        justify-content: flex-start;
        width: 100%;
        padding: 8px 12px;
        border-radius: 12px;
      }

      :host ::ng-deep .wizard-stepper .mat-horizontal-stepper-header .mat-step-icon {
        margin-right: 12px;
      }

      :host ::ng-deep .wizard-stepper .mat-horizontal-content-container {
        grid-column: 2;
        grid-row: 1;
        padding: 20px 24px 32px 24px;
        overflow: auto;
        min-height: 0;
        width: 100%;
      }

      :host ::ng-deep .wizard-stepper .mat-stepper-horizontal-line {
        display: none;
      }

      :host ::ng-deep .wizard-tooltip {
        white-space: pre-line;
      }
    `
  ]
})
export class RedirectRuleFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RedirectRuleFormDialogComponent>);
  private readonly data = inject<RedirectRuleDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly matchMethodOptions = redirectRuleMatchMethods;
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

  private readonly initialStatusCode = this.rule?.statusCode ?? 302;

  ruleModel = signal({
    domainGroupId: this.rule?.domainGroupId ?? this.data?.domainGroupId ?? '',
    source: this.rule?.source ?? '',
    destination: this.rule?.destination ?? 'https://',
    statusCode: String(this.initialStatusCode),
    matchMethod: this.rule?.matchMethod ?? [],
    priority: String(this.rule?.priority ?? 0)
  });

  readonly wizardMode = signal<WizardMode>('guided');
  readonly pendingSubmit = signal(false);
  private readonly submitKey = signal(CREATE_ENTITY_ID);
  private readonly submitErrorSequence = signal(0);
  private readonly submitLoadingSeen = signal(false);

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

  sourceError = computed(() => this.getFieldError(this.ruleForm.source()));
  destinationError = computed(() => this.getFieldError(this.ruleForm.destination()));
  statusError = computed(() => this.getFieldError(this.ruleForm.statusCode()));
  matchMethodError = computed(() => this.getFieldError(this.ruleForm.matchMethod()));
  priorityError = computed(() => this.getFieldError(this.ruleForm.priority()));
  scopeValid = computed(
    () => this.ruleForm.domainGroupId().valid() && this.ruleForm.priority().valid()
  );
  private readonly sourceValue = computed(() => this.ruleModel().source.trim());
  private readonly destinationValue = computed(() => this.ruleModel().destination.trim());
  private readonly destinationHasProtocol = computed(() =>
    /^https?:\/\//i.test(this.destinationValue())
  );
  readonly statusCodeOptions = computed(() => redirectRuleStatusCodes);

  matchValid = computed(() => this.ruleForm.source().valid() && this.sourceValue().length > 0);
  destinationValid = computed(
    () =>
      this.ruleForm.destination().valid() &&
      this.destinationValue().length > 0 &&
      this.destinationHasProtocol()
  );
  statusValid = computed(() => this.ruleForm.statusCode().valid());
  canSubmit = computed(() => {
    return (
      this.scopeValid() &&
      this.matchValid() &&
      this.destinationValid() &&
      this.ruleForm.statusCode().valid() &&
      this.ruleForm.matchMethod().valid() &&
      this.sourceValue().length > 0 &&
      this.destinationValue().length > 0
    );
  });
  readonly submitDisabled = computed(
    () => !this.canSubmit() || this.ruleForm().submitting() || this.pendingSubmit()
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
    if (!destinationValue) {
      errors.add('Destination is required.');
    } else if (!this.destinationHasProtocol()) {
      errors.add('Destination must be a full URL starting with http:// or https://.');
    } else if (!this.ruleForm.destination().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.destination());
      errors.add(message ?? 'Destination is invalid.');
    }

    if (!this.ruleForm.statusCode().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.statusCode());
      errors.add(message ?? 'Status code is invalid.');
    }

    if (!this.ruleForm.matchMethod().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.matchMethod());
      errors.add(message ?? 'Request method is invalid.');
    }

    if (!this.ruleForm.priority().valid()) {
      const message = this.getFieldErrorMessage(this.ruleForm.priority());
      errors.add(message ?? 'Priority is invalid.');
    }

    return Array.from(errors).join('\n');
  });

  readonly variableReferences = [
    {
      token: 'domain.fqdn',
      description: 'Full hostname.',
      example: 'https://{domain.fqdn}/welcome'
    },
    {
      token: 'domain.label',
      description: 'Hostname without TLD.',
      example: 'https://{domain.label}.example.com'
    },
    {
      token: 'domain.root',
      description: 'Root label only.',
      example: 'https://store.example.com?brand={domain.root}'
    },
    {
      token: 'domain.extension',
      description: 'TLD like com/pl.',
      example: 'https://example.com?tld={domain.extension}'
    },
    {
      token: 'domain.subdomain',
      description: 'Subdomain portion only.',
      example: 'https://example.com/tenant/{domain.subdomain}'
    },
    {
      token: 'path',
      description: 'Path without leading slash.',
      example: 'https://site.com/{path}'
    },
    {
      token: 'segments.0',
      description: 'Path segment by index.',
      example: 'https://example.com/category/{segments.0}'
    },
    {
      token: 'query.ref',
      description: 'Query param by key.',
      example: 'https://target.com?ref={query.ref}'
    },
    {
      token: 'domain.subdomains.0',
      description: 'Subdomain by index.',
      example: 'https://example.com/region/{domain.subdomains.0}'
    },
    {
      token: 'method',
      description: 'HTTP method.',
      example: 'https://example.com/route/{method}'
    },
    {
      token: 'scheme',
      description: 'Protocol (http/https).',
      example: 'https://example.com?proto={scheme}'
    },
    {
      token: 'ip',
      description: 'Client IP address.',
      example: 'https://example.com/audit?ip={ip}'
    },
    {
      token: 'user-agent',
      description: 'User-Agent header.',
      example: 'https://example.com/ua/{user-agent}'
    },
  ];

  readonly manipulatorReferences = [
    {
      token: 'to_lower_case',
      description: 'Lowercase.',
      example: '{path:to_lower_case}'
    },
    {
      token: 'to_upper_case',
      description: 'Uppercase.',
      example: '{domain.root:to_upper_case}'
    },
    {
      token: 'url_encode',
      description: 'URL encode.',
      example: '{query.q:url_encode}'
    },
    {
      token: 'url_decode',
      description: 'URL decode.',
      example: '{query.q:url_decode}'
    },
    {
      token: 'base64_encode',
      description: 'Base64 encode.',
      example: '{path:base64_encode}'
    },
    {
      token: 'to_iso_string',
      description: 'Convert a timestamp to ISO string.',
      example: '{time():to_iso_string}'
    },
    {
      token: 'auto_trailing_slash',
      description: 'Ensure trailing slash.',
      example: '{path:auto_trailing_slash}'
    },
    {
      token: 'multiply_10',
      description: 'Multiply by 10.',
      example: '{query.amount:multiply_10}'
    },
    {
      token: 'divide_10',
      description: 'Divide by 10.',
      example: '{query.amount:divide_10}'
    },
    {
      token: 'add_10',
      description: 'Add 10.',
      example: '{query.amount:add_10}'
    },
    {
      token: 'multiply_2',
      description: 'Multiply by 2.',
      example: '{query.amount:multiply_2}'
    },
    {
      token: 'round',
      description: 'Round number.',
      example: '{query.amount:round}'
    }
  ];

  readonly operatorReferences = [
    {
      token: '==',
      description: 'Equals',
      example: "{method} == 'POST'"
    },
    {
      token: '!=',
      description: 'Not equals',
      example: "{method} != 'POST'"
    },
    {
      token: '<',
      description: 'Less than',
      example: 'random(0,100) < 30'
    },
    {
      token: '>',
      description: 'Greater than',
      example: 'random(0,100) > 70'
    },
    {
      token: '<=',
      description: 'Less or equal',
      example: 'time() <= datetime("2024-01-01")'
    },
    {
      token: '>=',
      description: 'Greater or equal',
      example: 'time() >= datetime("2024-01-01")'
    },
    {
      token: '~=',
      description: 'Regex match',
      example: "{user-agent} ~= /mobile/i"
    },
    {
      token: 'includes',
      description: 'Substring match',
      example: "{path} includes 'admin'"
    }
  ];

  readonly functionReferences = [
    {
      token: 'time()',
      description: 'Current time in milliseconds (use :to_iso_string for ISO).',
      example: 'time() > datetime("2024-01-01")'
    },
    {
      token: 'random(0,100)',
      description: 'Random number in range (0-100).',
      example: 'random(0,100) < 30'
    },
    {
      token: "datetime('2024-01-01', 'Europe/Warsaw')",
      description: 'Parse date/time.',
      example: "datetime('2024-01-01', 'Europe/Warsaw')"
    }
  ];

  constructor() {
    this.domainGroupStore.searchList();
    this.restoreWizardMode();

    effect(
      () => {
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
          this.dialogRef.close(true);
        }
      },
      { allowSignalWrites: true }
    );
  }

  toggleWizardMode(): void {
    const next: WizardMode = this.wizardMode() === 'guided' ? 'fast' : 'guided';
    this.wizardMode.set(next);
    this.persistWizardMode(next);
  }

  private restoreWizardMode(): void {
    try {
      const stored =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(WIZARD_MODE_KEY)
          : null;
      if (stored === 'fast' || stored === 'guided') {
        this.wizardMode.set(stored);
      }
    } catch {
      // Ignore storage errors and keep default.
    }
  }

  private persistWizardMode(mode: WizardMode): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(WIZARD_MODE_KEY, mode);
      }
    } catch {
      // Ignore storage errors.
    }
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.ruleForm, async (formValue) => {
      const value = formValue().value();
      const payload = {
        source: value.source,
        destination: value.destination,
        statusCode: Number(value.statusCode),
        matchMethod: value.matchMethod,
        priority: Number(value.priority)
      };

      const key = this.isEdit && this.rule ? this.rule.id : CREATE_ENTITY_ID;
      this.submitKey.set(key);
      this.submitErrorSequence.set(this.redirectRuleStore.errorSequence());
      this.submitLoadingSeen.set(false);
      this.pendingSubmit.set(true);

      if (this.isEdit && this.rule) {
        this.redirectRuleStore.upsert({
          id: this.rule.id,
          entity: payload
        });
      } else {
        this.redirectRuleStore.upsert({
          entity: {
            ...payload,
            domainGroupId: value.domainGroupId
          }
        });
      }
      return undefined;
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
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
