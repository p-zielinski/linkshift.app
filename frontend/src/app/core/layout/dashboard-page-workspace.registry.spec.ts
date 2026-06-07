import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  DashboardPageWorkspaceRegistry,
  attachDashboardPageWorkspace,
} from './dashboard-page-workspace.registry';

describe('DashboardPageWorkspaceRegistry', () => {
  let registry: DashboardPageWorkspaceRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    registry = TestBed.inject(DashboardPageWorkspaceRegistry);
  });

  it('is inactive until a page attaches a binding', () => {
    expect(registry.active()).toBe(false);
  });

  it('is inactive when binding has no groups', () => {
    registry.attach({
      groups: signal([]),
      selectedId: signal(''),
      setSelectedId: () => undefined,
      allowAllSites: signal(false),
      allOptionLabel: signal('All sites'),
      label: signal('Site'),
    });

    expect(registry.active()).toBe(false);
    expect(registry.binding()).toBeTruthy();
  });

  it('exposes the attached binding while active', () => {
    const groups = signal([{ id: 'g1', name: 'Main site' }]);
    const selectedId = signal('g1');

    registry.attach({
      groups,
      selectedId,
      setSelectedId: (id) => selectedId.set(id),
      allowAllSites: signal(false),
      allOptionLabel: signal('All sites'),
      label: signal('Site'),
    });

    expect(registry.active()).toBe(true);
    expect(registry.binding()?.selectedId()).toBe('g1');

    registry.detach();
    expect(registry.active()).toBe(false);
  });

  it('detaches on destroy via attachDashboardPageWorkspace', () => {
    const destroyCallbacks: Array<() => void> = [];
    const destroyRef = {
      onDestroy: (callback: () => void) => destroyCallbacks.push(callback),
    };

    attachDashboardPageWorkspace(destroyRef, registry, {
      groups: signal([{ id: 'g1', name: 'Main site' }]),
      selectedId: signal('g1'),
      setSelectedId: () => undefined,
      allowAllSites: signal(false),
      allOptionLabel: signal('All sites'),
      label: signal('Site'),
    });

    expect(registry.active()).toBe(true);
    destroyCallbacks.forEach((callback) => callback());
    expect(registry.active()).toBe(false);
  });
});
