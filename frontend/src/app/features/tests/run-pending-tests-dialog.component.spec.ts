import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import { RedirectTestsApiService } from '../../core/api/redirect-tests-api.service';
import type { RedirectTest } from '../../core/models/redirect-test.model';
import { RedirectTestResultsStore } from '../../core/store/redirect-test-results.store';
import {
  RunPendingTestsDialogComponent,
  type RunTestOutcome,
} from './run-pending-tests-dialog.component';

describe('RunPendingTestsDialogComponent', () => {
  let component: RunPendingTestsDialogComponent;

  const sampleTest: RedirectTest = {
    id: 'test-1',
    organizationId: 'org-1',
    domainGroupId: 'group-1',
    pathWithQuery: '/promo?utm=email',
    requestData: {},
    expectedResult: {
      matched: true,
      statusCode: 302,
      target: 'https://example.com/landing',
    },
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  const buildFailure = (
    overrides: Partial<RunTestOutcome> & Pick<RunTestOutcome, 'reason'>,
  ): RunTestOutcome => ({
    test: sampleTest,
    actual: null,
    error: null,
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunPendingTestsDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { domainGroupId: 'group-1' },
        },
        {
          provide: MatDialogRef,
          useValue: { close: vi.fn() },
        },
        {
          provide: MatDialog,
          useValue: { open: vi.fn() },
        },
        {
          provide: RedirectTestsApiService,
          useValue: {
            list: vi.fn(() => of({ data: [], moreStartingAfterId: undefined })),
          },
        },
        {
          provide: RedirectRulesApiService,
          useValue: {
            simulate: vi.fn(() => of({ results: [] })),
          },
        },
        RedirectTestResultsStore,
      ],
    }).compileComponents();

    component = TestBed.createComponent(RunPendingTestsDialogComponent).componentInstance;
  });

  it('formats expected redirect result in failureRowViews', () => {
    component.failures.set([
      buildFailure({
        reason: 'failed',
        actual: {
          matched: true,
          statusCode: 301,
          target: 'https://example.com/other',
        },
      }),
    ]);

    const [row] = component.failureRowViews();

    expect(row.expectedText).toBe('302 -> https://example.com/landing');
    expect(row.actualText).toBe('301 -> https://example.com/other');
  });

  it('formats expected no-redirect and missing-target cases in failureRowViews', () => {
    component.failures.set([
      buildFailure({
        reason: 'failed',
        test: {
          ...sampleTest,
          id: 'test-404',
          expectedResult: {
            matched: false,
            statusCode: 404,
            target: null,
          },
        },
        actual: {
          matched: true,
          statusCode: 302,
          target: null,
        },
      }),
      buildFailure({
        reason: 'failed',
        test: {
          ...sampleTest,
          id: 'test-missing-target',
          expectedResult: {
            matched: true,
            statusCode: 302,
            target: null,
          },
        },
        actual: {
          matched: true,
          statusCode: 302,
          target: null,
        },
      }),
    ]);

    const [noRedirectRow, missingTargetRow] = component.failureRowViews();

    expect(noRedirectRow.expectedText).toBe('No redirect (404)');
    expect(noRedirectRow.actualText).toBe('302 (no target)');
    expect(missingTargetRow.expectedText).toBe('302 (missing target)');
    expect(missingTargetRow.actualText).toBe('302 (no target)');
  });

  it('formats actual error and no-result cases in failureRowViews', () => {
    component.failures.set([
      buildFailure({
        reason: 'error',
        error: "Couldn't run simulation.",
      }),
      buildFailure({
        reason: 'error',
        test: { ...sampleTest, id: 'test-no-result' },
        actual: null,
        error: null,
      }),
    ]);

    const [errorRow, noResultRow] = component.failureRowViews();

    expect(errorRow.actualText).toBe("Couldn't run simulation.");
    expect(noResultRow.actualText).toBe('No result');
  });
});
