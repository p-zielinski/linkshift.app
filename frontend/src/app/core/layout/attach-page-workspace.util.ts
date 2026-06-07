import { DestroyRef, Signal, computed, inject } from '@angular/core';
import { DashboardModeService } from './dashboard-mode.service';
import {
  DashboardPageWorkspaceRegistry,
  attachDashboardPageWorkspace,
} from './dashboard-page-workspace.registry';

type WorkspaceFilterModel = { domainGroupId: string };

/** Advanced mode: only pages that opt in (e.g. /links) may offer "All sites". */
export function resolvePageWorkspaceAllowAllSites(params: {
  groupCount: number;
  isCampaignMode: boolean;
  allowEmptySelection: boolean | undefined;
}): boolean {
  if (params.groupCount <= 1) {
    return false;
  }

  if (params.isCampaignMode) {
    return params.allowEmptySelection ?? true;
  }

  return params.allowEmptySelection ?? false;
}

export type AttachPageWorkspaceOptions = {
  destroyRef: DestroyRef;
  filterModel: { (): WorkspaceFilterModel };
  updateFilterModel: (domainGroupId: string) => void;
  groups: Signal<readonly { id: string; name: string }[]>;
  /** Campaign mode: page-level "All sites" when multiple groups exist. */
  allowEmptySelection?: Signal<boolean>;
  allOptionLabel?: string;
};

export function attachPageWorkspaceFilter(options: AttachPageWorkspaceOptions): void {
  const registry = inject(DashboardPageWorkspaceRegistry);
  const dashboardMode = inject(DashboardModeService);

  const allowAllSites = computed(() =>
    resolvePageWorkspaceAllowAllSites({
      groupCount: options.groups().length,
      isCampaignMode: dashboardMode.isCampaign(),
      allowEmptySelection: options.allowEmptySelection?.(),
    }),
  );

  const label = computed(() => 'Site');

  attachDashboardPageWorkspace(options.destroyRef, registry, {
    groups: options.groups,
    selectedId: computed(() => options.filterModel().domainGroupId),
    setSelectedId: (id) => options.updateFilterModel(id),
    allowAllSites,
    allOptionLabel: computed(() => options.allOptionLabel ?? 'All sites'),
    label,
  });
}
