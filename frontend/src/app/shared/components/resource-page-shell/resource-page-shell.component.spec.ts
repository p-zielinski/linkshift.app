import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPageWorkspaceRegistry } from '../../../core/layout/dashboard-page-workspace.registry';
import { ResourcePageShellComponent } from './resource-page-shell.component';

describe('ResourcePageShellComponent', () => {
  let fixture: ComponentFixture<ResourcePageShellComponent>;
  let registry: DashboardPageWorkspaceRegistry;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcePageShellComponent],
    }).compileComponents();

    registry = TestBed.inject(DashboardPageWorkspaceRegistry);
    fixture = TestBed.createComponent(ResourcePageShellComponent);
    fixture.detectChanges();
  });

  function workspaceSwitcher(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('app-workspace-switcher');
  }

  function bodyZone(): HTMLElement | null {
    const root = fixture.nativeElement as HTMLElement;
    const header = root.querySelector('header.shrink-0');
    return header?.nextElementSibling as HTMLElement | null;
  }

  it('applies overflow-y-auto to the body zone by default', () => {
    const body = bodyZone();
    expect(body).toBeTruthy();
    expect(body!.classList.contains('overflow-y-auto')).toBe(true);
    expect(body!.classList.contains('overflow-hidden')).toBe(false);
  });

  it('applies overflow-hidden when bodyScroll is false', () => {
    fixture.componentRef.setInput('bodyScroll', false);
    fixture.detectChanges();

    const body = bodyZone();
    expect(body).toBeTruthy();
    expect(body!.classList.contains('overflow-hidden')).toBe(true);
    expect(body!.classList.contains('overflow-y-auto')).toBe(false);
  });

  it('uses flex-1 on the inner layout root so table pages inherit shell height', () => {
    const root = (fixture.nativeElement as HTMLElement).firstElementChild as HTMLElement;

    expect(root.classList.contains('flex-1')).toBe(true);
    expect(root.classList.contains('h-full')).toBe(false);
    expect(root.classList.contains('min-h-0')).toBe(true);
    expect(root.classList.contains('overflow-hidden')).toBe(true);
  });

  it('does not render workspace switcher when no page binding is attached', () => {
    expect(workspaceSwitcher()).toBeNull();
  });

  it('does not render workspace switcher when binding has no groups', () => {
    registry.attach({
      groups: signal([]),
      selectedId: signal(''),
      setSelectedId: () => undefined,
      allowAllSites: signal(false),
      allOptionLabel: signal('All sites'),
      label: signal('Site'),
    });
    fixture.detectChanges();

    expect(registry.active()).toBe(false);
    expect(workspaceSwitcher()).toBeNull();
  });

  it('renders workspace switcher when page workspace is active', () => {
    registry.attach({
      groups: signal([{ id: 'g1', name: 'Main site' }]),
      selectedId: signal('g1'),
      setSelectedId: () => undefined,
      allowAllSites: signal(false),
      allOptionLabel: signal('All sites'),
      label: signal('Site'),
    });
    fixture.detectChanges();

    expect(registry.active()).toBe(true);
    expect(workspaceSwitcher()).toBeTruthy();
  });
});
