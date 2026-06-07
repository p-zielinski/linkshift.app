import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { form, required, submit, FormField } from '@angular/forms/signals';
import { applyZodField } from '../../core/forms/zod-validators';
import { domainGroupSchema } from './domain-group.schemas';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { CREATE_ENTITY_ID } from '../../core/store/entity/entity-store.utils';
import { notifyStoreError } from '../../core/store/store-error.utils';
import {
  LoadingDialogComponent,
  type LoadingDialogData
} from '../../shared/components/loading-dialog/loading-dialog.component';
import type { DomainGroup } from '../../core/models/domain-group.model';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';
import {
  DEFAULT_ROBOTS_POLICY,
  MAX_CUSTOM_ROBOTS_CONTENT_LENGTH,
  type RobotsPolicy,
} from '@shared/models/robots-policy.model';

export type DomainGroupDialogData = {
  group?: DomainGroup;
};

@Component({
  selector: 'app-domain-group-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    FormField,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective
  ],
  templateUrl: './domain-group-form-dialog.component.html',
  styleUrl: './domain-group-form-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainGroupFormDialogComponent {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<DomainGroupFormDialogComponent>);
  private readonly data = inject<DomainGroupDialogData | null>(MAT_DIALOG_DATA, {
    optional: true
  });
  private readonly store = inject(DomainGroupStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly isSubmitting = signal(false);
  private readonly activeRequestId = signal<string | null>(null);
  private readonly errorSequenceAtSubmit = signal<number | null>(null);
  private loadingDialogRef: MatDialogRef<LoadingDialogComponent> | null = null;
  readonly activeStepId = signal('details');

  readonly group = this.data?.group ?? null;
  readonly isEdit = !!this.group;
  readonly dialogTitle = this.isEdit ? 'Edit domain group' : 'Create domain group';
  readonly submitLabel = this.isEdit ? 'Save' : 'Create';
  readonly loadingMessage = this.isEdit ? 'Updating domain group…' : 'Creating domain group…';
  readonly effectiveSubmitLabel = computed(() => {
    if (this.isSaving()) {
      return this.isEdit ? 'Saving…' : 'Creating…';
    }
    return this.submitLabel;
  });
  readonly maxCustomRobotsContentLength = MAX_CUSTOM_ROBOTS_CONTENT_LENGTH;
  readonly robotsPolicyOptions: { value: RobotsPolicy; label: string }[] = [
    { value: 'NONE', label: 'Do not use (None)' },
    { value: 'ALLOW_ALL', label: 'Allow all' },
    { value: 'DISALLOW_ALL', label: 'Disallow all' },
    { value: 'DISALLOW_BAD_BOTS', label: 'Disallow bad bots' },
    { value: 'CUSTOM', label: 'Custom' },
  ];

  groupModel = signal({
    name: this.group?.name ?? '',
    robotsPolicy: this.group?.robotsPolicy ?? DEFAULT_ROBOTS_POLICY,
    customRobotsContent: this.group?.customRobotsContent ?? '',
  });

  groupForm = form(this.groupModel, (f) => {
    required(f.name);
    required(f.robotsPolicy);
    applyZodField(f.name, domainGroupSchema.shape.name);
    applyZodField(f.robotsPolicy, domainGroupSchema.shape.robotsPolicy);
    applyZodField(f.customRobotsContent, domainGroupSchema.shape.customRobotsContent);
  });

  nameError = computed(() => this.getFieldError(this.groupForm.name()));
  readonly robotsPolicyError = computed(() => this.getFieldError(this.groupForm.robotsPolicy()));
  readonly isCustomPolicy = computed(() => this.groupModel().robotsPolicy === 'CUSTOM');
  readonly robotsPolicyLabel = computed(
    () =>
      this.robotsPolicyOptions.find((option) => option.value === this.groupModel().robotsPolicy)?.label ??
      'Do not use (None)'
  );
  readonly customRobotsContentError = computed(() => {
    if (!this.isCustomPolicy()) {
      return null;
    }

    const field = this.groupForm.customRobotsContent();
    if (!field.touched()) {
      return null;
    }

    const value = this.groupModel().customRobotsContent ?? '';
    if (!value.trim()) {
      return 'Custom robots.txt content is required.';
    }
    if (value.length > this.maxCustomRobotsContentLength) {
      return `Content is too long (max ${this.maxCustomRobotsContentLength} characters).`;
    }

    return this.getFieldError(field);
  });
  readonly isSaving = computed(() => {
    const requestId = this.activeRequestId();
    if (!requestId) {
      return false;
    }
    return !!this.store.isLoading()[requestId];
  });
  readonly robotsSectionValid = computed(() => {
    if (!this.groupForm.robotsPolicy().valid()) {
      return false;
    }
    if (!this.isCustomPolicy()) {
      return true;
    }
    const value = this.groupModel().customRobotsContent ?? '';
    return (
      value.trim().length > 0 && value.length <= this.maxCustomRobotsContentLength
    );
  });
  readonly canSubmit = computed(
    () => this.groupForm.name().valid() && this.robotsSectionValid()
  );
  readonly submitDisabled = computed(
    () =>
      this.activeStepId() !== 'robots' ||
      this.groupForm().submitting() ||
      !this.canSubmit() ||
      this.isSaving(),
  );
  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'details',
      label: 'Details',
      title: 'Domain group details',
      description: 'Name the domain group.',
      complete: this.groupForm.name().valid(),
    },
    {
      id: 'robots',
      label: 'Robots.txt',
      title: 'Robots.txt policy',
      description: 'Choose built-in policy or provide custom content.',
      complete: this.robotsSectionValid(),
    },
  ]);

  constructor() {
    effect(() => {
      if (!this.isSubmitting()) {
        return;
      }

      const saving = this.isSaving();
      if (saving && !this.loadingDialogRef) {
        const data: LoadingDialogData = { message: this.loadingMessage };
        this.loadingDialogRef = this.dialog.open(LoadingDialogComponent, {
          width: '360px',
          disableClose: true,
          data
        });
        return;
      }

      if (!saving && this.loadingDialogRef) {
        this.loadingDialogRef.close();
        this.loadingDialogRef = null;
        this.isSubmitting.set(false);
        this.activeRequestId.set(null);
        const errorSequence = this.errorSequenceAtSubmit();
        const hadError =
          errorSequence !== null && this.store.errorSequence() > errorSequence;
        this.errorSequenceAtSubmit.set(null);

        if (hadError) {
          notifyStoreError(this.snackBar, this.store);
        } else {
          this.dialogRef.close(true);
        }
      }
    });
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    if (this.submitDisabled()) {
      return;
    }
    await submit(this.groupForm, async (formValue) => {
      if (this.isCustomPolicy() && !this.robotsSectionValid()) {
        this.groupForm.customRobotsContent().markAsTouched();
        return undefined;
      }

      this.store.clearError();
      this.isSubmitting.set(true);
      this.errorSequenceAtSubmit.set(this.store.errorSequence());
      const id = this.group?.id;
      this.activeRequestId.set(id ?? CREATE_ENTITY_ID);
      const value = formValue().value();
      this.store.upsert({
        id,
        entity: {
          ...value,
          customRobotsContent:
            value.robotsPolicy === 'CUSTOM'
              ? this.normalizeCustomRobotsContent(value.customRobotsContent)
              : null,
        }
      });
      return undefined;
    });
  }

  onStepChange(stepId: string): void {
    this.activeStepId.set(stepId);
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

  private normalizeCustomRobotsContent(value: string | undefined): string | null {
    if (!value || value.trim().length === 0) {
      return null;
    }

    return value;
  }
}
