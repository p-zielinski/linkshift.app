import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { form, required, submit, FormField } from '@angular/forms/signals';
import { applyZodField } from '../../core/forms/zod-validators';
import { domainGroupSchema } from './domain-group.schemas';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { CREATE_ENTITY_ID } from '../../core/store/entity/entity-store.utils';
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
    FormField,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective
  ],
  templateUrl: './domain-group-form-dialog.component.html',
  styleUrl: './domain-group-form-dialog.component.css'
})
export class DomainGroupFormDialogComponent {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<DomainGroupFormDialogComponent>);
  private readonly data = inject<DomainGroupDialogData | null>(MAT_DIALOG_DATA, {
    optional: true
  });
  private readonly store = inject(DomainGroupStore);
  private readonly isSubmitting = signal(false);
  private readonly activeRequestId = signal<string | null>(null);
  private readonly errorSequenceAtSubmit = signal<number | null>(null);
  private loadingDialogRef: MatDialogRef<LoadingDialogComponent> | null = null;

  readonly group = this.data?.group ?? null;
  readonly isEdit = !!this.group;
  readonly dialogTitle = this.isEdit ? 'Edit domain group' : 'Create domain group';
  readonly submitLabel = this.isEdit ? 'Save' : 'Create';
  readonly loadingMessage = this.isEdit ? 'Updating domain group...' : 'Creating domain group...';

  groupModel = signal({
    name: this.group?.name ?? ''
  });

  groupForm = form(this.groupModel, (f) => {
    required(f.name);
    applyZodField(f.name, domainGroupSchema.shape.name);
  });

  nameError = computed(() => this.getFieldError(this.groupForm.name()));
  readonly isSaving = computed(() => {
    const requestId = this.activeRequestId();
    if (!requestId) {
      return false;
    }
    return !!this.store.isLoading()[requestId];
  });
  readonly canSubmit = computed(() => this.groupForm.name().valid());
  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'details',
      label: 'Details',
      title: 'Domain group details',
      description: 'Name the domain group.',
      complete: this.canSubmit(),
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

        if (!hadError) {
          this.dialogRef.close(true);
        }
      }
    });
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.groupForm, async (formValue) => {
      this.store.clearError();
      this.isSubmitting.set(true);
      this.errorSequenceAtSubmit.set(this.store.errorSequence());
      const id = this.group?.id;
      this.activeRequestId.set(id ?? CREATE_ENTITY_ID);
      this.store.upsert({
        id,
        entity: formValue().value()
      });
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
