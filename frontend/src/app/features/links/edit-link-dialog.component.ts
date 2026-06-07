import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormField, form, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { LinkMapEntriesApiService } from '../../core/api/link-map-entries-api.service';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';
import {
  isValidHttpsDestination,
  isValidLinkKey,
  normalizeDestinationUrl,
  sanitizeLinkKey,
} from './links-provisioning.util';

export type EditLinkDialogData = {
  entryId: string;
  key: string;
  destination: string;
  shortPath: string;
  shortUrls: string[];
  caseSensitive: boolean;
};

export type EditLinkDialogResult = {
  saved: boolean;
  openAdvanced?: boolean;
};

type EditLinkModel = {
  key: string;
  destination: string;
};

@Component({
  selector: 'app-edit-link-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FormField,
    WizardComponent,
    WizardStepDirective,
    WizardStepSummaryDirective,
  ],
  templateUrl: './edit-link-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLinkDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EditLinkDialogComponent, EditLinkDialogResult>);
  private readonly data = inject<EditLinkDialogData>(MAT_DIALOG_DATA);
  private readonly api = inject(LinkMapEntriesApiService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly pending = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly model = signal<EditLinkModel>({
    key: this.data.key,
    destination: this.data.destination || 'https://',
  });

  readonly editForm = form(this.model, (formGroup) => {
    required(formGroup.key);
    required(formGroup.destination);
  });

  /** Site-scoped path — same on every connected host for this link. */
  readonly shortPath = this.data.shortPath;
  /** Full URLs (one per host) — routing is shared; hosts differ only in display/copy. */
  readonly shortUrls = this.data.shortUrls;
  readonly keyValue = computed(() => sanitizeLinkKey(this.model().key));
  readonly destinationValue = computed(() => normalizeDestinationUrl(this.model().destination));
  readonly keyValid = computed(() => isValidLinkKey(this.model().key));
  readonly destinationValid = computed(() => isValidHttpsDestination(this.model().destination));
  readonly canSave = computed(
    () => this.keyValid() && this.destinationValid() && !this.pending(),
  );
  readonly saveLabel = computed(() => (this.pending() ? 'Saving…' : 'Save changes'));

  readonly saveTooltip = computed(() => {
    if (this.canSave()) {
      return '';
    }
    if (!this.keyValid()) {
      return 'Use lowercase letters, numbers, and hyphens only';
    }
    if (!this.destinationValid()) {
      return 'Destination must be a valid https URL';
    }
    return '';
  });

  readonly advancedOptionsTooltip =
    'Opens Advanced view with redirect rules and full routing controls';

  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'details',
      label: 'Details',
      title: 'Short link details',
      description: 'Update link path and destination URL',
      complete: this.canSave(),
    },
  ]);

  async onSave(): Promise<void> {
    if (!this.canSave()) {
      this.editForm.key().markAsTouched();
      this.editForm.destination().markAsTouched();
      return;
    }

    this.pending.set(true);
    this.submitError.set(null);

    try {
      const key = this.normalizeKey(this.keyValue());
      const destination = this.destinationValue();

      await firstValueFrom(
        this.api.update(this.data.entryId, {
          key,
          destination,
        }),
      );

      this.dialogRef.close({ saved: true });
    } catch (error) {
      this.submitError.set(extractErrorMessage(error, "Couldn't save link. Try again."));
    } finally {
      this.pending.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close({ saved: false });
  }

  openAdvancedOptions(): void {
    const confirmData: ConfirmDialogData = {
      title: 'Switch to advanced view?',
      message:
        "You'll leave this editor and open redirect rules in Advanced view. Routing and link map controls live there.",
      confirmLabel: 'Switch to advanced',
      cancelLabel: 'Stay here',
    };

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: confirmData,
    });

    confirmDialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.dialogRef.close({
        saved: false,
        openAdvanced: true,
      });
    });
  }

  private normalizeKey(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    return this.data.caseSensitive ? trimmed : trimmed.toLowerCase();
  }
}
