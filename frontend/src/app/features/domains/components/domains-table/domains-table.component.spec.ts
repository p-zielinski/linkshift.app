import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Domain } from '../../../../core/models/domain.model';
import { DomainsTableComponent } from './domains-table.component';

describe('DomainsTableComponent', () => {
  let component: DomainsTableComponent;
  let fixture: ComponentFixture<DomainsTableComponent>;

  const sampleDomain: Domain = {
    id: 'domain-1',
    name: 'go.example.com',
    domainGroupId: 'group-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomainsTableComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(DomainsTableComponent);
    component = fixture.componentInstance;
  });

  it('shows loading message while domains are loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Loading domains…');
    expect(root.querySelector('button[mat-flat-button]')).toBeNull();
  });

  it('shows actionable empty state when not loading', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('No domains yet');
    expect(root.textContent).toContain('Add a hostname to use for redirect routing');
    expect(root.querySelector('button[mat-flat-button]')?.textContent?.trim()).toContain(
      'Add domain',
    );
  });

  it('shows workspace-filtered empty state when other sites have domains', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('workspaceFilterActive', true);
    fixture.componentRef.setInput('totalUnfilteredCount', 3);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('No domains in this site');
    expect(root.textContent).toContain(
      'Switch site in the page header Site menu, or choose All sites, to see everything.',
    );
    expect(root.querySelector('button[mat-flat-button]')).toBeNull();
  });

  it('emits create when empty-state CTA is clicked', () => {
    const createSpy = vi.fn();
    component.create.subscribe(createSpy);

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector('button[mat-flat-button]') as HTMLButtonElement;
    button.click();

    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('exposes accessible labels on row action buttons', () => {
    fixture.componentRef.setInput('domains', [sampleDomain]);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(root.querySelectorAll('tr.mat-mdc-row button[aria-label]'));

    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.getAttribute('aria-label')).toBe(`Edit domain ${sampleDomain.name}`);
    expect(buttons[1]?.getAttribute('aria-label')).toBe(`Delete domain ${sampleDomain.name}`);
  });

  it('maps row view models with group labels and tooltips from groupMap', () => {
    fixture.componentRef.setInput('domains', [
      sampleDomain,
      { ...sampleDomain, id: 'domain-2', name: 'links.example.com', domainGroupId: 'group-missing' },
    ]);
    fixture.componentRef.setInput('groupMap', {
      'group-1': { name: 'Marketing' },
    });
    fixture.detectChanges();

    const rows = component.rowViewModels();

    expect(rows[0].groupLabel).toBe('Marketing');
    expect(rows[0].groupTooltip).toBe('Domain group: Marketing (group-1)');
    expect(rows[1].groupLabel).toBe('group-missing');
    expect(rows[1].groupTooltip).toBe('Domain group ID: group-missing');
  });

  it('trackRow returns stable domain id', () => {
    fixture.componentRef.setInput('domains', [sampleDomain]);
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(component.trackRow(0, row)).toBe(sampleDomain.id);
  });

  it('renders row data from view models', () => {
    fixture.componentRef.setInput('domains', [sampleDomain]);
    fixture.componentRef.setInput('groupMap', { 'group-1': { name: 'Marketing' } });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('go.example.com');
    expect(root.textContent).toContain('Marketing');
  });
});
