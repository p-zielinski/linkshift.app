import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import type { TopRedirectRuleEntry } from '../../core/models/redirect-rule.model';

type RuleAnalyticsDialogData = {
  entry: TopRedirectRuleEntry;
};

@Component({
  selector: 'app-rule-analytics-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './rule-analytics-dialog.component.html',
  styleUrl: './rule-analytics-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleAnalyticsDialogComponent {
  readonly data = inject<RuleAnalyticsDialogData>(MAT_DIALOG_DATA);
  readonly hasMatchMethods = this.data.entry.rule.matchMethod.length > 0;
  readonly matchMethodsLabel = this.data.entry.rule.matchMethod.join(', ');
}
