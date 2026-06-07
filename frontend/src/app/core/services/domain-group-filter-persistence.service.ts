import {
  DestroyRef,
  Injectable,
  Signal,
  WritableSignal,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { DashboardContextService } from '../layout/dashboard-context.service';

type DomainGroupLike = { id: string };
type DomainGroupFilterModel = { domainGroupId: string };

export type DomainGroupFilterBindOptions = {
  /**
   * When true, an empty page filter (e.g. campaign "All sites") is kept and not
   * overwritten by a stored dashboard workspace selection.
   */
  allowEmptySelection?: Signal<boolean> | boolean;
  /**
   * When true, page filter follows shell/dashboard context after init.
   * Use false when the page Site selector owns the filter (campaign mode).
   */
  syncFromDashboardContext?: Signal<boolean> | boolean;
};

@Injectable({ providedIn: 'root' })
export class DomainGroupFilterPersistenceService {
  private readonly dashboardContext = inject(DashboardContextService);

  bind<TModel extends DomainGroupFilterModel>(
    filterModel: WritableSignal<TModel>,
    domainGroups: Signal<readonly DomainGroupLike[]>,
    options: DomainGroupFilterBindOptions = {},
  ): void {
    const destroyRef = inject(DestroyRef);
    let initialized = false;
    let previousGroupId: string | undefined;

    const syncFromContextRef = effect(() => {
      const groups = domainGroups();
      const contextGroupId = this.dashboardContext.selectedDomainGroupId();
      const allowEmpty = this.readOption(options.allowEmptySelection);
      const syncFromContext = this.readOption(options.syncFromDashboardContext);

      untracked(() => {
        const currentGroupId = filterModel().domainGroupId;
        const hasCurrentGroup = this.hasGroup(groups, currentGroupId);
        const fallbackGroupId = groups.length === 1 ? groups[0].id : '';
        const explicitAllSitesSelection =
          allowEmpty && !currentGroupId && !!previousGroupId;

        if (!initialized) {
          if (!groups.length) {
            return;
          }

          initialized = true;
          const initialGroupId = hasCurrentGroup
            ? currentGroupId
            : allowEmpty && !contextGroupId
              ? ''
              : this.hasGroup(groups, contextGroupId)
                ? contextGroupId
                : fallbackGroupId;

          if (initialGroupId !== currentGroupId) {
            filterModel.update((model) => ({
              ...model,
              domainGroupId: initialGroupId,
            }));
          }
          previousGroupId = initialGroupId;
          return;
        }

        const pageOwnsEmptySelection =
          allowEmpty &&
          !currentGroupId &&
          (explicitAllSitesSelection || !syncFromContext);

        if (
          syncFromContext &&
          !pageOwnsEmptySelection &&
          contextGroupId &&
          contextGroupId !== currentGroupId &&
          this.hasGroup(groups, contextGroupId)
        ) {
          filterModel.update((model) => ({
            ...model,
            domainGroupId: contextGroupId,
          }));
          return;
        }

        if (currentGroupId && !hasCurrentGroup) {
          filterModel.update((model) => ({
            ...model,
            domainGroupId: fallbackGroupId,
          }));
        }

        previousGroupId = filterModel().domainGroupId;
      });
    });

    const syncToContextRef = effect(() => {
      const groups = domainGroups();
      const currentGroupId = filterModel().domainGroupId;
      const allowEmpty = this.readOption(options.allowEmptySelection);

      untracked(() => {
        if (!currentGroupId) {
          if (allowEmpty && this.dashboardContext.selectedDomainGroupId()) {
            this.dashboardContext.clearSelectedDomainGroupId();
          }
          return;
        }

        if (!this.hasGroup(groups, currentGroupId)) {
          return;
        }

        if (currentGroupId !== this.dashboardContext.selectedDomainGroupId()) {
          this.dashboardContext.setSelectedDomainGroupId(currentGroupId);
        }
      });
    });

    destroyRef.onDestroy(() => {
      syncFromContextRef.destroy();
      syncToContextRef.destroy();
    });
  }

  private readOption(value: Signal<boolean> | boolean | undefined): boolean {
    if (typeof value === 'function') {
      return value();
    }
    return value ?? false;
  }

  private hasGroup(
    groups: readonly DomainGroupLike[],
    groupId: string | null | undefined,
  ): groupId is string {
    return !!groupId && groups.some((group) => group.id === groupId);
  }
}
