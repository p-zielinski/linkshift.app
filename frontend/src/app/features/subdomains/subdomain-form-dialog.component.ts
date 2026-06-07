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
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import { applyZodField } from '../../core/forms/zod-validators';
import { subdomainSchema } from './subdomain.schemas';
import { CREATE_ENTITY_ID } from '../../core/store/entity/entity-store.utils';
import { notifyStoreError } from '../../core/store/store-error.utils';
import {
  LoadingDialogComponent,
  type LoadingDialogData
} from '../../shared/components/loading-dialog/loading-dialog.component';
import type { Subdomain } from '../../core/models/subdomain.model';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';

export type SubdomainDialogData = {
  domainGroupId?: string;
  subdomain?: Subdomain;
};

@Component({
  selector: 'app-subdomain-form-dialog',
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
  templateUrl: './subdomain-form-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubdomainFormDialogComponent {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<SubdomainFormDialogComponent>);
  private readonly data = inject<SubdomainDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly subdomainStore = inject(SubdomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly isSubmitting = signal(false);
  private readonly activeRequestId = signal<string | null>(null);
  private readonly errorSequenceAtSubmit = signal<number | null>(null);
  private loadingDialogRef: MatDialogRef<LoadingDialogComponent> | null = null;

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly subdomain = this.data?.subdomain ?? null;
  readonly isEdit = !!this.subdomain;
  readonly dialogTitle = this.isEdit ? 'Edit subdomain' : 'Create subdomain';
  readonly submitLabel = this.isEdit ? 'Save' : 'Create';
  readonly loadingMessage = this.isEdit ? 'Updating subdomain…' : 'Creating subdomain…';
  readonly effectiveSubmitLabel = computed(() => {
    if (this.isSaving()) {
      return this.isEdit ? 'Saving…' : 'Creating…';
    }
    return this.submitLabel;
  });

  subdomainModel = signal({
    name: this.subdomain?.name ?? '',
    domainGroupId: this.subdomain?.domainGroupId ?? this.data?.domainGroupId ?? ''
  });

  subdomainForm = form(this.subdomainModel, (f) => {
    required(f.name);
    required(f.domainGroupId);
    applyZodField(f.name, subdomainSchema.shape.name);
    applyZodField(f.domainGroupId, subdomainSchema.shape.domainGroupId);
  });

  nameError = computed(() => this.getFieldError(this.subdomainForm.name()));
  groupError = computed(() => this.getFieldError(this.subdomainForm.domainGroupId()));
  readonly isSaving = computed(() => {
    const requestId = this.activeRequestId();
    if (!requestId) {
      return false;
    }
    return !!this.subdomainStore.isLoading()[requestId];
  });
  readonly canSubmit = computed(
    () => this.subdomainForm.name().valid() && this.subdomainForm.domainGroupId().valid()
  );
  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'details',
      label: 'Details',
      title: 'Subdomain details',
      description: 'Set the subdomain name and group.',
      complete: this.canSubmit(),
    },
  ]);

  constructor() {
    this.domainGroupStore.searchList();

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
          errorSequence !== null && this.subdomainStore.errorSequence() > errorSequence;
        this.errorSequenceAtSubmit.set(null);

        if (hadError) {
          notifyStoreError(this.snackBar, this.subdomainStore);
        } else {
          this.dialogRef.close(true);
        }
      }
    });
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.subdomainForm, async (formValue) => {
      this.subdomainStore.clearError();
      this.isSubmitting.set(true);
      this.errorSequenceAtSubmit.set(this.subdomainStore.errorSequence());
      const id = this.subdomain?.id;
      this.activeRequestId.set(id ?? CREATE_ENTITY_ID);
      this.subdomainStore.upsert({ id, entity: formValue().value() });
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
