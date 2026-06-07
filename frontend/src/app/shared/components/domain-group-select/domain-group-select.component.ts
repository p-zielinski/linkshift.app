import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormField, type FieldTree } from '@angular/forms/signals';
import type { DomainGroup } from '../../../core/models/domain-group.model';

type DomainGroupOption = Pick<DomainGroup, 'id' | 'name'>;

@Component({
  selector: 'app-domain-group-select',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormField],
  templateUrl: './domain-group-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainGroupSelectComponent {
  readonly label = input('Domain group');
  readonly includeAllOption = input(false);
  readonly allOptionLabel = input('All domain groups');
  readonly allOptionValue = input('');
  readonly groups = input<DomainGroupOption[]>([]);
  readonly formField = input<FieldTree<string, string> | null>(null);
}
