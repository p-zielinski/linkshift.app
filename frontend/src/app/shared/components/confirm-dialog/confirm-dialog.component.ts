import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export type ConfirmDialogData = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'warning';
};

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog">
      <div class="dialog-header">
        <mat-icon [class.warning]="data.tone === 'warning'">
          {{ data.tone === 'warning' ? 'warning' : 'help' }}
        </mat-icon>
        <div>
          <h3>{{ data.title }}</h3>
          <p class="subtle">{{ data.message }}</p>
        </div>
      </div>
      <div class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()">
          {{ data.cancelLabel || 'Cancel' }}
        </button>
        <button mat-flat-button color="primary" (click)="onConfirm()">
          {{ data.confirmLabel || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog {
        padding: 8px 4px 0;
        display: grid;
        gap: 16px;
      }

      .dialog-header {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      mat-icon {
        font-size: 32px;
        height: 32px;
        width: 32px;
        color: var(--app-accent-strong);
      }

      mat-icon.warning {
        color: #c13e4f;
      }

      h3 {
        margin: 0 0 6px;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    `
  ]
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
