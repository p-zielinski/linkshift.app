import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { LinkMapEntriesApiService } from '../../core/api/link-map-entries-api.service';
import type { ImportLinkMapEntriesResult } from '../../core/models/link-map.model';
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

export type LinkMapEntriesImportDialogData = {
  linkMapId: string;
  caseSensitive: boolean;
};

export type LinkMapEntriesImportDialogResult = {
  didChange: boolean;
  rolledBack: boolean;
  importedCount: number;
  failedCount: number;
};

@Component({
  selector: 'app-link-map-entries-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective,
  ],
  templateUrl: './link-map-entries-import-dialog.component.html',
  styleUrl: './link-map-entries-import-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkMapEntriesImportDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<LinkMapEntriesImportDialogComponent>);
  private readonly data = inject<LinkMapEntriesImportDialogData>(MAT_DIALOG_DATA);
  private readonly api = inject(LinkMapEntriesApiService);

  readonly bulkText = signal('');
  readonly result = signal<ImportLinkMapEntriesResult | null>(null);
  readonly running = signal(false);
  readonly rollingBack = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly rolledBack = signal(false);

  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'import',
      label: 'Import',
      title: 'Bulk import entries',
      description:
        'Paste up to 500 rows as key -> destination, key,destination, or key destination.',
      complete: !!this.result(),
    },
  ]);

  readonly saveLabel = computed(() => (this.result() ? 'Close' : 'Import entries'));
  readonly saveDisabled = computed(() => this.running() || this.rollingBack());

  readonly canRollback = computed(() => {
    const result = this.result();
    if (!result) {
      return false;
    }
    return result.importedEntryIds.length > 0 && !this.rolledBack();
  });

  async onSave(): Promise<void> {
    if (this.result()) {
      this.close();
      return;
    }

    this.submitError.set(null);
    const parsed = this.parseBulkInput();
    if (!parsed) {
      return;
    }

    this.running.set(true);
    try {
      const result = await firstValueFrom(
        this.api.importEntries({
          linkMapId: this.data.linkMapId,
          entries: parsed,
        }),
      );
      this.result.set(result);
    } catch (error) {
      this.submitError.set(extractErrorMessage(error, "Couldn't import entries."));
    } finally {
      this.running.set(false);
    }
  }

  async onRollback(): Promise<void> {
    const result = this.result();
    if (!result || result.importedEntryIds.length === 0 || this.rollingBack()) {
      return;
    }

    this.rollingBack.set(true);
    this.submitError.set(null);
    try {
      await firstValueFrom(
        this.api.deleteMany({
          linkMapId: this.data.linkMapId,
          entryIds: result.importedEntryIds,
        }),
      );
      this.rolledBack.set(true);
    } catch (error) {
      this.submitError.set(extractErrorMessage(error, "Couldn't roll back imported entries."));
    } finally {
      this.rollingBack.set(false);
    }
  }

  close(): void {
    const result = this.result();
    this.dialogRef.close({
      didChange: !!result && result.importedCount > 0 && !this.rolledBack(),
      rolledBack: this.rolledBack(),
      importedCount: result?.importedCount ?? 0,
      failedCount: result?.failedCount ?? 0,
    } as LinkMapEntriesImportDialogResult);
  }

  private parseBulkInput(): Array<{ key: string; destination: string }> | null {
    const text = this.bulkText().trim();
    if (!text) {
      this.submitError.set('Paste entries to import.');
      return null;
    }

    const entries: Array<{ key: string; destination: string }> = [];
    const lines = text.split(/\r?\n/);

    if (lines.length > 500) {
      this.submitError.set('Maximum 500 rows per import.');
      return null;
    }

    for (let index = 0; index < lines.length; index += 1) {
      const rawLine = lines[index].trim();
      if (!rawLine) {
        continue;
      }

      let key = '';
      let destination = '';

      if (rawLine.includes('->')) {
        const parts = rawLine.split('->');
        key = parts[0]?.trim() ?? '';
        destination = parts.slice(1).join('->').trim();
      } else if (rawLine.includes(',')) {
        const parts = rawLine.split(',');
        key = parts[0]?.trim() ?? '';
        destination = parts.slice(1).join(',').trim();
      } else {
        const match = rawLine.match(/^(\S+)\s+(.+)$/);
        if (match) {
          key = match[1].trim();
          destination = match[2].trim();
        }
      }

      if (!key || !destination) {
        this.submitError.set(`Line ${index + 1} is invalid.`);
        return null;
      }

      entries.push({
        key: this.data.caseSensitive ? key : key.toLowerCase(),
        destination: normalizeDestinationValue(destination),
      });
    }

    if (entries.length === 0) {
      this.submitError.set('No valid entries found.');
      return null;
    }

    if (entries.length > 500) {
      this.submitError.set('Maximum 500 rows per import.');
      return null;
    }

    return entries;
  }
}
