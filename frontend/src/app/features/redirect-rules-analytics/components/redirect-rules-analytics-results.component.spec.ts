import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpMethod } from '../../../core/models/http-method.model';
import type {
  RedirectRule,
  TopRedirectRuleEntry,
} from '../../../core/models/redirect-rule.model';
import { RedirectRulesAnalyticsResultsComponent } from './redirect-rules-analytics-results.component';

describe('RedirectRulesAnalyticsResultsComponent', () => {
  let component: RedirectRulesAnalyticsResultsComponent;
  let fixture: ComponentFixture<RedirectRulesAnalyticsResultsComponent>;

  const sampleRule = (overrides: Partial<RedirectRule> = {}): RedirectRule => ({
    id: 'rule-1',
    source: '/promo',
    destination: 'https://example.com/landing',
    statusCode: 302,
    matchMethod: [HttpMethod.GET],
    queryMatch: 'ignore',
    pathMatch: 'exact',
    priority: 1,
    domainGroupId: 'group-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  });

  const sampleEntry = (overrides: Partial<TopRedirectRuleEntry> = {}): TopRedirectRuleEntry => ({
    rule: sampleRule(),
    hits: 42,
    topLinkMapKeys: [{ key: 'summer', hits: 30 }],
    topRequestVariants: [
      {
        requestMethod: 'GET',
        requestPath: '/promo',
        requestQuery: '',
        requestUrl: '/promo',
        destination: 'https://example.com/landing',
        linkMapKey: null,
        hits: 20,
      },
      {
        requestMethod: 'GET',
        requestPath: '/promo',
        requestQuery: 'utm=email',
        requestUrl: '/promo?utm=email',
        destination: 'https://example.com/email',
        linkMapKey: null,
        hits: 12,
      },
      {
        requestMethod: 'POST',
        requestPath: '/promo',
        requestQuery: '',
        requestUrl: '/promo',
        destination: 'https://example.com/api',
        linkMapKey: null,
        hits: 8,
      },
      {
        requestMethod: 'GET',
        requestPath: '/promo',
        requestQuery: 'extra',
        requestUrl: '/promo?extra',
        destination: 'https://example.com/extra',
        linkMapKey: null,
        hits: 2,
      },
    ],
    ...overrides,
  });

  const chartOptionsStub = {
    chart: { type: 'bar' as const, height: 400 },
    xaxis: { categories: [] },
    plotOptions: { bar: { horizontal: true } },
    dataLabels: { enabled: false },
    tooltip: {},
    grid: {},
    colors: ['#c03762'],
    fill: {},
    stroke: {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectRulesAnalyticsResultsComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectRulesAnalyticsResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('chartOptions', chartOptionsStub);
  });

  it('shows loading placeholder while analytics are loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Loading analytics…');
  });

  it('shows error message and Try again button when analytics fail', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', "Couldn't load analytics.");
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain("Couldn't load analytics.");
    expect(root.querySelector('button[mat-stroked-button]')?.textContent?.trim()).toBe('Try again');
  });

  it('emits retry when Try again is clicked', () => {
    const retrySpy = vi.fn();
    component.retry.subscribe(retrySpy);

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', "Couldn't load analytics.");
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button[mat-stroked-button]',
    ) as HTMLButtonElement;
    button.click();

    expect(retrySpy).toHaveBeenCalledTimes(1);
  });

  it('uses Source and Link keys labels in redirect-rules mode', () => {
    fixture.componentRef.setInput('campaignMode', false);

    expect(component.sourceRowLabel()).toBe('Source');
    expect(component.linkKeysRowLabel()).toBe('Link keys');
  });

  it('uses Short link and Top keys labels in campaign mode', () => {
    fixture.componentRef.setInput('campaignMode', true);

    expect(component.sourceRowLabel()).toBe('Short link');
    expect(component.linkKeysRowLabel()).toBe('Top keys');
  });

  it('maps entry row views with destination, highlight, and variant preview', () => {
    const entry = sampleEntry({
      rule: sampleRule({ id: 'rule-2', destination: '  https://example.com/trimmed  ' }),
    });

    fixture.componentRef.setInput('entries', [entry]);
    fixture.componentRef.setInput('campaignMode', false);
    fixture.componentRef.setInput('highlightedRuleId', 'rule-2');
    fixture.componentRef.setInput('highlightedLinkKey', null);

    const [row] = component.entryRowViews();

    expect(row.destinationValue).toBe('https://example.com/trimmed');
    expect(row.isHighlighted).toBe(true);
    expect(row.sourceRowLabel).toBe('Source');
    expect(row.linkKeysRowLabel).toBe('Link keys');
    expect(row.topRequestVariantsPreview).toHaveLength(3);
    expect(row.topRequestVariantsPreview[0].requestUrl).toBe('/promo');
    expect(row.topRequestVariantsPreview[2].requestUrl).toBe('/promo');
  });

  it('falls back to dynamic destination label when destination is empty', () => {
    fixture.componentRef.setInput('entries', [
      sampleEntry({ rule: sampleRule({ destination: null }) }),
    ]);
    fixture.componentRef.setInput('campaignMode', false);

    expect(component.entryRowViews()[0].destinationValue).toBe('Dynamic / link map destination');
  });

  it('falls back to campaign destination label when destination is empty', () => {
    fixture.componentRef.setInput('entries', [
      sampleEntry({ rule: sampleRule({ destination: '' }) }),
    ]);
    fixture.componentRef.setInput('campaignMode', true);

    const [row] = component.entryRowViews();

    expect(row.destinationValue).toBe('Set by link key');
    expect(row.sourceRowLabel).toBe('Short link');
    expect(row.linkKeysRowLabel).toBe('Top keys');
  });

  it('highlights rows by link key when rule id does not match', () => {
    const entry = sampleEntry({
      rule: sampleRule({ id: 'rule-3' }),
      topLinkMapKeys: [
        { key: 'alpha', hits: 5 },
        { key: 'beta', hits: 2 },
      ],
    });

    fixture.componentRef.setInput('entries', [entry]);
    fixture.componentRef.setInput('highlightedRuleId', null);
    fixture.componentRef.setInput('highlightedLinkKey', 'beta');

    expect(component.entryRowViews()[0].isHighlighted).toBe(true);
  });

  it('does not highlight rows when no highlight inputs match', () => {
    fixture.componentRef.setInput('entries', [sampleEntry()]);
    fixture.componentRef.setInput('highlightedRuleId', 'other-rule');
    fixture.componentRef.setInput('highlightedLinkKey', 'missing-key');

    expect(component.entryRowViews()[0].isHighlighted).toBe(false);
  });
});
