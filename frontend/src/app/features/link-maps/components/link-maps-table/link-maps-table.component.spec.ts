import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { LinkMap } from '../../../../core/models/link-map.model';
import { LinkMapsTableComponent } from './link-maps-table.component';

describe('LinkMapsTableComponent', () => {
  let component: LinkMapsTableComponent;
  let fixture: ComponentFixture<LinkMapsTableComponent>;

  const sampleMap: LinkMap = {
    id: 'map-1',
    name: 'Campaign links',
    domainGroupId: 'group-1',
    caseSensitive: false,
    queryMatch: 'exact',
    fallbackDestination: 'https://example.com/fallback',
    entriesCount: 0,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkMapsTableComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkMapsTableComponent);
    component = fixture.componentInstance;
  });

  it('shows site-selection empty state when no active group is selected', () => {
    fixture.componentRef.setInput('activeGroupId', '');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Select a site in the workspace menu above to view link maps.');
  });

  it('shows loading message while link maps are loading', () => {
    fixture.componentRef.setInput('activeGroupId', 'group-1');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Loading link maps…');
  });

  it('shows empty state when active group has no link maps', () => {
    fixture.componentRef.setInput('activeGroupId', 'group-1');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('No link maps found.');
  });

  it('maps row view models with query match labels, icons, and tooltips', () => {
    fixture.componentRef.setInput('maps', [
      sampleMap,
      { ...sampleMap, id: 'map-2', name: 'Ignore map', queryMatch: 'ignore' },
      { ...sampleMap, id: 'map-3', name: 'Subset map', queryMatch: 'subset' },
    ]);
    fixture.detectChanges();

    const rows = component.rowViewModels();

    expect(rows[0].queryMatchLabel).toBe('Exact');
    expect(rows[0].queryMatchIcon).toBe('manage_search');
    expect(rows[0].queryMatchTooltip).toBe('Query match: exact (path + query)');
    expect(rows[1].queryMatchLabel).toBe('Ignore');
    expect(rows[1].queryMatchIcon).toBe('search_off');
    expect(rows[1].queryMatchTooltip).toBe('Query match: ignore (path only)');
    expect(rows[2].queryMatchLabel).toBe('Subset');
    expect(rows[2].queryMatchIcon).toBe('filter_alt');
    expect(rows[2].queryMatchTooltip).toBe('Query match: subset (extra params allowed)');
  });

  it('maps delete gating in row view models', () => {
    fixture.componentRef.setInput('maps', [
      sampleMap,
      { ...sampleMap, id: 'map-2', name: 'Busy map', entriesCount: 4 },
    ]);
    fixture.detectChanges();

    const rows = component.rowViewModels();

    expect(rows[0].canDelete).toBe(true);
    expect(rows[0].deleteTooltip).toBe('Delete link map');
    expect(rows[1].canDelete).toBe(false);
    expect(rows[1].deleteTooltip).toBe(
      'This link map cannot be deleted while it contains entries. Remove all entries first.',
    );
  });

  it('does not emit delete when map still has entries', () => {
    const deleteSpy = vi.fn();
    component.delete.subscribe(deleteSpy);

    component.onDelete({ ...sampleMap, entriesCount: 2 });

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('emits delete when map has no entries', () => {
    const deleteSpy = vi.fn();
    component.delete.subscribe(deleteSpy);

    component.onDelete(sampleMap);

    expect(deleteSpy).toHaveBeenCalledWith(sampleMap);
  });

  it('trackRow returns stable map id', () => {
    fixture.componentRef.setInput('maps', [sampleMap]);
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(component.trackRow(0, row)).toBe(sampleMap.id);
  });

  it('renders row data from view models', () => {
    fixture.componentRef.setInput('activeGroupId', 'group-1');
    fixture.componentRef.setInput('maps', [sampleMap]);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Campaign links');
    expect(root.textContent).toContain('Exact');
    expect(root.textContent).toContain('https://example.com/fallback');
  });
});
