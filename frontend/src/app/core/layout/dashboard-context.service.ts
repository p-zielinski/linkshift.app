import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const STORAGE_KEY = 'linkshift-active-domain-group';
const LEGACY_STORAGE_KEY = 'selected_domain_group_id';

type DomainGroupLike = { id: string };

@Injectable({
  providedIn: 'root',
})
export class DashboardContextService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly selectedIdState = signal<string>(this.readStored());

  readonly selectedDomainGroupId = this.selectedIdState.asReadonly();

  setSelectedDomainGroupId(groupId: string): void {
    const normalized = groupId.trim();
    if (this.selectedIdState() === normalized) {
      return;
    }

    this.selectedIdState.set(normalized);
    this.persist(normalized);
  }

  clearSelectedDomainGroupId(): void {
    if (!this.selectedIdState()) {
      return;
    }

    this.selectedIdState.set('');
    this.persist('');
  }

  /**
   * Keeps the global selection valid when the domain group list changes.
   */
  reconcileAvailableGroups(
    groups: readonly DomainGroupLike[],
    options?: { allowEmptySelection?: boolean },
  ): void {
    if (!groups.length) {
      this.clearSelectedDomainGroupId();
      return;
    }

    const current = this.selectedIdState();
    if (current && groups.some((group) => group.id === current)) {
      return;
    }

    const stored = this.readStored();
    if (stored && groups.some((group) => group.id === stored)) {
      this.setSelectedDomainGroupId(stored);
      return;
    }

    if (groups.length === 1) {
      this.setSelectedDomainGroupId(groups[0].id);
      return;
    }

    if (options?.allowEmptySelection) {
      this.clearSelectedDomainGroupId();
      return;
    }

    this.setSelectedDomainGroupId(groups[0].id);
  }

  private readStored(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return legacy;
    }

    return '';
  }

  private persist(groupId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      if (groupId) {
        localStorage.setItem(STORAGE_KEY, groupId);
        return;
      }

      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage full or unavailable — keep in-memory selection only.
    }
  }
}
