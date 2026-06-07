import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpMethod } from '../../../../core/models/http-method.model';
import type { RedirectRule } from '../../../../core/models/redirect-rule.model';
import { RedirectRulesTableComponent } from './redirect-rules-table.component';

describe('RedirectRulesTableComponent', () => {
  let component: RedirectRulesTableComponent;
  let fixture: ComponentFixture<RedirectRulesTableComponent>;

  const sampleRule: RedirectRule = {
    id: 'rule-1',
    source: '/promo',
    destination: 'https://example.com/landing',
    statusCode: 302,
    matchMethod: [HttpMethod.GET],
    queryMatch: 'exact',
    pathMatch: 'exact',
    priority: 10,
    domainGroupId: 'group-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectRulesTableComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectRulesTableComponent);
    component = fixture.componentInstance;
  });

  function emptyStateText(): string {
    const cell = (fixture.nativeElement as HTMLElement).querySelector('tr.mat-row td');
    return cell?.textContent?.trim() ?? '';
  }

  it('shows loading message while redirect rules are loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(emptyStateText()).toBe('Loading redirect rules…');
  });

  it('prompts to select a domain group when none is active', () => {
    fixture.componentRef.setInput('rules', []);
    fixture.componentRef.setInput('activeGroupId', '');
    fixture.detectChanges();

    expect(emptyStateText()).toBe(
      'Choose a site in the page header Site menu to view redirect rules.',
    );
  });

  it('shows no rules message when a domain group is selected', () => {
    fixture.componentRef.setInput('rules', []);
    fixture.componentRef.setInput('activeGroupId', 'group-1');
    fixture.detectChanges();

    expect(emptyStateText()).toBe('No redirect rules found.');
  });

  it('maps active rule match and state fields in row view models', () => {
    fixture.componentRef.setInput('rules', [sampleRule]);
    fixture.componentRef.setInput('groupMap', { 'group-1': { name: 'Marketing' } });
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(row.matchMethodsText).toBe('GET');
    expect(row.pathMatchIcon).toBe('rule');
    expect(row.pathMatchTooltip).toBe('Path match: exact');
    expect(row.queryMatchIcon).toBe('manage_search');
    expect(row.queryMatchTooltip).toBe('Query match: exact (includes query)');
    expect(row.stateLabel).toBe('Active');
    expect(row.stateClass).toContain('bg-emerald-50');
    expect(row.groupLabel).toBe('Marketing');
    expect(row.groupTooltip).toBe('Domain group: Marketing (group-1)');
  });

  it('maps blocked rule and prefix/subset match variants in row view models', () => {
    fixture.componentRef.setInput('rules', [
      {
        ...sampleRule,
        id: 'rule-2',
        matchMethod: [],
        pathMatch: 'prefix',
        queryMatch: 'subset',
        isBlocked: true,
        domainGroupId: 'group-unknown',
      },
    ]);
    fixture.componentRef.setInput('groupMap', {});
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(row.matchMethodsText).toBe('All');
    expect(row.pathMatchIcon).toBe('call_split');
    expect(row.pathMatchTooltip).toBe('Path match: prefix (/v1/*)');
    expect(row.queryMatchIcon).toBe('filter_alt');
    expect(row.queryMatchTooltip).toBe('Query match: subset (extra params allowed)');
    expect(row.stateLabel).toBe('Blocked');
    expect(row.stateClass).toContain('bg-red-50');
    expect(row.groupLabel).toBe('group-unknown');
    expect(row.groupTooltip).toBe('Domain group Id: group-unknown');
  });

  it('trackRow returns stable rule id', () => {
    fixture.componentRef.setInput('rules', [sampleRule]);
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(component.trackRow(0, row)).toBe(sampleRule.id);
  });

  it('renders row data from view models', () => {
    fixture.componentRef.setInput('rules', [sampleRule]);
    fixture.componentRef.setInput('activeGroupId', 'group-1');
    fixture.componentRef.setInput('groupMap', { 'group-1': { name: 'Marketing' } });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('/promo');
    expect(root.textContent).toContain('GET');
    expect(root.textContent).toContain('Active');
    expect(root.textContent).toContain('Marketing');
  });
});
