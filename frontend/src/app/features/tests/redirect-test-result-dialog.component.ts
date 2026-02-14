import { Component, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import type { RedirectTest, RedirectTestResult } from '../../core/models/redirect-test.model';
import type { RedirectTestRunState } from '../../core/store/redirect-test-results.store';

export type RedirectTestResultDialogData = {
  test: RedirectTest;
  runState: RedirectTestRunState | null;
};

@Component({
  selector: 'app-redirect-test-result-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './redirect-test-result-dialog.component.html'
})
export class RedirectTestResultDialogComponent {
  readonly data = inject<RedirectTestResultDialogData>(MAT_DIALOG_DATA);

  readonly expected = computed(() => this.data.test.expectedResult ?? null);
  readonly actual = computed(() => this.data.runState?.lastResult ?? null);
  readonly lastError = computed(() => this.data.runState?.lastError ?? null);
  readonly lastRunAt = computed(() => this.data.runState?.lastRunAt ?? null);

  readonly isMismatch = computed(() => {
    const expected = this.expected();
    const actual = this.actual();
    if (!expected || !actual) {
      return false;
    }
    return !this.compare(expected, actual);
  });

  private compare(expected: RedirectTestResult, actual: RedirectTestResult): boolean {
    return (
      expected.matched === actual.matched &&
      expected.statusCode === actual.statusCode &&
      (expected.target ?? null) === (actual.target ?? null)
    );
  }
}
