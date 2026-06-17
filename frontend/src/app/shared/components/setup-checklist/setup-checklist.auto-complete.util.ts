import type { DashboardMode } from '../../../core/layout/dashboard-mode.service';
import type { Domain } from '../../../core/models/domain.model';
import type { DomainGroup } from '../../../core/models/domain-group.model';
import type { Subdomain } from '../../../core/models/subdomain.model';
import { buildGroupHostOptions } from '../../../features/links/links-aggregation.util';
import type { SetupChecklistItemId } from './setup-checklist.state';
import { SETUP_CHECKLIST_ITEM_IDS } from './setup-checklist.state';

export const SETUP_CHECKLIST_INVITE_SENT_KEY = 'linkshift-setup-checklist-invite-sent';
export const SETUP_CHECKLIST_REDIRECT_TESTER_USED_KEY =
  'linkshift-setup-checklist-redirect-tester-used';

export type SetupChecklistAutoCompleteSignals = {
  mode: DashboardMode;
  domainGroupCount: number;
  hostCount: number;
  linkMapCount: number;
  redirectRuleCount: number;
  linkMapEntryCount: number;
  redirectTestCount: number;
  memberCount: number;
  inviteSentRecorded: boolean;
  redirectTesterUsedRecorded: boolean;
};

export function countOrganizationHosts(
  domainGroups: DomainGroup[],
  subdomains: Subdomain[],
  domains: Domain[],
  subdomainBaseHost: string,
): number {
  return buildGroupHostOptions(domainGroups, subdomains, domains, subdomainBaseHost).length;
}

export function organizationHasConnectedHosts(
  domainGroupCount: number,
  hostCount: number,
): boolean {
  return domainGroupCount > 0 && hostCount > 0;
}

export function deriveSetupChecklistAutoComplete(
  signals: SetupChecklistAutoCompleteSignals,
): Partial<Record<SetupChecklistItemId, boolean>> {
  const completed: Partial<Record<SetupChecklistItemId, boolean>> = {};

  if (organizationHasConnectedHosts(signals.domainGroupCount, signals.hostCount)) {
    completed['confirm-domain'] = true;
  }

  if (
    signals.mode === 'advanced' &&
    signals.linkMapCount > 0 &&
    signals.redirectRuleCount > 0
  ) {
    completed['review-routing'] = true;
  }

  if (signals.linkMapEntryCount > 0) {
    completed['create-link'] = true;
  }

  if (signals.mode === 'campaign') {
    if (signals.redirectTesterUsedRecorded) {
      completed['run-test'] = true;
    }
  } else if (signals.redirectTestCount > 0) {
    completed['run-test'] = true;
  }

  if (signals.memberCount > 1 || signals.inviteSentRecorded) {
    completed['invite-teammate'] = true;
  }

  return completed;
}

export function isSetupChecklistItemAutoCompleted(
  auto: Partial<Record<SetupChecklistItemId, boolean>>,
  itemId: SetupChecklistItemId,
): boolean {
  return auto[itemId] === true;
}

export function isSetupChecklistItemEffectivelyChecked(
  manual: Partial<Record<SetupChecklistItemId, boolean>>,
  auto: Partial<Record<SetupChecklistItemId, boolean>>,
  itemId: SetupChecklistItemId,
): boolean {
  return isSetupChecklistItemAutoCompleted(auto, itemId) || manual[itemId] === true;
}

export function setupChecklistEffectiveCompletedCount(
  manual: Partial<Record<SetupChecklistItemId, boolean>>,
  auto: Partial<Record<SetupChecklistItemId, boolean>>,
  visibleItemIds: readonly SetupChecklistItemId[] = SETUP_CHECKLIST_ITEM_IDS,
): number {
  return visibleItemIds.filter((itemId) =>
    isSetupChecklistItemEffectivelyChecked(manual, auto, itemId),
  ).length;
}

export function readSetupChecklistLocalFlag(
  storage: Pick<Storage, 'getItem'> | null,
  key: string,
): boolean {
  if (!storage) {
    return false;
  }

  return storage.getItem(key) === '1';
}

export function writeSetupChecklistLocalFlag(
  storage: Pick<Storage, 'setItem'> | null,
  key: string,
): void {
  storage?.setItem(key, '1');
}
