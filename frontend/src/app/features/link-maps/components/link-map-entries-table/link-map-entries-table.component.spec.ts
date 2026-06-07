import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { LinkMapEntry } from '../../../../core/models/link-map.model';
import { LinkMapEntriesTableComponent } from './link-map-entries-table.component';

describe('LinkMapEntriesTableComponent', () => {
  let component: LinkMapEntriesTableComponent;
  let fixture: ComponentFixture<LinkMapEntriesTableComponent>;

  const sampleEntry: LinkMapEntry = {
    id: 'entry-1',
    linkMapId: 'map-1',
    key: 'promo',
    destination: 'https://example.com/promo',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkMapEntriesTableComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkMapEntriesTableComponent);
    component = fixture.componentInstance;
  });

  it('shows loading message while entries are loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Loading entries…');
  });

  it('shows empty state when not loading', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('No entries found.');
  });

  it('maps isSelected from selectedIds in row view models', () => {
    fixture.componentRef.setInput('entries', [
      sampleEntry,
      { ...sampleEntry, id: 'entry-2', key: 'sale' },
    ]);
    fixture.componentRef.setInput('selectedIds', new Set(['entry-2']));
    fixture.detectChanges();

    const rows = component.rowViewModels();

    expect(rows[0].isSelected).toBe(false);
    expect(rows[1].isSelected).toBe(true);
  });

  it('updates isSelected when selectedIds changes', () => {
    fixture.componentRef.setInput('entries', [sampleEntry]);
    fixture.componentRef.setInput('selectedIds', new Set<string>());
    fixture.detectChanges();

    expect(component.rowViewModels()[0].isSelected).toBe(false);

    fixture.componentRef.setInput('selectedIds', new Set(['entry-1']));
    fixture.detectChanges();

    expect(component.rowViewModels()[0].isSelected).toBe(true);
  });

  it('emits toggleOne with entry id and checked state', () => {
    const toggleSpy = vi.fn();
    component.toggleOne.subscribe(toggleSpy);

    component.onToggleOne('entry-1', true);

    expect(toggleSpy).toHaveBeenCalledWith({ id: 'entry-1', checked: true });
  });

  it('emits edit with the selected entry', () => {
    const editSpy = vi.fn();
    component.edit.subscribe(editSpy);

    component.onEdit(sampleEntry);

    expect(editSpy).toHaveBeenCalledWith(sampleEntry);
  });

  it('trackRow returns stable entry id', () => {
    fixture.componentRef.setInput('entries', [sampleEntry]);
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(component.trackRow(0, row)).toBe(sampleEntry.id);
  });

  it('renders row data from view models', () => {
    fixture.componentRef.setInput('entries', [sampleEntry]);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('promo');
    expect(root.textContent).toContain('https://example.com/promo');
  });
});
