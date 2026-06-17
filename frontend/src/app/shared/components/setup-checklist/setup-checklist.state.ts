import type { DashboardMode } from '../../../core/layout/dashboard-mode.service';
import { CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY } from '../../../features/campaign-connect-domain/campaign-connect-domain.util';

export const SETUP_CHECKLIST_STORAGE_KEY = 'linkshift-setup-checklist';

export type SetupChecklistItemId =
  | 'confirm-domain'
  | 'review-routing'
  | 'create-link'
  | 'run-test'
  | 'invite-teammate';

export type SetupChecklistItem = {
  id: SetupChecklistItemId;
  label: string;
  route: string;
  queryParams?: Record<string, string>;
};

export const SETUP_CHECKLIST_ITEM_IDS: readonly SetupChecklistItemId[] = [
  'confirm-domain',
  'review-routing',
  'create-link',
  'run-test',
  'invite-teammate',
] as const;

/** Advanced-mode checklist items (default for state helpers and tests). */
export const SETUP_CHECKLIST_ITEMS: readonly SetupChecklistItem[] =
  resolveSetupChecklistItems('advanced');

export type ResolveSetupChecklistItemsOptions = {
  /** When true, campaign connect-domain skips onboarding query on /links. */
  hasConnectedHosts?: boolean;
};

/** Checklist rows for the active dashboard mode (test step label/route differ by mode). */
export function resolveSetupChecklistItems(
  mode: DashboardMode,
  options: ResolveSetupChecklistItemsOptions = {},
): readonly SetupChecklistItem[] {
  const testStep: SetupChecklistItem =
    mode === 'campaign'
      ? {
          id: 'run-test',
          label: 'Test a link',
          route: '/tools/redirect-tester',
        }
      : {
          id: 'run-test',
          label: 'Run redirect test',
          route: '/tests',
        };

  const connectDomainStep: SetupChecklistItem =
    mode === 'campaign'
      ? {
          id: 'confirm-domain',
          label: 'Connect your domain',
          route: '/links',
          ...(options.hasConnectedHosts
            ? {}
            : { queryParams: { [CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY]: '1' } }),
        }
      : {
          id: 'confirm-domain',
          label: 'Confirm your domain',
          route: '/domain-groups',
        };

  const inviteStep: SetupChecklistItem =
    mode === 'campaign'
      ? {
          id: 'invite-teammate',
          label: 'Invite teammate',
          route: '/organization',
        }
      : {
          id: 'invite-teammate',
          label: 'Invite teammate',
          route: '/organization',
        };

  const createLinkStep: SetupChecklistItem = {
    id: 'create-link',
    label: 'Create link',
    route: '/links',
    queryParams: { openCreate: '1' },
  };

  const reviewRoutingStep: SetupChecklistItem = {
    id: 'review-routing',
    label: 'Review starter routing',
    route: '/redirect-rules',
  };

  if (mode === 'campaign') {
    if (options.hasConnectedHosts) {
      return [createLinkStep, testStep, inviteStep] as const;
    }

    return [connectDomainStep, testStep, inviteStep] as const;
  }

  if (options.hasConnectedHosts) {
    return [reviewRoutingStep, createLinkStep, testStep, inviteStep] as const;
  }

  const advancedCreateLinkStep: SetupChecklistItem = {
    ...createLinkStep,
    queryParams: { [CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY]: '1' },
  };

  return [connectDomainStep, advancedCreateLinkStep, testStep, inviteStep] as const;
}

export type SetupChecklistState = {
  checked: Partial<Record<SetupChecklistItemId, boolean>>;
  dismissed: boolean;
};

export const DEFAULT_SETUP_CHECKLIST_STATE: SetupChecklistState = {
  checked: {},
  dismissed: false,
};

export function parseSetupChecklistState(raw: string | null): SetupChecklistState {
  if (!raw) {
    return { ...DEFAULT_SETUP_CHECKLIST_STATE };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SetupChecklistState>;
    const checked =
      parsed.checked && typeof parsed.checked === 'object' ? { ...parsed.checked } : {};
    const dismissed = parsed.dismissed === true;

    return { checked, dismissed };
  } catch {
    return { ...DEFAULT_SETUP_CHECKLIST_STATE };
  }
}

export function serializeSetupChecklistState(state: SetupChecklistState): string {
  return JSON.stringify(state);
}

export function toggleSetupChecklistItem(
  state: SetupChecklistState,
  itemId: SetupChecklistItemId,
  checked: boolean,
): SetupChecklistState {
  return {
    ...state,
    checked: {
      ...state.checked,
      [itemId]: checked,
    },
  };
}

export function dismissSetupChecklist(state: SetupChecklistState): SetupChecklistState {
  return {
    ...state,
    dismissed: true,
  };
}

export function reopenSetupChecklist(state: SetupChecklistState): SetupChecklistState {
  return {
    ...state,
    dismissed: false,
  };
}

export function isSetupChecklistItemChecked(
  state: SetupChecklistState,
  itemId: SetupChecklistItemId,
): boolean {
  return state.checked[itemId] === true;
}

export function setupChecklistCompletedCount(state: SetupChecklistState): number {
  return SETUP_CHECKLIST_ITEM_IDS.filter((itemId) =>
    isSetupChecklistItemChecked(state, itemId),
  ).length;
}
