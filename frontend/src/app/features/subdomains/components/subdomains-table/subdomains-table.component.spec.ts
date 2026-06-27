import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Subdomain } from '../../../../core/models/subdomain.model';
import { SubdomainsTableComponent } from './subdomains-table.component';

describe('SubdomainsTableComponent', () => {
  let component: SubdomainsTableComponent;
  let fixture: ComponentFixture<SubdomainsTableComponent>;

  const sampleSubdomain: Subdomain = {
    id: 'subdomain-1',
    name: 'go',
    domainGroupId: 'group-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubdomainsTableComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(SubdomainsTableComponent);
    component = fixture.componentInstance;
  });

  it('shows loading message while subdomains are loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Loading subdomains…');
    expect(root.querySelector('button[mat-flat-button]')).toBeNull();
  });

  it('shows actionable empty state when not loading', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('No subdomains yet');
    expect(root.textContent).toContain('Add a subdomain to route traffic on the LinkShift base host');
    expect(root.querySelector('button[mat-flat-button]')?.textContent?.trim()).toContain(
      'Add subdomain',
    );
  });

  it('shows workspace-filtered empty state when other sites have subdomains', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('workspaceFilterActive', true);
    fixture.componentRef.setInput('totalUnfilteredCount', 3);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('No subdomains in this site');
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

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button[mat-flat-button]',
    ) as HTMLButtonElement;
    button.click();

    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('exposes accessible labels on row action buttons', () => {
    fixture.componentRef.setInput('subdomains', [sampleSubdomain]);
    fixture.detectChanges();

    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('tr.mat-mdc-row button[aria-label]'),
    );

    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.getAttribute('aria-label')).toBe(
      `Change group for subdomain ${sampleSubdomain.name}`,
    );
    expect(buttons[1]?.getAttribute('aria-label')).toBe(
      `Delete subdomain ${sampleSubdomain.name}`,
    );
  });

  it('maps row view models with full host, group labels, and tooltips', () => {
    fixture.componentRef.setInput('subdomains', [
      sampleSubdomain,
      { ...sampleSubdomain, id: 'subdomain-2', name: 'links', domainGroupId: 'group-missing' },
    ]);
    fixture.componentRef.setInput('baseHost', 'https://example.com/');
    fixture.componentRef.setInput('groupMap', {
      'group-1': { name: 'Marketing' },
    });
    fixture.detectChanges();

    const rows = component.rowViewModels();

    expect(rows[0].fullHost).toBe('go.example.com');
    expect(rows[0].groupLabel).toBe('Marketing');
    expect(rows[0].groupTooltip).toBe('Domain group: Marketing (group-1)');
    expect(rows[1].fullHost).toBe('links.example.com');
    expect(rows[1].groupLabel).toBe('group-missing');
    expect(rows[1].groupTooltip).toBe('Domain group ID: group-missing');
  });

  it('falls back to subdomain name when base host is empty', () => {
    fixture.componentRef.setInput('subdomains', [sampleSubdomain]);
    fixture.componentRef.setInput('baseHost', '');
    fixture.detectChanges();

    expect(component.rowViewModels()[0].fullHost).toBe('go');
  });

  it('trackRow returns stable subdomain id', () => {
    fixture.componentRef.setInput('subdomains', [sampleSubdomain]);
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(component.trackRow(0, row)).toBe(sampleSubdomain.id);
  });

  it('renders row data from view models', () => {
    fixture.componentRef.setInput('subdomains', [sampleSubdomain]);
    fixture.componentRef.setInput('baseHost', 'example.com');
    fixture.componentRef.setInput('groupMap', { 'group-1': { name: 'Marketing' } });
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('go.example.com');
    expect(root.textContent).toContain('Marketing');
  });
});
