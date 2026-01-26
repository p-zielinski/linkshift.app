import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { form, required, submit, FormField } from '@angular/forms/signals';
import { DomainStore } from '../../core/store/domain.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { applyZodField } from '../../core/forms/zod-validators';
import { domainSchema } from './domain.schemas';

export type DomainDialogData = {
  domainGroupId?: string;
};

@Component({
  selector: 'app-domain-form-dialog',
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
  template: `
    <div class="dialog">
      <h3>Create domain</h3>
      <form class="form-grid" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline">
          <mat-label>Domain name</mat-label>
          <input matInput type="text" [formField]="domainForm.name" />
          @if (nameError(); as error) {
            <mat-error>{{ error }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Domain group</mat-label>
          <mat-select [formField]="domainForm.domainGroupId">
            @for (group of domainGroups(); track group.id) {
              <mat-option [value]="group.id">{{ group.name }}</mat-option>
            }
          </mat-select>
          @if (groupError(); as error) {
            <mat-error>{{ error }}</mat-error>
          }
        </mat-form-field>

        <div class="form-actions">
          <button mat-stroked-button type="button" (click)="onCancel()">
            Cancel
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="domainForm().submitting()">
            <mat-icon>add</mat-icon>
            <span>Create</span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class DomainFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DomainFormDialogComponent>);
  private readonly data = inject<DomainDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly domainStore = inject(DomainStore);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly domainGroups = this.domainGroupStore.selectList();

  domainModel = signal({
    name: '',
    domainGroupId: this.data?.domainGroupId ?? ''
  });

  domainForm = form(this.domainModel, (f) => {
    required(f.name);
    required(f.domainGroupId);
    applyZodField(f.name, domainSchema.shape.name);
    applyZodField(f.domainGroupId, domainSchema.shape.domainGroupId);
  });

  nameError = computed(() => this.getFieldError(this.domainForm.name()));
  groupError = computed(() => this.getFieldError(this.domainForm.domainGroupId()));

  constructor() {
    this.domainGroupStore.searchList();
  }

  async onSubmit(): Promise<void> {
    await submit(this.domainForm, async (formValue) => {
      this.domainStore.upsert({ entity: formValue().value() });
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
