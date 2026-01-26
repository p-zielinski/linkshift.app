import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { form, required, submit, FormField } from '@angular/forms/signals';
import { applyZodField } from '../../core/forms/zod-validators';
import { domainGroupSchema } from './domain-group.schemas';
import { DomainGroupStore } from '../../core/store/domain-group.store';

@Component({
  selector: 'app-domain-group-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormField
  ],
  templateUrl: './domain-group-form-dialog.component.html'
})
export class DomainGroupFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DomainGroupFormDialogComponent>);
  private readonly store = inject(DomainGroupStore);

  groupModel = signal({
    name: ''
  });

  groupForm = form(this.groupModel, (f) => {
    required(f.name);
    applyZodField(f.name, domainGroupSchema.shape.name);
  });

  nameError = computed(() => this.getFieldError(this.groupForm.name()));

  async onSubmit(): Promise<void> {
    await submit(this.groupForm, async (formValue) => {
      this.store.upsert({ entity: formValue().value() });
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
