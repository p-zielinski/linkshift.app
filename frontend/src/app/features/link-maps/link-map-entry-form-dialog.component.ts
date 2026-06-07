import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormField, form, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import { LinkMapEntriesApiService } from '../../core/api/link-map-entries-api.service';
import { applyZodField } from '../../core/forms/zod-validators';
import type { LinkMapEntry } from '../../core/models/link-map.model';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';

const LINK_MAP_KEY_ALLOWED_REGEX = /^[A-Za-z0-9\-._~!$&'()*+,;=:@/?]*$/;

const keySchema = z
  .string()
  .trim()
  .min(1, 'Key is required')
  .max(1024, 'Key is too long (max 1024 chars)')
  .refine((value) => !/^https?:\/\//i.test(value), 'Key must be a path/query value, not a full URL')
  .refine((value) => !/[\s%#]/.test(value), 'Key may not contain spaces, %, or # characters')
  .refine((value) => LINK_MAP_KEY_ALLOWED_REGEX.test(value), 'Key contains unsupported characters');

const normalizeDestinationValue = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (trimmed.includes('://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const destinationSchema = z
  .string()
  .trim()
  .min(1, 'Destination is required')
  .max(16384, 'Destination is too long')
  .refine((value) => /^https?:\/\//i.test(normalizeDestinationValue(value)), 'Use a full URL like https://example.com');

export type LinkMapEntryDialogData = {
  linkMapId: string;
  caseSensitive: boolean;
  entry?: LinkMapEntry;
};

export type LinkMapEntryDialogResult = {
  saved: boolean;
};

@Component({
  selector: 'app-link-map-entry-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormField,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective,
  ],
  templateUrl: './link-map-entry-form-dialog.component.html',
  styleUrl: './link-map-entry-form-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkMapEntryFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<LinkMapEntryFormDialogComponent>);
  private readonly data = inject<LinkMapEntryDialogData>(MAT_DIALOG_DATA);
  private readonly api = inject(LinkMapEntriesApiService);

  readonly saving = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly isEdit = computed(() => !!this.data.entry);
  readonly title = computed(() => (this.isEdit() ? 'Edit entry' : 'Add entry'));

  readonly model = signal({
    key: this.data.entry?.key ?? '',
    destination: this.data.entry?.destination ?? 'https://',
  });

  readonly entryForm = form(this.model, (f) => {
    required(f.key);
    required(f.destination);
    applyZodField(f.key, keySchema);
    applyZodField(f.destination, destinationSchema);
  });

  readonly keyError = computed(() => this.getFieldError(this.entryForm.key()));
  readonly destinationError = computed(() => this.getFieldError(this.entryForm.destination()));

  readonly canSubmit = computed(
    () => this.entryForm.key().valid() && this.entryForm.destination().valid(),
  );

  readonly submitTooltip = computed(() => {
    if (this.canSubmit()) {
      return '';
    }

    const messages: string[] = [];
    if (!this.entryForm.key().valid()) {
      messages.push(this.getFieldErrorMessage(this.entryForm.key()) ?? 'Key is invalid.');
    }
    if (!this.entryForm.destination().valid()) {
      messages.push(
        this.getFieldErrorMessage(this.entryForm.destination()) ?? 'Destination is invalid.',
      );
    }
    return messages.join('\n');
  });

  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'entry',
      label: 'Entry',
      title: 'Entry details',
      description: 'Define key and destination for this map entry.',
      complete: this.canSubmit(),
    },
  ]);

  onKeyBlur(): void {
    const current = this.model().key;
    const normalized = this.normalizeKey(current);
    if (normalized !== current) {
      this.model.update((value) => ({ ...value, key: normalized }));
    }
  }

  onDestinationBlur(): void {
    const current = this.model().destination;
    const normalized = normalizeDestinationValue(current);
    if (normalized !== current) {
      this.model.update((value) => ({ ...value, destination: normalized }));
    }
  }

  async onSave(event?: Event): Promise<void> {
    event?.preventDefault();
    if (this.saving()) {
      return;
    }

    this.submitError.set(null);

    if (!this.canSubmit()) {
      this.entryForm.key().markAsTouched();
      this.entryForm.destination().markAsTouched();
      return;
    }

    this.saving.set(true);

    try {
      const payload = {
        key: this.normalizeKey(this.model().key),
        destination: normalizeDestinationValue(this.model().destination),
      };

      if (this.data.entry) {
        await firstValueFrom(this.api.update(this.data.entry.id, payload));
      } else {
        await firstValueFrom(
          this.api.create({
            linkMapId: this.data.linkMapId,
            ...payload,
          }),
        );
      }

      this.dialogRef.close({ saved: true } as LinkMapEntryDialogResult);
    } catch (error) {
      this.submitError.set(extractErrorMessage(error, "Couldn't save entry."));
    } finally {
      this.saving.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false } as LinkMapEntryDialogResult);
  }

  private normalizeKey(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    return this.data.caseSensitive ? trimmed : trimmed.toLowerCase();
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

    return errors[0].message ?? null;
  }
}
