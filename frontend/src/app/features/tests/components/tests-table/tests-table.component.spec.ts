import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { RedirectTest } from '../../../../core/models/redirect-test.model';
import { TestsTableComponent } from './tests-table.component';

describe('TestsTableComponent', () => {
  let component: TestsTableComponent;
  let fixture: ComponentFixture<TestsTableComponent>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestsTableComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestsTableComponent);
    component = fixture.componentInstance;
  });

  it('maps not-run state in row view models', () => {
    fixture.componentRef.setInput('tests', [sampleTest]);
    fixture.componentRef.setInput('runStates', {});
    fixture.componentRef.setInput('runningTestIds', new Set());
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(row.expectedResultText).toBe('302 -> https://example.com/landing');
    expect(row.actualResultText).toBe('');
    expect(row.statusLabel).toBe('Not run');
    expect(row.statusClass).toContain('bg-app-muted/10');
    expect(row.showResultDetails).toBe(false);
    expect(row.isRunning).toBe(false);
    expect(row.runTooltip).toBe('Run test');
    expect(row.runAriaLabel).toBe('Run test for /promo?utm=email');
  });

  it('maps passed state in row view models', () => {
    fixture.componentRef.setInput('tests', [sampleTest]);
    fixture.componentRef.setInput('runStates', {
      'test-1': {
        lastRunAt: '2026-06-02T00:00:00.000Z',
        lastError: null,
        lastResult: {
          matched: true,
          statusCode: 302,
          target: 'https://example.com/landing',
        },
      },
    });
    fixture.componentRef.setInput('runningTestIds', new Set());
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(row.actualResultText).toBe('302 -> https://example.com/landing');
    expect(row.statusLabel).toBe('Passed');
    expect(row.statusClass).toContain('bg-emerald-50');
    expect(row.showResultDetails).toBe(true);
    expect(row.runTooltip).toBe('Re-run test');
    expect(row.runAriaLabel).toBe('Re-run test for /promo?utm=email');
  });

  it('maps error state in row view models', () => {
    fixture.componentRef.setInput('tests', [sampleTest]);
    fixture.componentRef.setInput('runStates', {
      'test-1': {
        lastRunAt: '2026-06-02T00:00:00.000Z',
        lastError: 'Request timed out',
        lastResult: null,
      },
    });
    fixture.componentRef.setInput('runningTestIds', new Set(['test-1']));
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(row.actualResultText).toBe('Request timed out');
    expect(row.statusLabel).toBe('Error');
    expect(row.statusClass).toContain('bg-red-50');
    expect(row.showResultDetails).toBe(true);
    expect(row.isRunning).toBe(true);
    expect(row.runTooltip).toBe('Re-run test');
    expect(row.runAriaLabel).toBe('Re-run test for /promo?utm=email');
  });

  it('trackRow returns stable test id', () => {
    fixture.componentRef.setInput('tests', [sampleTest]);
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(component.trackRow(0, row)).toBe(sampleTest.id);
  });

  it('renders row data from view models', () => {
    fixture.componentRef.setInput('tests', [sampleTest]);
    fixture.componentRef.setInput('activeGroupId', 'group-1');
    fixture.componentRef.setInput('listReady', true);
    fixture.componentRef.setInput('runStates', {
      'test-1': {
        lastRunAt: '2026-06-02T00:00:00.000Z',
        lastError: null,
        lastResult: {
          matched: true,
          statusCode: 302,
          target: 'https://example.com/landing',
        },
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('/promo?utm=email');
    expect(root.textContent).toContain('302 -> https://example.com/landing');
    expect(root.textContent).toContain('Passed');
  });
});
