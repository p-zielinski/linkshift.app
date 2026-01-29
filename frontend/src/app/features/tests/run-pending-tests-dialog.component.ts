import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { RedirectTestsApiService } from '../../core/api/redirect-tests-api.service';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import { RedirectTestResultsStore } from '../../core/store/redirect-test-results.store';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import type { RedirectTest, RedirectTestResult } from '../../core/models/redirect-test.model';
import { buildSimulationEntry } from './redirect-test.utils';

export type RunPendingTestsDialogData = {
  domainGroupId: string;
};

@Component({
  selector: 'app-run-pending-tests-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatButtonModule
  ],
  templateUrl: './run-pending-tests-dialog.component.html'
})
export class RunPendingTestsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RunPendingTestsDialogComponent>);
  private readonly redirectTestsApi = inject(RedirectTestsApiService);
  private readonly redirectRulesApi = inject(RedirectRulesApiService);
  private readonly resultsStore = inject(RedirectTestResultsStore);
  readonly data = inject<RunPendingTestsDialogData>(MAT_DIALOG_DATA);

  readonly total = signal(0);
  readonly completed = signal(0);
  readonly running = signal(true);
  readonly summary = signal<string | null>(null);
  readonly didRun = signal(false);

  readonly progress = computed(() => {
    const total = this.total();
    if (!total) {
      return 0;
    }
    return Math.round((this.completed() / total) * 100);
  });

  constructor() {
    this.runPendingTests();
  }

  close(): void {
    this.dialogRef.close(this.didRun());
  }

  private async runPendingTests(): Promise<void> {
    try {
      const tests = await this.fetchPendingTests();
      this.total.set(tests.length);
      this.didRun.set(tests.length > 0);

      if (tests.length === 0) {
        this.summary.set('No pending tests to run.');
        this.running.set(false);
        return;
      }

      let failures = 0;
      for (const test of tests) {
        const success = await this.runTest(test);
        if (!success) {
          failures += 1;
        }
        this.completed.update((value) => value + 1);
      }

      const successCount = tests.length - failures;
      this.summary.set(
        failures
          ? `${successCount} tests passed, ${failures} failed or errored.`
          : `All ${tests.length} tests completed successfully.`
      );
    } catch (error) {
      this.summary.set(extractErrorMessage(error, 'Failed to run tests.'));
    } finally {
      this.running.set(false);
    }
  }

  private async fetchPendingTests(): Promise<RedirectTest[]> {
    const collected: RedirectTest[] = [];
    let cursor: string | undefined;

    do {
      const response = await firstValueFrom(
        this.redirectTestsApi.list({
          domainGroupId: this.data.domainGroupId,
          limit: 20,
          ...(cursor ? { startAfterId: cursor } : {})
        })
      );

      collected.push(...response.data);
      cursor = response.moreStartingAfterId;
    } while (cursor);

    return collected.filter((test) => !this.resultsStore.results()[test.id]);
  }

  private async runTest(test: RedirectTest): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.redirectRulesApi.simulate([buildSimulationEntry(test)])
      );
      const result = response?.results?.[0];
      if (!result) {
        throw new Error('No result returned.');
      }

      const lastResult: RedirectTestResult = {
        matched: result.matched,
        statusCode: result.statusCode,
        target: result.target ?? null
      };

      this.resultsStore.setSuccess(test.id, lastResult);
      return true;
    } catch (error) {
      const message = extractErrorMessage(error, 'Simulation failed.');
      this.resultsStore.setFailure(test.id, message);
      return false;
    }
  }
}
