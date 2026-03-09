import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import type { RedirectTest, RedirectTestResult } from '../../../../core/models/redirect-test.model';
import type { RedirectTestRunState } from '../../../../core/store/redirect-test-results.store';

type RunStateMap = Record<string, RedirectTestRunState | undefined>;

@Component({
  selector: 'app-tests-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './tests-table.component.html'
})
export class TestsTableComponent {
  readonly tests = input<RedirectTest[]>([]);
  readonly activeGroupId = input('');
  readonly listReady = input(false);
  readonly runStates = input<RunStateMap>({});
  readonly runningTestIds = input<Set<string>>(new Set());

  @Output() runTest = new EventEmitter<RedirectTest>();
  @Output() viewResult = new EventEmitter<RedirectTest>();
  @Output() edit = new EventEmitter<RedirectTest>();
  @Output() delete = new EventEmitter<RedirectTest>();

  readonly columns = ['path', 'expected', 'result', 'actions'];

  formatExpectedResult(test: RedirectTest): string {
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

  formatActualResult(test: RedirectTest): string {
    const runState = this.resolveRunState(test);
    if (runState?.lastError) {
      return runState.lastError;
    }
    if (!runState?.lastResult) {
      return '';
    }

    const { statusCode, target, matched } = runState.lastResult;
    if (!matched) {
      return 'No redirect (404)';
    }
    if (!target) {
      return `${statusCode} (no target)`;
    }
    return `${statusCode} -> ${target}`;
  }

  statusLabel(test: RedirectTest): string {
    return this.computeStatus(test).label;
  }

  statusClass(test: RedirectTest): string {
    return this.computeStatus(test).tone;
  }

  showResultDetails(test: RedirectTest): boolean {
    return this.computeStatus(test).kind !== 'pending';
  }

  isRunning(testId: string): boolean {
    return this.runningTestIds().has(testId);
  }

  onRunTest(test: RedirectTest): void {
    this.runTest.emit(test);
  }

  onViewResult(test: RedirectTest): void {
    this.viewResult.emit(test);
  }

  onEdit(test: RedirectTest): void {
    this.edit.emit(test);
  }

  onDelete(test: RedirectTest): void {
    this.delete.emit(test);
  }

  private resolveRunState(test: RedirectTest): RedirectTestRunState | null {
    return this.runStates()[test.id] ?? null;
  }

  private computeStatus(test: RedirectTest): {
    label: string;
    kind: 'pending' | 'success' | 'warning' | 'danger';
    tone: string;
  } {
    const runState = this.resolveRunState(test);
    const expected = test.expectedResult;

    const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]';

    if (!runState || (!runState.lastRunAt && !runState.lastResult && !runState.lastError)) {
      return {
        label: 'Not run',
        kind: 'pending',
        tone: `${base} bg-app-muted/10 text-app-muted`,
      };
    }

    if (runState.lastError) {
      return {
        label: 'Error',
        kind: 'danger',
        tone: `${base} bg-red-50 text-red-700`,
      };
    }

    if (!runState.lastResult || !expected) {
      return {
        label: 'Needs review',
        kind: 'warning',
        tone: `${base} bg-amber-50 text-amber-700`,
      };
    }

    const matches = this.compareResults(expected, runState.lastResult);
    if (matches) {
      return {
        label: 'Passed',
        kind: 'success',
        tone: `${base} bg-emerald-50 text-emerald-700`,
      };
    }

    return {
      label: 'Failed',
      kind: 'danger',
      tone: `${base} bg-red-50 text-red-700`,
    };
  }

  private compareResults(expected: RedirectTestResult, actual: RedirectTestResult): boolean {
    return (
      expected.matched === actual.matched &&
      expected.statusCode === actual.statusCode &&
      (expected.target ?? null) === (actual.target ?? null)
    );
  }
}
