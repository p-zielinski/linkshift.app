import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { ApiKey } from '../../../../core/models/api-key.model';

@Component({
  selector: 'app-organization-api-keys-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './organization-api-keys-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationApiKeysTableComponent {
  readonly keys = input<ApiKey[]>([]);
  readonly loading = input(false);

  @Output() edit = new EventEmitter<ApiKey>();
  @Output() delete = new EventEmitter<ApiKey>();

  readonly columns = ['name', 'prefix', 'expiresAt', 'createdAt', 'lastUsedAt', 'actions'];

  onEdit(key: ApiKey): void {
    this.edit.emit(key);
  }

  onDelete(key: ApiKey): void {
    this.delete.emit(key);
  }

  trackRow(_index: number, key: ApiKey): string {
    return key.id;
  }
}
