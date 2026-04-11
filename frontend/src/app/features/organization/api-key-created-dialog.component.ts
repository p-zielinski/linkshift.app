import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type ApiKeyCreatedDialogData = {
  key: string;
};

@Component({
  selector: 'app-api-key-created-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './api-key-created-dialog.component.html',
})
export class ApiKeyCreatedDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ApiKeyCreatedDialogComponent>);
  private readonly clipboard = inject(Clipboard);

  readonly data = inject<ApiKeyCreatedDialogData>(MAT_DIALOG_DATA);
  readonly copied = signal(false);

  copyKey(): void {
    const copied = this.clipboard.copy(this.data.key);
    this.copied.set(copied);
  }

  close(): void {
    this.dialogRef.close();
  }
}
