import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormField, form, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import { LinkMapsApiService } from '../../core/api/link-maps-api.service';
import { applyZodField } from '../../core/forms/zod-validators';
import type { LinkMap, LinkMapQueryMatch } from '../../core/models/link-map.model';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';

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

const isValidDestination = (value: string, allowEmpty: boolean): boolean => {
  const normalized = normalizeDestinationValue(value);
  if (!normalized) {
    return allowEmpty;
  }
  try {
    const url = new URL(normalized);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    const host = url.hostname;
    if (host === 'localhost') {
      return true;
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      return true;
    }
    return host.includes('.');
  } catch {
    return false;
  }
};

const fallbackSchema = z
  .string()
  .trim()
  .min(1, 'Fallback destination is required')
  .max(16384, 'Fallback destination is too long')
  .refine((value) => isValidDestination(value, false), 'Use a full URL like https://example.com');

const queryMatchOptions: Array<{ value: LinkMapQueryMatch; label: string; hint: string }> = [
  { value: 'ignore', label: 'Ignore query', hint: 'Only the path part of the key matters.' },
  { value: 'exact', label: 'Exact', hint: 'The key must match query exactly.' },
  { value: 'subset', label: 'Subset', hint: 'The key params must exist, extra params are allowed.' },
];

export type LinkMapDialogData = {
  domainGroupId?: string;
  linkMapId?: string;
};

export type LinkMapDialogResult = {
  saved: boolean;
  linkMapId?: string;
  domainGroupId?: string;
  name?: string;
};

@Component({
  selector: 'app-link-map-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    FormField,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective,
  ],
  templateUrl: './link-map-form-dialog.component.html',
  styleUrl: './link-map-form-dialog.component.css',
})
export class LinkMapFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<LinkMapFormDialogComponent>);
  private readonly data = inject<LinkMapDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly linkMapsApi = inject(LinkMapsApiService);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly usageStore = inject(OrganizationUsageStore);

  private readonly saving = signal(false);
  private readonly existingLoaded = signal(false);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly isEdit = computed(() => !!this.data?.linkMapId);
  readonly domainGroupLocked = computed(() => !!this.data?.domainGroupId || this.isEdit());
  readonly loading = computed(() => this.saving() || this.detailsLoading());
  readonly submitError = signal<string | null>(null);

  readonly mapModel = signal({
    name: '',
    domainGroupId: this.data?.domainGroupId ?? '',
    caseSensitive: false,
    queryMatch: 'ignore' as LinkMapQueryMatch,
    fallbackDestination: '',
  });

  readonly mapForm = form(this.mapModel, (f) => {
    required(f.name);
    required(f.domainGroupId);
    required(f.fallbackDestination);
    applyZodField(f.name, z.string().min(1, 'Name is required').max(120));
    applyZodField(f.fallbackDestination, fallbackSchema);
  });

  readonly queryMatchOptions = queryMatchOptions;
  readonly queryMatchHint = computed(() => {
    const match = queryMatchOptions.find((option) => option.value === this.mapModel().queryMatch);
    return match?.hint ?? '';
  });

  readonly title = computed(() => (this.isEdit() ? 'Edit link map settings' : 'Create link map'));
  readonly nameError = computed(() => this.getFieldError(this.mapForm.name()));
  readonly domainGroupError = computed(() => this.getFieldError(this.mapForm.domainGroupId()));
  readonly fallbackError = computed(() => this.getFieldError(this.mapForm.fallbackDestination()));
  readonly submitTooltip = computed(() => this.buildSubmitTooltip());

  readonly detailsLoading = computed(() => {
    const id = this.data?.linkMapId;
    if (!id) {
      return false;
    }
    return !!this.linkMapStore.isLoading()[id];
  });

  readonly existingMap = computed<LinkMap | null>(() => {
    const id = this.data?.linkMapId;
    if (!id) {
      return null;
    }
    return this.linkMapStore.selectById(id)();
  });

  readonly caseSensitiveLocked = computed(() => {
    const existing = this.existingMap();
    return !!existing?.caseSensitive;
  });

  readonly caseSensitivityWarning = computed(() => {
    const existing = this.existingMap();
    if (!existing) {
      return null;
    }
    if (existing.caseSensitive) {
      return 'Case-sensitive mode is locked and cannot be changed back to case-insensitive.';
    }
    if (this.mapModel().caseSensitive) {
      return 'Switching to case-sensitive mode is permanent. You cannot switch this map back later.';
    }
    return null;
  });

  readonly canSubmit = computed(() => {
    return (
      this.mapForm.name().valid() &&
      this.mapForm.domainGroupId().valid() &&
      this.mapForm.fallbackDestination().valid()
    );
  });

  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'details',
      label: 'Details',
      title: 'Link map settings',
      description: 'Configure map behavior. Entries are managed on the dedicated map page.',
      complete: this.canSubmit(),
    },
  ]);

  constructor() {
    this.domainGroupStore.searchList();

    if (this.data?.linkMapId) {
      this.linkMapStore.searchDetails(this.data.linkMapId, true);
    }

    effect(() => {
      const map = this.existingMap();
      if (!map || this.existingLoaded() || this.detailsLoading()) {
        return;
      }
      this.mapModel.set({
        name: map.name ?? '',
        domainGroupId: map.domainGroupId ?? this.mapModel().domainGroupId,
        caseSensitive: map.caseSensitive ?? false,
        queryMatch: (map.queryMatch ?? 'ignore') as LinkMapQueryMatch,
        fallbackDestination: map.fallbackDestination ?? '',
      });
      this.existingLoaded.set(true);
    });
  }

  onQueryMatchChange(value: LinkMapQueryMatch): void {
    this.mapModel.update((model) => ({ ...model, queryMatch: value }));
  }

  onCaseSensitiveChange(checked: boolean): void {
    if (this.caseSensitiveLocked() && !checked) {
      return;
    }
    this.mapModel.update((model) => ({ ...model, caseSensitive: checked }));
  }

  normalizeFallbackDestination(): void {
    const normalized = this.normalizeDestination(this.mapModel().fallbackDestination);
    if (normalized !== this.mapModel().fallbackDestination) {
      this.mapModel.update((model) => ({ ...model, fallbackDestination: normalized }));
    }
  }

  async onSave(event?: Event): Promise<void> {
    event?.preventDefault();
    if (this.saving()) {
      return;
    }

    this.submitError.set(null);

    if (!this.canSubmit()) {
      this.mapForm.name().markAsTouched();
      this.mapForm.domainGroupId().markAsTouched();
      this.mapForm.fallbackDestination().markAsTouched();
      return;
    }

    this.saving.set(true);

    try {
      let saved: LinkMap;

      if (this.isEdit() && this.data?.linkMapId) {
        saved = await firstValueFrom(
          this.linkMapsApi.update(this.data.linkMapId, this.buildUpdatePayload()),
        );
      } else {
        saved = await firstValueFrom(this.linkMapsApi.create(this.buildCreatePayload()));
        this.usageStore.invalidateUsage();
      }

      this.linkMapStore.searchDetails(saved.id, true);
      this.linkMapStore.searchList({ domainGroupId: saved.domainGroupId }, true);

      this.dialogRef.close({
        saved: true,
        linkMapId: saved.id,
        domainGroupId: saved.domainGroupId,
        name: saved.name,
      } as LinkMapDialogResult);
    } catch (error: unknown) {
      this.submitError.set(extractErrorMessage(error, 'Unable to save link map settings.'));
    } finally {
      this.saving.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false } as LinkMapDialogResult);
  }

  private buildCreatePayload() {
    const model = this.mapModel();
    const fallback = this.normalizeDestination(model.fallbackDestination);

    return {
      name: model.name.trim(),
      domainGroupId: model.domainGroupId,
      caseSensitive: model.caseSensitive,
      queryMatch: model.queryMatch,
      fallbackDestination: fallback,
    };
  }

  private buildUpdatePayload() {
    const model = this.mapModel();
    const fallback = this.normalizeDestination(model.fallbackDestination);

    return {
      name: model.name.trim(),
      caseSensitive: model.caseSensitive,
      queryMatch: model.queryMatch,
      fallbackDestination: fallback,
    };
  }

  private normalizeDestination(value: string): string {
    return normalizeDestinationValue(value);
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

  private buildSubmitTooltip(): string {
    if (this.canSubmit()) {
      return '';
    }

    const messages: string[] = [];
    if (!this.mapForm.name().valid()) {
      messages.push(this.getFieldErrorMessage(this.mapForm.name()) ?? 'Name is required.');
    }
    if (!this.mapForm.domainGroupId().valid()) {
      messages.push(
        this.getFieldErrorMessage(this.mapForm.domainGroupId()) ?? 'Domain group is required.',
      );
    }
    if (!this.mapForm.fallbackDestination().valid()) {
      messages.push(
        this.getFieldErrorMessage(this.mapForm.fallbackDestination()) ??
          'Fallback destination is invalid.',
      );
    }

    return messages.join('\n');
  }
}
