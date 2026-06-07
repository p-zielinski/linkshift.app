import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

export type LoadingDialogData = {
  message: string;
  title?: string;
};

@Component({
  selector: 'app-loading-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './loading-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingDialogComponent {
  readonly data = inject<LoadingDialogData>(MAT_DIALOG_DATA);
}
