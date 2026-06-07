import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ResourceCardComponent } from '../resource-card/resource-card.component';
import { SetupChecklistService } from './setup-checklist.service';
import type { SetupChecklistItemId } from './setup-checklist.state';

@Component({
  selector: 'app-setup-checklist',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    ResourceCardComponent,
  ],
  templateUrl: './setup-checklist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupChecklistComponent {
  private readonly checklist = inject(SetupChecklistService);

  readonly itemViews = this.checklist.itemViews;
  readonly dismissed = this.checklist.dismissed;
  readonly completedCount = this.checklist.completedCount;
  readonly totalCount = this.checklist.totalCount;

  onCheckedChange(itemId: SetupChecklistItemId, checked: boolean): void {
    this.checklist.setChecked(itemId, checked);
  }

  dismiss(): void {
    this.checklist.dismiss();
  }

  reopen(): void {
    this.checklist.reopen();
  }
}
