import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardModeService } from '../../../../core/layout/dashboard-mode.service';
import type { AggregatedLinkRow } from '../../links-aggregation.util';
import { LinksTableComponent } from './links-table.component';

describe('LinksTableComponent', () => {
  let component: LinksTableComponent;
  let fixture: ComponentFixture<LinksTableComponent>;
  let modeService: DashboardModeService;

  const sampleRow: AggregatedLinkRow = {
    id: 'link-1',
    domainGroupId: 'group-1',
    linkMapId: 'map-1',
    linkMapName: 'Campaign links',
    redirectRuleId: 'rule-1',
    host: 'go.example.com',
    shortPath: '/go/summer',
    shortUrls: ['https://go.example.com/go/summer', 'https://links.example.com/go/summer'],
    shortUrl: 'https://go.example.com/go/summer',
    key: 'summer',
    destination: 'https://example.com/summer',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LinksTableComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    modeService = TestBed.inject(DashboardModeService);
    fixture = TestBed.createComponent(LinksTableComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('hides link map column in campaign mode', () => {
    modeService.setMode('campaign');

    expect(component.columns()).toEqual(['shortPath', 'destination', 'actions']);
  });

  it('shows link map column in advanced mode', () => {
    modeService.setMode('advanced');

    expect(component.columns()).toEqual(['shortPath', 'destination', 'linkMapName', 'actions']);
  });

  it('shows short path in the table and full URLs in tooltip', () => {
    fixture.componentRef.setInput('rows', [sampleRow]);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const cell = root.querySelector('tr.mat-mdc-row td') as HTMLElement;

    expect(cell.textContent?.trim()).toBe('/go/summer');
    expect(component.shortPathTooltip(sampleRow)).toContain('https://go.example.com/go/summer');
    expect(component.shortPathTooltip(sampleRow)).toContain('https://links.example.com/go/summer');
  });

  it('shows workspace-filtered empty state when other sites have links', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('workspaceFilterActive', true);
    fixture.componentRef.setInput('totalUnfilteredCount', 2);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('No links in this site');
    expect(root.textContent).toContain(
      'Switch site in the page header Site menu, or choose All sites, to see everything.',
    );
    expect(root.querySelector('button[mat-flat-button]')).toBeNull();
  });

  it('shows org-wide empty state when workspace filter is active but org has no links', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('workspaceFilterActive', true);
    fixture.componentRef.setInput('totalUnfilteredCount', 0);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('No links yet');
    expect(root.querySelector('button[mat-flat-button]')?.textContent?.trim()).toContain(
      'Create link',
    );
  });

  it('trackRow returns stable link row id', () => {
    expect(component.trackRow(0, sampleRow)).toBe(sampleRow.id);
  });

  it('exposes accessible labels on row action buttons', () => {
    fixture.componentRef.setInput('rows', [sampleRow]);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(root.querySelectorAll('tr.mat-mdc-row button[aria-label]'));

    expect(buttons).toHaveLength(3);
    expect(buttons[0]?.getAttribute('aria-label')).toBe('Edit link for /go/summer');
    expect(buttons[1]?.getAttribute('aria-label')).toBe('Copy short URL for /go/summer');
    expect(buttons[2]?.getAttribute('aria-label')).toBe('Open analytics for /go/summer');
  });
});
