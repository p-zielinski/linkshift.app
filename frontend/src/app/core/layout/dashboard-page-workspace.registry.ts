import { Injectable, Signal, computed, signal } from '@angular/core';

export type DashboardPageWorkspaceBinding = {
  groups: Signal<readonly { id: string; name: string }[]>;
  selectedId: Signal<string>;
  setSelectedId: (id: string) => void;
  allowAllSites: Signal<boolean>;
  allOptionLabel: Signal<string>;
  label: Signal<string>;
};

@Injectable({
  providedIn: 'root',
})
export class DashboardPageWorkspaceRegistry {
  private readonly bindingState = signal<DashboardPageWorkspaceBinding | null>(null);

  readonly active = computed(() => {
    const binding = this.bindingState();
    return !!binding && binding.groups().length > 0;
  });

  readonly binding = this.bindingState.asReadonly();

  attach(binding: DashboardPageWorkspaceBinding): void {
    this.bindingState.set(binding);
  }

  detach(): void {
    this.bindingState.set(null);
  }
}

export function attachDashboardPageWorkspace(
  destroyRef: { onDestroy: (callback: () => void) => void },
  registry: DashboardPageWorkspaceRegistry,
  binding: DashboardPageWorkspaceBinding,
): void {
  registry.attach(binding);
  destroyRef.onDestroy(() => registry.detach());
}
