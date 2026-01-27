import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { form, required, submit, FormField } from '@angular/forms/signals';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { applyZodField } from '../../core/forms/zod-validators';
import { redirectRuleSchema, redirectRuleStatusCodes } from './redirect-rule.schemas';
import type { RedirectRule } from '../../core/models/redirect-rule.model';

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
    `
  ]
})
export class RedirectRuleFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RedirectRuleFormDialogComponent>);
  private readonly data = inject<RedirectRuleDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly statusCodes = redirectRuleStatusCodes;
  readonly rule = this.data?.rule ?? null;
  readonly isEdit = !!this.rule;
  readonly dialogTitle = this.isEdit ? 'Edit redirect rule' : 'Create redirect rule';
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

  ruleModel = signal({
    domainGroupId: this.rule?.domainGroupId ?? this.data?.domainGroupId ?? '',
    source: this.rule?.source ?? '',
    destination: this.rule?.destination ?? '',
    statusCode: String(this.rule?.statusCode ?? 302),
    priority: String(this.rule?.priority ?? 0)
  });

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
    applyZodField(f.priority, redirectRuleSchema.shape.priority);
  });

  groupError = computed(() => this.getFieldError(this.ruleForm.domainGroupId()));
  sourceError = computed(() => this.getFieldError(this.ruleForm.source()));
  destinationError = computed(() => this.getFieldError(this.ruleForm.destination()));
  statusError = computed(() => this.getFieldError(this.ruleForm.statusCode()));
  priorityError = computed(() => this.getFieldError(this.ruleForm.priority()));
  scopeValid = computed(
    () => this.ruleForm.domainGroupId().valid() && this.ruleForm.priority().valid()
  );
  matchValid = computed(() => this.ruleForm.source().valid());
  destinationValid = computed(() => this.ruleForm.destination().valid());
  behaviorValid = computed(() => this.ruleForm.statusCode().valid());
  canSubmit = computed(() => {
    const { source, destination } = this.ruleModel();
    return (
      this.scopeValid() &&
      this.matchValid() &&
      this.destinationValid() &&
      this.behaviorValid() &&
      source.trim().length > 0 &&
      destination.trim().length > 0
    );
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
      example: '?brand={domain.root}'
    },
    {
      token: 'domain.extension',
      description: 'TLD like com/pl.',
      example: '?tld={domain.extension}'
    },
    {
      token: 'domain.subdomain',
      description: 'Subdomain portion only.',
      example: '/tenant/{domain.subdomain}'
    },
    {
      token: 'path',
      description: 'Path without leading slash.',
      example: 'https://site.com/{path}'
    },
    {
      token: 'segments.0',
      description: 'Path segment by index.',
      example: '/category/{segments.0}'
    },
    {
      token: 'query.ref',
      description: 'Query param by key.',
      example: 'https://target.com?ref={query.ref}'
    },
    {
      token: 'domain.subdomains.0',
      description: 'Subdomain by index.',
      example: '/region/{domain.subdomains.0}'
    },
    {
      token: 'method',
      description: 'HTTP method.',
      example: '/route/{method}'
    },
    {
      token: 'scheme',
      description: 'Protocol (http/https).',
      example: '{scheme}://example.com'
    },
    {
      token: 'ip',
      description: 'Client IP address.',
      example: '/audit?ip={ip}'
    },
    {
      token: 'userAgent',
      description: 'User-Agent header.',
      example: '/ua/{userAgent}'
    },
    {
      token: 'random',
      description: 'Random 0-1,000,000.',
      example: '?bucket={random}'
    },
    {
      token: 'geo.country',
      description: 'Country code (PL/US).',
      example: '/{geo.country}/pricing'
    }
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
    },
    {
      token: 'random',
      description: 'Random based on input.',
      example: '{0:100:random}'
    }
  ];

  readonly operatorReferences = [
    {
      token: '==',
      description: 'Equals',
      example: "{geo.country} == 'PL'"
    },
    {
      token: '!=',
      description: 'Not equals',
      example: "{method} != 'POST'"
    },
    {
      token: '<',
      description: 'Less than',
      example: '{0:100:random} < 30'
    },
    {
      token: '>',
      description: 'Greater than',
      example: '{random} > 500000'
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
      example: "{userAgent} ~= /mobile/i"
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
      description: 'Current time in milliseconds.',
      example: 'time() > datetime("2024-01-01")'
    },
    {
      token: "datetime('2024-01-01', 'Europe/Warsaw')",
      description: 'Parse date/time.',
      example: "datetime('2024-01-01', 'Europe/Warsaw')"
    }
  ];

  constructor() {
    this.domainGroupStore.searchList();
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.ruleForm, async (formValue) => {
      const value = formValue().value();
      const payload = {
        source: value.source,
        destination: value.destination,
        statusCode: Number(value.statusCode),
        priority: Number(value.priority)
      };

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
      this.dialogRef.close(true);
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
}
