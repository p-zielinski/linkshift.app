import { Component, computed, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { form, required, FormField } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { LinkMapsApiService } from '../../core/api/link-maps-api.service';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import type {
  LinkMapQueryMatch,
  LinkMapWithEntries,
} from '../../core/models/link-map.model';
import { applyZodField } from '../../core/forms/zod-validators';
import { z } from 'zod';

const destinationSchema = z
  .string()
  .min(1, 'Destination is required')
  .refine((value) => /^https?:\/\//i.test(value.trim()), 'Destination must start with http:// or https://');
const fallbackSchema = z.union([destinationSchema, z.literal('')]);

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

export type LinkMapDialogData = {
  domainGroupId?: string;
  linkMapId?: string;
};

export type LinkMapDialogResult = {
  saved: boolean;
};

@Component({
  selector: 'app-link-map-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    FormField,
  ],
  templateUrl: './link-map-form-dialog.component.html',
  styleUrl: './link-map-form-dialog.component.css',
})
export class LinkMapFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<LinkMapFormDialogComponent>);
  private readonly data = inject<LinkMapDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly linkMapsApi = inject(LinkMapsApiService);
  private readonly domainGroupStore = inject(DomainGroupStore);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly isEdit = computed(() => !!this.data?.linkMapId);
  readonly loading = signal(false);
  readonly bulkText = signal('');
  readonly bulkError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);

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
  readonly canSubmit = computed(() => {
    return (
      this.mapForm.name().valid() &&
      this.mapForm.domainGroupId().valid() &&
      this.duplicateKeys().length === 0 &&
      this.invalidEntries().length === 0
    );
  });

  readonly queryMatchOptions = queryMatchOptions;
  readonly queryMatchHint = computed(() => {
    const match = queryMatchOptions.find(
      (option) => option.value === this.mapModel().queryMatch,
    );
    return match?.hint ?? '';
  });

  readonly title = computed(() => (this.isEdit() ? 'Edit link map' : 'Create link map'));

  constructor() {
    this.domainGroupStore.searchList();
    this.loadExisting();

    effect(() => {
      this.mapModel();
      this.duplicateKeys();
      this.invalidEntries();
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
    this.entries.update((rows) => [
      ...rows,
      { id: this.createRowId(), key: '', destination: '' },
    ]);
  }

  removeEntry(id: string): void {
    this.entries.update((rows) => rows.filter((row) => row.id !== id));
  }

  updateEntry(id: string, field: 'key' | 'destination', value: string): void {
    this.entries.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
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
      parsed.push({ id: this.createRowId(), key, destination });
    });

    if (errors.length) {
      this.bulkError.set(errors[0]);
      return;
    }

    this.bulkError.set(null);
    this.bulkText.set('');
    this.entries.update((rows) => [...rows, ...parsed]);
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    this.submitError.set(null);

    if (!this.canSubmit()) {
      this.mapForm.name().markAsTouched();
      this.mapForm.domainGroupId().markAsTouched();
      return;
    }

    const payload = this.buildPayload();

    try {
      this.loading.set(true);
      if (this.isEdit() && this.data?.linkMapId) {
        await firstValueFrom(this.linkMapsApi.update(this.data.linkMapId, payload));
        await firstValueFrom(
          this.linkMapsApi.upsertEntries(this.data.linkMapId, {
            mode: 'replace',
            entries: payload.entries ?? [],
          }),
        );
      } else {
        await firstValueFrom(this.linkMapsApi.create(payload));
      }
      this.dialogRef.close({ saved: true } as LinkMapDialogResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save link map.';
      this.submitError.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false } as LinkMapDialogResult);
  }

  private buildPayload() {
    const model = this.mapModel();
    const entries = this.entries().map((entry) => ({
      key: entry.key.trim(),
      destination: entry.destination.trim(),
    }));

    return {
      name: model.name.trim(),
      domainGroupId: model.domainGroupId,
      caseSensitive: model.caseSensitive,
      queryMatch: model.queryMatch,
      fallbackDestination: model.fallbackDestination?.trim() || null,
      entries,
    };
  }

  private async loadExisting(): Promise<void> {
    if (!this.data?.linkMapId) {
      return;
    }

    this.loading.set(true);
    try {
      const map = await firstValueFrom(this.linkMapsApi.get(this.data.linkMapId));
      if (!map) {
        return;
      }
      this.mapModel.set({
        name: map.name,
        domainGroupId: map.domainGroupId,
        caseSensitive: map.caseSensitive,
        queryMatch: map.queryMatch,
        fallbackDestination: map.fallbackDestination ?? '',
      });
      this.entries.set(
        map.entries.map((entry) => ({
          id: entry.id,
          key: entry.key,
          destination: entry.destination,
        })),
      );
    } finally {
      this.loading.set(false);
    }
  }

  private getDuplicateKeys(): string[] {
    const normalized = new Map<string, number>();
    const model = this.mapModel();
    const duplicates: string[] = [];

    for (const entry of this.entries()) {
      const normalizedKey = this.normalizeKey(
        entry.key,
        model.caseSensitive,
        model.queryMatch,
      );
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
      if (!/^https?:\/\//i.test(entry.destination.trim())) {
        invalid.push(entry.key);
      }
    }
    return invalid;
  }

  private normalizeKey(
    key: string,
    caseSensitive: boolean,
    queryMatch: LinkMapQueryMatch,
  ): string {
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

  private createRowId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}
