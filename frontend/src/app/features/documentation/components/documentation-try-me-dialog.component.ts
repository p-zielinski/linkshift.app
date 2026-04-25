import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { OpenApiDocument, OpenApiEndpoint } from '../models/openapi.types';
import { ApiTryMeComponent } from './api-try-me.component';

export type DocumentationTryMeDialogData = {
  endpoint: OpenApiEndpoint;
  document: OpenApiDocument;
  defaultBaseUrl: string;
};

@Component({
  selector: 'app-documentation-try-me-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, ApiTryMeComponent],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2 pt-2">
      <span class="rounded-full bg-[rgba(192,55,98,0.16)] px-2 py-[2px] text-[11px] font-bold text-[#8f2045]">
        {{ data.endpoint.method.toUpperCase() }}
      </span>
      <span class="text-base font-semibold">{{ data.endpoint.summary }}</span>
    </h2>

    <mat-dialog-content class="pb-1">
      <app-api-try-me
        [endpoint]="data.endpoint"
        [document]="data.document"
        [defaultBaseUrl]="data.defaultBaseUrl"
      />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
})
export class DocumentationTryMeDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: DocumentationTryMeDialogData,
    readonly dialogRef: MatDialogRef<DocumentationTryMeDialogComponent>,
  ) {}
}
