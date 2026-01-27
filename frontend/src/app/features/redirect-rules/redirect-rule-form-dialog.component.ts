import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { form, required, submit, FormField } from '@angular/forms/signals';
import { RedirectRuleStore } from '../../core/store/redirect-rule.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { applyZodField } from '../../core/forms/zod-validators';
import { redirectRuleSchema, redirectRuleStatusCodes } from './redirect-rule.schemas';

export type RedirectRuleDialogData = {
  domainGroupId?: string;
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
    FormField
  ],
  templateUrl: './redirect-rule-form-dialog.component.html'
})
export class RedirectRuleFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RedirectRuleFormDialogComponent>);
  private readonly data = inject<RedirectRuleDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly redirectRuleStore = inject(RedirectRuleStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly statusCodes = redirectRuleStatusCodes;

  ruleModel = signal({
    domainGroupId: this.data?.domainGroupId ?? '',
    source: '',
    destination: '',
    statusCode: '302',
    priority: '0'
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

  constructor() {
    this.domainGroupStore.searchList();
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.ruleForm, async (formValue) => {
      const value = formValue().value();
      this.redirectRuleStore.upsert({
        entity: {
          ...value,
          statusCode: Number(value.statusCode),
          priority: Number(value.priority)
        }
      });
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
