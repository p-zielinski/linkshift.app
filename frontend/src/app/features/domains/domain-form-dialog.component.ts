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
import { DomainStore } from '../../core/store/domain.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { applyZodField } from '../../core/forms/zod-validators';
import { domainSchema } from './domain.schemas';
import { CREATE_ENTITY_ID } from '../../core/store/entity/entity-store.utils';
import { notifyStoreError } from '../../core/store/store-error.utils';
import {
  LoadingDialogComponent,
  type LoadingDialogData
} from '../../shared/components/loading-dialog/loading-dialog.component';
import type { Domain } from '../../core/models/domain.model';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';

export type DomainDialogData = {
  domainGroupId?: string;
  domain?: Domain;
};

@Component({
  selector: 'app-domain-form-dialog',
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
  templateUrl: './domain-form-dialog.component.html',
  styleUrl: './domain-form-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainFormDialogComponent {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<DomainFormDialogComponent>);
  private readonly data = inject<DomainDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly domainStore = inject(DomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly isSubmitting = signal(false);
  private readonly activeRequestId = signal<string | null>(null);
  private readonly errorSequenceAtSubmit = signal<number | null>(null);
  private loadingDialogRef: MatDialogRef<LoadingDialogComponent> | null = null;

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly domain = this.data?.domain ?? null;
  readonly isEdit = !!this.domain;
  readonly dialogTitle = this.isEdit ? 'Edit domain' : 'Create domain';
  readonly submitLabel = this.isEdit ? 'Save' : 'Create';
  readonly loadingMessage = this.isEdit ? 'Updating domain…' : 'Creating domain…';
  readonly effectiveSubmitLabel = computed(() => {
    if (this.isSaving()) {
      return this.isEdit ? 'Saving…' : 'Creating…';
    }
    return this.submitLabel;
  });

  domainModel = signal({
    name: this.domain?.name ?? '',
    domainGroupId: this.domain?.domainGroupId ?? this.data?.domainGroupId ?? ''
  });

  domainForm = form(this.domainModel, (f) => {
    required(f.name);
    required(f.domainGroupId);
    applyZodField(f.name, domainSchema.shape.name);
    applyZodField(f.domainGroupId, domainSchema.shape.domainGroupId);
  });

  nameError = computed(() => this.getFieldError(this.domainForm.name()));
  groupError = computed(() => this.getFieldError(this.domainForm.domainGroupId()));
  readonly isSaving = computed(() => {
    const requestId = this.activeRequestId();
    if (!requestId) {
      return false;
    }
    return !!this.domainStore.isLoading()[requestId];
  });
  readonly canSubmit = computed(
    () => this.domainForm.name().valid() && this.domainForm.domainGroupId().valid()
  );
  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'details',
      label: 'Details',
      title: 'Domain details',
      description: 'Set the domain name and group.',
      complete: this.canSubmit(),
    },
  ]);
  readonly groupMap = computed(() => {
    const map: Record<string, { name: string } | undefined> = {};
    for (const group of this.domainGroups()) {
      map[group.id] = { name: group.name };
    }
    return map;
  });
  readonly selectedGroupLabel = computed(() => {
    const groupId = this.domainModel().domainGroupId;
    if (!groupId) {
      return 'Select group';
    }
    return this.groupMap()[groupId]?.name ?? 'Select group';
  });

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
          errorSequence !== null && this.domainStore.errorSequence() > errorSequence;
        this.errorSequenceAtSubmit.set(null);

        if (hadError) {
          notifyStoreError(this.snackBar, this.domainStore);
        } else {
          this.dialogRef.close(true);
        }
      }
    });
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.domainForm, async (formValue) => {
      this.domainStore.clearError();
      this.isSubmitting.set(true);
      this.errorSequenceAtSubmit.set(this.domainStore.errorSequence());
      const id = this.domain?.id;
      this.activeRequestId.set(id ?? CREATE_ENTITY_ID);
      this.domainStore.upsert({ id, entity: formValue().value() });
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
