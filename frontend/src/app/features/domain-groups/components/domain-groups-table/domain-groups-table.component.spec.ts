import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { DomainGroup } from '../../../../core/models/domain-group.model';
import { DomainGroupsTableComponent } from './domain-groups-table.component';

describe('DomainGroupsTableComponent', () => {
  let component: DomainGroupsTableComponent;
  let fixture: ComponentFixture<DomainGroupsTableComponent>;

  const sampleGroup: DomainGroup = {
    id: 'group-1',
    name: 'Marketing',
    organizationId: 'org-1',
    robotsPolicy: 'ALLOW_ALL',
    redirectDeliveryMode: 'INSTANT',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomainGroupsTableComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(DomainGroupsTableComponent);
    component = fixture.componentInstance;
  });

  it('shows loading message while domain groups are loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Loading domain groups…');
    expect(root.querySelector('button[mat-flat-button]')).toBeNull();
  });

  it('shows actionable empty state when not loading', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('No domain groups yet');
    expect(root.textContent).toContain('Create a group to organize domains and redirect rules');
    expect(root.querySelector('button[mat-flat-button]')?.textContent?.trim()).toContain(
      'Add group',
    );
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

  it('maps row view models with redirect and robots labels', () => {
    fixture.componentRef.setInput('groups', [
      sampleGroup,
      {
        ...sampleGroup,
        id: 'group-2',
        name: 'Legacy',
        robotsPolicy: 'NONE',
        redirectDeliveryMode: 'WITH_NOTICE',
      },
    ]);
    fixture.componentRef.setInput('domainCounts', { 'group-1': 2, 'group-2': 0 });
    fixture.componentRef.setInput('domainsLoaded', true);
    fixture.detectChanges();

    const rows = component.rowViewModels();

    expect(rows[0].redirectLabel).toBe('Instant');
    expect(rows[0].redirectClass).toBe('bg-app-muted/10 text-app-muted');
    expect(rows[0].robotsLabel).toBe('Allow all');
    expect(rows[0].robotsActive).toBe(true);
    expect(rows[0].robotsClass).toBe('bg-green-50 text-green-700');
    expect(rows[1].redirectLabel).toBe('With notice');
    expect(rows[1].redirectClass).toBe('bg-blue-50 text-blue-700');
    expect(rows[1].robotsLabel).toBe('None');
    expect(rows[1].robotsActive).toBe(false);
    expect(rows[1].robotsClass).toBe('bg-app-muted/10 text-app-muted');
  });

  it('maps domain counts and delete gating in row view models', () => {
    fixture.componentRef.setInput('groups', [sampleGroup]);
    fixture.componentRef.setInput('domainCounts', { 'group-1': 3 });
    fixture.componentRef.setInput('domainsLoaded', true);
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(row.domainCount).toBe(3);
    expect(row.domainCountTooltip).toBe('3 domains linked');
    expect(row.canDelete).toBe(false);
    expect(row.deleteTooltip).toBe('Remove linked domains before deleting this group.');
  });

  it('allows delete only when domains are loaded and count is zero', () => {
    fixture.componentRef.setInput('groups', [sampleGroup]);
    fixture.componentRef.setInput('domainCounts', { 'group-1': 0 });
    fixture.componentRef.setInput('domainsLoaded', false);
    fixture.detectChanges();

    expect(component.rowViewModels()[0].canDelete).toBe(false);
    expect(component.rowViewModels()[0].deleteTooltip).toBe(
      'Domain data is still loading. Try again in a moment.',
    );

    fixture.componentRef.setInput('domainsLoaded', true);
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(row.canDelete).toBe(true);
    expect(row.deleteTooltip).toBe('Delete domain group and its redirect rules.');
  });

  it('trackRow returns stable group id', () => {
    fixture.componentRef.setInput('groups', [sampleGroup]);
    fixture.detectChanges();

    const [row] = component.rowViewModels();

    expect(component.trackRow(0, row)).toBe(sampleGroup.id);
  });

  it('renders row data from view models', () => {
    fixture.componentRef.setInput('groups', [sampleGroup]);
    fixture.componentRef.setInput('domainCounts', { 'group-1': 2 });
    fixture.componentRef.setInput('domainsLoaded', true);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Marketing');
    expect(root.textContent).toContain('Instant');
    expect(root.textContent).toContain('Allow all');
    expect(root.textContent).toContain('2');
  });
});
