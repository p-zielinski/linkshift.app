import { Component, computed, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { form, required, FormField } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { LinkMapsApiService } from '../../core/api/link-maps-api.service';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import type { LinkMapQueryMatch, LinkMap, LinkMapEntry } from '../../core/models/link-map.model';
import { applyZodField } from '../../core/forms/zod-validators';
import { z } from 'zod';
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
  .refine((value) => isValidDestination(value, true), 'Use a full URL like https://example.com');

const queryMatchOptions: Array<{ value: LinkMapQueryMatch; label: string; hint: string }> = [
  { value: 'ignore', label: 'Ignore query', hint: 'Only the path part of the key matters.' },
  { value: 'exact', label: 'Exact', hint: 'The key must match query exactly.' },
  { value: 'subset', label: 'Subset', hint: 'The key params must exist, extra params allowed.' },
];

type EntryRow = {
  id: string;
  key: string;
  destination: string;
};

type LinkMapDetails = LinkMap & { entries?: LinkMapEntry[] };

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
  private readonly saving = signal(false);
  private readonly existingLoaded = signal(false);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly isEdit = computed(() => !!this.data?.linkMapId);
  readonly domainGroupLocked = computed(() => !!this.data?.domainGroupId);
  readonly loading = computed(() => this.saving() || this.detailsLoading());
  readonly bulkText = signal('');
  readonly bulkError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly showEntries = signal(true);
  readonly submitAttempted = signal(false);
  readonly entryTouched = signal<Record<string, { key?: boolean; destination?: boolean }>>({});

  readonly mapModel = signal({
    name: '',
    domainGroupId: this.data?.domainGroupId ?? '',
    caseSensitive: false,
    queryMatch: 'ignore' as LinkMapQueryMatch,
    fallbackDestination: '',
  });

  readonly entries = signal<EntryRow[]>([]);

  mapForm = form(this.mapModel, (f) => {
    required(f.name);
    required(f.domainGroupId);
    applyZodField(f.name, z.string().min(1, 'Name is required').max(120));
    applyZodField(f.fallbackDestination, fallbackSchema.optional());
  });

  readonly duplicateKeys = computed(() => this.getDuplicateKeys());
  readonly invalidEntries = computed(() => this.getInvalidEntries());
  readonly entryErrors = computed(() => this.getEntryErrors());
  readonly canSubmit = computed(() => {
    return (
      this.mapForm.name().valid() &&
      this.mapForm.domainGroupId().valid() &&
      this.mapForm.fallbackDestination().valid() &&
      this.duplicateKeys().length === 0 &&
      this.invalidEntries().length === 0
    );
  });

  readonly queryMatchOptions = queryMatchOptions;
  readonly queryMatchHint = computed(() => {
    const match = queryMatchOptions.find((option) => option.value === this.mapModel().queryMatch);
    return match?.hint ?? '';
  });

  readonly title = computed(() => (this.isEdit() ? 'Edit link map' : 'Create link map'));
  readonly nameError = computed(() => this.getFieldError(this.mapForm.name()));
  readonly domainGroupError = computed(() => this.getFieldError(this.mapForm.domainGroupId()));
  readonly fallbackError = computed(() => this.getFieldError(this.mapForm.fallbackDestination()));
  readonly entriesCount = computed(() => this.entries().length);
  readonly selectedGroupLabel = computed(() => {
    const groupId = this.mapModel().domainGroupId;
    if (!groupId) {
      return '';
    }
    const group = this.domainGroups().find((item) => item.id === groupId);
    return group ? `${group.name} (${group.id})` : groupId;
  });
  readonly submitTooltip = computed(() => this.buildSubmitTooltip());
  readonly detailsLoading = computed(() => {
    const id = this.data?.linkMapId;
    if (!id) {
      return false;
    }
    return !!this.linkMapStore.isLoading()[id];
  });
  readonly existingMap = computed(() => {
    const id = this.data?.linkMapId;
    if (!id) {
      return null;
    }
    return this.linkMapStore.selectById(id)();
  });
  readonly detailsComplete = computed(() => {
    return (
      this.mapForm.name().valid() &&
      this.mapForm.domainGroupId().valid() &&
      this.mapForm.fallbackDestination().valid()
    );
  });
  readonly entriesComplete = computed(() => {
    return this.duplicateKeys().length === 0 && this.invalidEntries().length === 0;
  });
  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'details',
      label: 'Details',
      title: 'Map details',
      description: 'Name the map and define how keys are matched.',
      complete: this.detailsComplete(),
    },
    {
      id: 'entries',
      label: 'Entries',
      title: 'Map entries',
      description: 'Add key to destination mappings for this link map.',
      complete: this.entriesComplete(),
    },
    {
      id: 'bulk',
      label: 'Bulk import',
      title: 'Import entries',
      description: 'Paste many rows in one go.',
      complete: true,
    },
  ]);

  constructor() {
    this.domainGroupStore.searchList();
    if (this.data?.linkMapId) {
      this.linkMapStore.searchDetails(this.data.linkMapId, true);
    }

    effect(() => {
      this.mapModel();
      this.duplicateKeys();
      this.invalidEntries();
    });

    effect(() => {
      const map = this.existingMap();
      if (!map || this.existingLoaded() || this.detailsLoading()) {
        return;
      }
      if (map.entries === undefined) {
        return;
      }
      this.populateFromMap(map);
      this.existingLoaded.set(true);
    });

  }

  trackById(_: number, row: EntryRow) {
    return row.id;
  }

  onQueryMatchChange(value: LinkMapQueryMatch): void {
    this.mapModel.update((model) => ({ ...model, queryMatch: value }));
  }

  onCaseSensitiveChange(checked: boolean): void {
    this.mapModel.update((model) => ({ ...model, caseSensitive: checked }));
  }

  addEntry(): void {
    const nextCount = this.entries().length + 1;
    this.showEntries.set(nextCount <= 2000);
    this.entries.update((rows) => [...rows, { id: this.createRowId(), key: '', destination: '' }]);
  }

  removeEntry(id: string): void {
    this.entries.update((rows) => rows.filter((row) => row.id !== id));
    const touched = { ...this.entryTouched() };
    delete touched[id];
    this.entryTouched.set(touched);
  }

  updateEntry(id: string, field: 'key' | 'destination', value: string): void {
    this.markEntryTouched(id, field);
    this.entries.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  normalizeEntryDestination(id: string): void {
    const row = this.entries().find((entry) => entry.id === id);
    if (!row) {
      return;
    }
    const normalized = this.normalizeDestination(row.destination);
    if (normalized !== row.destination) {
      this.updateEntry(id, 'destination', normalized);
    }
  }

  onEntryDestinationBlur(id: string): void {
    this.markEntryTouched(id, 'destination');
    this.normalizeEntryDestination(id);
  }

  normalizeFallbackDestination(): void {
    const normalized = this.normalizeDestination(this.mapModel().fallbackDestination);
    if (normalized !== this.mapModel().fallbackDestination) {
      this.mapModel.update((model) => ({ ...model, fallbackDestination: normalized }));
    }
  }

  addBulkEntries(): void {
    const text = this.bulkText().trim();
    if (!text) {
      this.bulkError.set('Paste entries to add.');
      return;
    }

    const parsed: EntryRow[] = [];
    const errors: string[] = [];

    text.split(/\r?\n/).forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      let key = '';
      let destination = '';
      if (trimmed.includes('->')) {
        const parts = trimmed.split('->');
        key = parts[0]?.trim() ?? '';
        destination = parts.slice(1).join('->').trim();
      } else if (trimmed.includes(',')) {
        const parts = trimmed.split(',');
        key = parts[0]?.trim() ?? '';
        destination = parts.slice(1).join(',').trim();
      } else {
        const match = trimmed.match(/^(\S+)\s+(.+)$/);
        if (match) {
          key = match[1].trim();
          destination = match[2].trim();
        }
      }

      if (!key || !destination) {
        errors.push(`Line ${index + 1} is invalid.`);
        return;
      }
      parsed.push({
        id: this.createRowId(),
        key,
        destination: this.normalizeDestination(destination),
      });
    });

    if (errors.length) {
      this.bulkError.set(errors[0]);
      return;
    }

    this.bulkError.set(null);
    this.bulkText.set('');
    const nextCount = this.entries().length + parsed.length;
    this.showEntries.set(nextCount <= 2000);
    this.entries.update((rows) => [...rows, ...parsed]);
  }

  async onSave(event?: Event): Promise<void> {
    event?.preventDefault();
    if (this.saving()) {
      return;
    }
    this.submitError.set(null);
    this.submitAttempted.set(true);

    if (!this.canSubmit()) {
      this.mapForm.name().markAsTouched();
      this.mapForm.domainGroupId().markAsTouched();
      this.mapForm.fallbackDestination().markAsTouched();
      return;
    }

    const entriesPayload = this.buildEntriesPayload();
    this.saving.set(true);

    try {
      let saved: LinkMap;

      if (this.isEdit() && this.data?.linkMapId) {
        saved = await firstValueFrom(
          this.linkMapsApi.update(this.data.linkMapId, this.buildUpdatePayload()),
        );
        await firstValueFrom(
          this.linkMapsApi.upsertEntries(this.data.linkMapId, {
            mode: 'replace',
            entries: entriesPayload,
          }),
        );
      } else {
        saved = await firstValueFrom(this.linkMapsApi.create(this.buildCreatePayload(entriesPayload)));
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
      this.submitError.set(extractErrorMessage(error, 'Unable to save link map.'));
    } finally {
      this.saving.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false } as LinkMapDialogResult);
  }

  private buildCreatePayload(entries: Array<{ key: string; destination: string }>) {
    const model = this.mapModel();
    const fallback = this.normalizeDestination(model.fallbackDestination);

    return {
      name: model.name.trim(),
      domainGroupId: model.domainGroupId,
      caseSensitive: model.caseSensitive,
      queryMatch: model.queryMatch,
      fallbackDestination: fallback || null,
      entries,
    };
  }
  
  private buildUpdatePayload() {
    const model = this.mapModel();
    const fallback = this.normalizeDestination(model.fallbackDestination);

    return {
      name: model.name.trim(),
      caseSensitive: model.caseSensitive,
      queryMatch: model.queryMatch,
      fallbackDestination: fallback || null,
    };
  }

  private buildEntriesPayload(): Array<{ key: string; destination: string }> {
    return this.entries().map((entry) => ({
      key: entry.key.trim(),
      destination: this.normalizeDestination(entry.destination),
    }));
  }

  private populateFromMap(map: LinkMapDetails): void {
    if (!map) {
      return;
    }
    this.mapModel.set({
      name: map.name ?? '',
      domainGroupId: map.domainGroupId ?? '',
      caseSensitive: map.caseSensitive ?? false,
      queryMatch: (map.queryMatch ?? 'ignore') as LinkMapQueryMatch,
      fallbackDestination: map.fallbackDestination ?? '',
    });
    const entries = (map.entries ?? []).map((entry) => ({
      id: entry.id,
      key: entry.key,
      destination: entry.destination,
    }));
    this.entries.set(entries);
    this.showEntries.set(entries.length <= 2000);
  }

  private getDuplicateKeys(): string[] {
    const normalized = new Map<string, number>();
    const model = this.mapModel();
    const duplicates: string[] = [];

    for (const entry of this.entries()) {
      const normalizedKey = this.normalizeKey(entry.key, model.caseSensitive, model.queryMatch);
      if (!normalizedKey) {
        continue;
      }
      const count = (normalized.get(normalizedKey) ?? 0) + 1;
      normalized.set(normalizedKey, count);
      if (count === 2) {
        duplicates.push(entry.key);
      }
    }

    return duplicates;
  }

  private getInvalidEntries(): string[] {
    const invalid: string[] = [];
    for (const entry of this.entries()) {
      if (!entry.key.trim() || !entry.destination.trim()) {
        invalid.push(entry.key);
        continue;
      }
      if (!isValidDestination(entry.destination, false)) {
        invalid.push(entry.key);
      }
    }
    return invalid;
  }

  private getEntryErrors(): Map<string, { key?: string; destination?: string }> {
    const errors = new Map<string, { key?: string; destination?: string }>();
    for (const entry of this.entries()) {
      const entryErrors: { key?: string; destination?: string } = {};
      if (!entry.key.trim()) {
        entryErrors.key = 'Add a short key (for example promo or spring-sale).';
      }
      if (!entry.destination.trim()) {
        entryErrors.destination = 'Add a destination URL.';
      } else {
        if (!isValidDestination(entry.destination, false)) {
          entryErrors.destination = 'Use a full URL like https://example.com.';
        }
      }
      if (entryErrors.key || entryErrors.destination) {
        errors.set(entry.id, entryErrors);
      }
    }
    return errors;
  }

  private normalizeKey(key: string, caseSensitive: boolean, queryMatch: LinkMapQueryMatch): string {
    const trimmed = key.trim();
    if (!trimmed) return '';
    const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    let url: URL;
    try {
      url = new URL(normalized, 'http://localhost');
    } catch {
      return '';
    }
    const path = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    const pathNormalized = caseSensitive ? path : path.toLowerCase();

    if (queryMatch === 'ignore') {
      return pathNormalized;
    }

    const params = new URLSearchParams();
    url.searchParams.forEach((value, keyParam) => {
      const nextKey = caseSensitive ? keyParam : keyParam.toLowerCase();
      const nextValue = caseSensitive ? value : value.toLowerCase();
      params.append(nextKey, nextValue);
    });

    const entries = Array.from(params.entries());
    entries.sort(([aKey, aVal], [bKey, bVal]) =>
      aKey === bKey ? aVal.localeCompare(bVal) : aKey.localeCompare(bKey),
    );

    const query = entries.map(([k, v]) => `${k}=${v}`).join('&');
    return query ? `${pathNormalized}?${query}` : pathNormalized;
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

  entryKeyError(entryId: string): string | null {
    if (!this.shouldShowEntryError(entryId, 'key')) {
      return null;
    }
    return this.entryErrors().get(entryId)?.key ?? null;
  }

  entryDestinationError(entryId: string): string | null {
    if (!this.shouldShowEntryError(entryId, 'destination')) {
      return null;
    }
    return this.entryErrors().get(entryId)?.destination ?? null;
  }

  markEntryTouched(entryId: string, field: 'key' | 'destination'): void {
    const touched = this.entryTouched();
    const existing = touched[entryId] ?? {};
    if (existing[field]) {
      return;
    }
    this.entryTouched.set({
      ...touched,
      [entryId]: { ...existing, [field]: true },
    });
  }

  private shouldShowEntryError(entryId: string, field: 'key' | 'destination'): boolean {
    if (this.submitAttempted()) {
      return true;
    }
    return Boolean(this.entryTouched()[entryId]?.[field]);
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
    if (this.duplicateKeys().length > 0) {
      messages.push('Remove duplicate keys.');
    }
    if (this.invalidEntries().length > 0) {
      messages.push('Fix entries with missing keys or invalid destinations.');
    }

    return messages.join('\n');
  }

  private createRowId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}
