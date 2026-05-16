import { Injectable, Signal, WritableSignal, effect } from '@angular/core';

type DomainGroupLike = { id: string };
type DomainGroupFilterModel = { domainGroupId: string };

const DOMAIN_GROUP_STORAGE_KEY = 'selected_domain_group_id';

@Injectable({ providedIn: 'root' })
export class DomainGroupFilterPersistenceService {
  bind<TModel extends DomainGroupFilterModel>(
    filterModel: WritableSignal<TModel>,
    domainGroups: Signal<readonly DomainGroupLike[]>
  ): void {
    const persistedGroupId = this.loadPersistedGroupId();
    let initialized = false;

    effect(() => {
      const groups = domainGroups();
      const currentGroupId = filterModel().domainGroupId;
      const hasCurrentGroup = this.hasGroup(groups, currentGroupId);
      const fallbackGroupId = groups.length === 1 ? groups[0].id : '';

      if (!initialized) {
        if (!groups.length) {
          return;
        }

        initialized = true;
        const initialGroupId = hasCurrentGroup
          ? currentGroupId
          : this.hasGroup(groups, persistedGroupId)
            ? persistedGroupId
            : fallbackGroupId;

        if (initialGroupId !== currentGroupId) {
          filterModel.update((model) => ({
            ...model,
            domainGroupId: initialGroupId
          }));
        }
        return;
      }

      if (currentGroupId && !hasCurrentGroup) {
        filterModel.update((model) => ({
          ...model,
          domainGroupId: fallbackGroupId
        }));
      }
    });

    effect(() => {
      const groups = domainGroups();
      const currentGroupId = filterModel().domainGroupId;

      if (!this.hasGroup(groups, currentGroupId)) {
        return;
      }

      this.persistGroupId(currentGroupId);
    });
  }

  private hasGroup(
    groups: readonly DomainGroupLike[],
    groupId: string | null | undefined
  ): groupId is string {
    return !!groupId && groups.some((group) => group.id === groupId);
  }

  private loadPersistedGroupId(): string {
    if (!this.canUseStorage()) {
      return '';
    }

    return localStorage.getItem(DOMAIN_GROUP_STORAGE_KEY) ?? '';
  }

  private persistGroupId(groupId: string): void {
    if (!this.canUseStorage()) {
      return;
    }

    localStorage.setItem(DOMAIN_GROUP_STORAGE_KEY, groupId);
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
