import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import type { LinkMapEntry } from '../../core/models/link-map.model';
import { WizardComponent, type WizardStep } from '../../shared/components/wizard/wizard.component';
import {
  WizardStepDirective,
  WizardStepSummaryDirective,
} from '../../shared/components/wizard/wizard-step.directive';

export type LinkMapEntriesDeleteConfirmDialogData = {
  entries: LinkMapEntry[];
};

@Component({
  selector: 'app-link-map-entries-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, WizardComponent, WizardStepDirective, WizardStepSummaryDirective],
  templateUrl: './link-map-entries-delete-confirm-dialog.component.html',
  styleUrl: './link-map-entries-delete-confirm-dialog.component.css',
})
export class LinkMapEntriesDeleteConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<LinkMapEntriesDeleteConfirmDialogComponent>);
  readonly data = inject<LinkMapEntriesDeleteConfirmDialogData>(MAT_DIALOG_DATA);

  readonly count = computed(() => this.data.entries.length);

  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 'confirm',
      label: 'Confirm',
      title: 'Delete selected entries',
      description: 'This action cannot be undone. Review the list below before deleting.',
      complete: true,
    },
  ]);

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
