import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { RedirectTestResultDialogComponent } from './redirect-test-result-dialog.component';

type RunTestOutcome = {
  test: RedirectTest;
  reason: 'passed' | 'failed' | 'error';
  actual: RedirectTestResult | null;
  error: string | null;
};

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
  private readonly dialog = inject(MatDialog);
  private readonly redirectTestsApi = inject(RedirectTestsApiService);
  private readonly redirectRulesApi = inject(RedirectRulesApiService);
  private readonly resultsStore = inject(RedirectTestResultsStore);
  readonly data = inject<RunPendingTestsDialogData>(MAT_DIALOG_DATA);

  readonly total = signal(0);
  readonly completed = signal(0);
  readonly running = signal(true);
  readonly summary = signal<string | null>(null);
  readonly didRun = signal(false);
  readonly failures = signal<RunTestOutcome[]>([]);

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
        this.summary.set('No tests to run.');
        this.running.set(false);
        return;
      }

      const failedTests: RunTestOutcome[] = [];
      const batches = this.chunkTests(tests, 100);
      for (const batch of batches) {
        const outcomes = await this.runBatch(batch);
        outcomes.forEach((outcome) => {
          if (outcome.reason !== 'passed') {
            failedTests.push(outcome);
          }
        });
        this.completed.update((value) => value + batch.length);
      }

      this.failures.set(failedTests);
      const failures = failedTests.length;
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
          limit: 100,
          ...(cursor ? { startAfterId: cursor } : {})
        })
      );

      collected.push(...response.data);
      cursor = response.moreStartingAfterId;
    } while (cursor);

    return collected.filter((test) => !this.resultsStore.results()[test.id]);
  }

  private async runBatch(tests: RedirectTest[]): Promise<RunTestOutcome[]> {
    if (tests.length === 0) {
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.redirectRulesApi.simulate(tests.map(buildSimulationEntry))
      );
      const results = response?.results ?? [];
      return tests.map((test, index) => {
        const result = results[index];
        if (!result) {
          const errorMessage = 'No result returned.';
          this.resultsStore.setFailure(test.id, errorMessage);
          return {
            test,
            reason: 'error',
            actual: null,
            error: errorMessage
          };
        }

        const lastResult: RedirectTestResult = {
          matched: result.matched,
          statusCode: result.statusCode,
          target: result.target ?? null
        };

        this.resultsStore.setSuccess(test.id, lastResult);
        const matches = this.matchesExpected(test, lastResult);
        if (matches) {
          return {
            test,
            reason: 'passed',
            actual: lastResult,
            error: null
          };
        }
        return {
          test,
          reason: 'failed',
          actual: lastResult,
          error: null
        };
      });
    } catch (error) {
      const message = extractErrorMessage(error, 'Simulation failed.');
      return tests.map((test) => {
        this.resultsStore.setFailure(test.id, message);
        return {
          test,
          reason: 'error',
          actual: null,
          error: message
        };
      });
    }
  }

  private matchesExpected(test: RedirectTest, actual: RedirectTestResult): boolean {
    const expected = test.expectedResult;
    return (
      expected.matched === actual.matched &&
      expected.statusCode === actual.statusCode &&
      (expected.target ?? null) === (actual.target ?? null)
    );
  }

  private chunkTests(tests: RedirectTest[], size: number): RedirectTest[][] {
    if (tests.length <= size) {
      return [tests];
    }
    const chunks: RedirectTest[][] = [];
    for (let i = 0; i < tests.length; i += size) {
      chunks.push(tests.slice(i, i + size));
    }
    return chunks;
  }

  formatExpected(test: RedirectTest): string {
    const expected = test.expectedResult;
    if (!expected) {
      return 'Expectation not set';
    }
    if (!expected.matched) {
      return 'No redirect (404)';
    }
    if (!expected.target) {
      return `${expected.statusCode} (missing target)`;
    }
    return `${expected.statusCode} -> ${expected.target}`;
  }

  formatActual(failure: RunTestOutcome): string {
    if (failure.error) {
      return failure.error;
    }
    if (!failure.actual) {
      return 'No result';
    }
    if (!failure.actual.matched) {
      return 'No redirect (404)';
    }
    if (!failure.actual.target) {
      return `${failure.actual.statusCode} (no target)`;
    }
    return `${failure.actual.statusCode} -> ${failure.actual.target}`;
  }

  openDetails(test: RedirectTest): void {
    this.dialog.open(RedirectTestResultDialogComponent, {
      width: 'min(720px, 94vw)',
      maxWidth: '94vw',
      data: {
        test,
        runState: this.resultsStore.results()[test.id] ?? null
      }
    });
  }
}
