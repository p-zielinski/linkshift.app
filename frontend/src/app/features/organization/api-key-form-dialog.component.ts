import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormField, form, required } from '@angular/forms/signals';
import { z } from 'zod';
import { firstValueFrom } from 'rxjs';
import { applyZodField } from '../../core/forms/zod-validators';
import { ApiKeysApiService } from '../../core/api/api-keys-api.service';
import type { ApiKey } from '../../core/models/api-key.model';
import { extractErrorMessage } from '../../core/store/store-error.utils';

const apiKeyNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(120, 'Name is too long');

export type ApiKeyDialogData = {
  apiKey?: ApiKey;
};

export type ApiKeyDialogResult = {
  saved: boolean;
  createdKey?: string;
};

@Component({
  selector: 'app-api-key-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    FormField,
  ],
  templateUrl: './api-key-form-dialog.component.html',
})
export class ApiKeyFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ApiKeyFormDialogComponent>);
  private readonly data = inject<ApiKeyDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};
  private readonly apiKeysApi = inject(ApiKeysApiService);

  readonly saving = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly model = signal({
    name: this.data.apiKey?.name ?? '',
    neverExpires: !this.data.apiKey?.expiresAt,
    expiresAt: this.toDateTimeLocalInput(this.data.apiKey?.expiresAt ?? null),
  });

  readonly keyForm = form(this.model, (f) => {
    required(f.name);
    applyZodField(f.name, apiKeyNameSchema);
  });

  readonly isEdit = computed(() => !!this.data.apiKey);
  readonly title = computed(() => (this.isEdit() ? 'Edit API key' : 'Create API key'));
  readonly submitLabel = computed(() => (this.isEdit() ? 'Save changes' : 'Create key'));

  readonly nameError = computed(() => this.getFieldError(this.keyForm.name()));
  readonly hasExpirationWarning = computed(() => this.model().neverExpires);

  readonly expiresAtError = computed(() => {
    if (this.model().neverExpires) {
      return null;
    }

    const rawValue = this.model().expiresAt.trim();
    if (!rawValue) {
      return 'Expiration date is required unless never-expiring mode is selected.';
    }

    const date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) {
      return 'Invalid expiration date.';
    }
    if (date.getTime() <= Date.now()) {
      return 'Expiration date must be in the future.';
    }

    return null;
  });

  readonly canSubmit = computed(
    () => this.keyForm.name().valid() && !this.expiresAtError(),
  );

  onNeverExpiresChange(checked: boolean): void {
    this.model.update((value) => ({
      ...value,
      neverExpires: checked,
      expiresAt: checked ? '' : value.expiresAt,
    }));
  }

  onExpiresAtChange(value: string | null): void {
    this.model.update((current) => ({
      ...current,
      expiresAt: value ?? '',
    }));
  }

  async onSave(event?: Event): Promise<void> {
    event?.preventDefault();

    if (this.saving()) {
      return;
    }

    this.submitError.set(null);

    if (!this.canSubmit()) {
      this.keyForm.name().markAsTouched();
      return;
    }

    this.saving.set(true);

    const payload = {
      name: this.model().name.trim(),
      expiresAt: this.model().neverExpires
        ? null
        : this.toIsoOrNull(this.model().expiresAt),
    };

    try {
      if (this.data.apiKey) {
        await firstValueFrom(this.apiKeysApi.update(this.data.apiKey.id, payload));
        this.dialogRef.close({ saved: true } as ApiKeyDialogResult);
      } else {
        const created = await firstValueFrom(this.apiKeysApi.create(payload));
        this.dialogRef.close({
          saved: true,
          createdKey: created.key,
        } as ApiKeyDialogResult);
      }
    } catch (error) {
      this.submitError.set(extractErrorMessage(error, 'Unable to save API key.'));
    } finally {
      this.saving.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false } as ApiKeyDialogResult);
  }

  private toDateTimeLocalInput(value: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const localOffsetMs = date.getTimezoneOffset() * 60_000;
    const localDate = new Date(date.getTime() - localOffsetMs);
    return localDate.toISOString().slice(0, 16);
  }

  private toIsoOrNull(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
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
