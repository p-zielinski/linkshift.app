import {
  DEFAULT_SETUP_CHECKLIST_STATE,
  dismissSetupChecklist,
  parseSetupChecklistState,
  reopenSetupChecklist,
  resolveSetupChecklistItems,
  serializeSetupChecklistState,
  setupChecklistCompletedCount,
  toggleSetupChecklistItem,
} from './setup-checklist.state';

describe('setup-checklist.state', () => {
  it('returns default state when storage is empty', () => {
    expect(parseSetupChecklistState(null)).toEqual(DEFAULT_SETUP_CHECKLIST_STATE);
  });

  it('parses valid persisted state', () => {
    const raw = serializeSetupChecklistState({
      checked: { 'create-link': true, 'run-test': true },
      dismissed: true,
    });

    expect(parseSetupChecklistState(raw)).toEqual({
      checked: { 'create-link': true, 'run-test': true },
      dismissed: true,
    });
  });

  it('falls back to default state for invalid JSON', () => {
    expect(parseSetupChecklistState('{not-json')).toEqual(DEFAULT_SETUP_CHECKLIST_STATE);
  });

  it('toggles item checked state immutably', () => {
    const initial = { ...DEFAULT_SETUP_CHECKLIST_STATE };
    const toggled = toggleSetupChecklistItem(initial, 'confirm-domain', true);

    expect(toggled.checked['confirm-domain']).toBe(true);
    expect(initial.checked['confirm-domain']).toBeUndefined();
  });

  it('counts completed checklist items', () => {
    let state = toggleSetupChecklistItem(DEFAULT_SETUP_CHECKLIST_STATE, 'confirm-domain', true);
    state = toggleSetupChecklistItem(state, 'create-link', true);

    expect(setupChecklistCompletedCount(state)).toBe(2);
  });

  it('dismisses and reopens checklist', () => {
    const dismissed = dismissSetupChecklist(DEFAULT_SETUP_CHECKLIST_STATE);
    expect(dismissed.dismissed).toBe(true);

    const reopened = reopenSetupChecklist(dismissed);
    expect(reopened.dismissed).toBe(false);
    expect(reopened.checked).toEqual(dismissed.checked);
  });

  it('round-trips through serialize and parse', () => {
    const state = dismissSetupChecklist(
      toggleSetupChecklistItem(DEFAULT_SETUP_CHECKLIST_STATE, 'invite-teammate', true),
    );
    const roundTrip = parseSetupChecklistState(serializeSetupChecklistState(state));

    expect(roundTrip).toEqual(state);
  });
});

describe('resolveSetupChecklistItems', () => {
  it('routes campaign mode test step to redirect tester with marketer label', () => {
    const items = resolveSetupChecklistItems('campaign');
    const testStep = items.find((item) => item.id === 'run-test');

    expect(testStep).toEqual({
      id: 'run-test',
      label: 'Test a link',
      route: '/tools/redirect-tester',
    });
  });

  it('routes advanced mode test step to tests page', () => {
    const items = resolveSetupChecklistItems('advanced');
    const testStep = items.find((item) => item.id === 'run-test');

    expect(testStep).toEqual({
      id: 'run-test',
      label: 'Run redirect test',
      route: '/tests',
    });
  });

  it('routes campaign connect-domain step to links onboarding query when no hosts exist', () => {
    const items = resolveSetupChecklistItems('campaign');
    const connectStep = items.find((item) => item.id === 'confirm-domain');

    expect(connectStep).toEqual({
      id: 'confirm-domain',
      label: 'Connect your domain',
      route: '/links',
      queryParams: { openConnectDomain: '1' } as const,
    });
  });

  it('omits create-link when campaign mode has no hosts', () => {
    const items = resolveSetupChecklistItems('campaign');

    expect(items.map((item) => item.id)).toEqual(['confirm-domain', 'run-test', 'invite-teammate']);
    expect(items.find((item) => item.id === 'create-link')).toBeUndefined();
  });

  it('omits connect-domain when campaign mode has hosts', () => {
    const items = resolveSetupChecklistItems('campaign', { hasConnectedHosts: true });

    expect(items.map((item) => item.id)).toEqual(['create-link', 'run-test', 'invite-teammate']);
    expect(items.find((item) => item.id === 'confirm-domain')).toBeUndefined();
  });

  it('routes create-link step to open-create query when hosts exist', () => {
    const items = resolveSetupChecklistItems('campaign', { hasConnectedHosts: true });
    const createLinkStep = items.find((item) => item.id === 'create-link');

    expect(createLinkStep).toEqual({
      id: 'create-link',
      label: 'Create link',
      route: '/links',
      queryParams: { openCreate: '1' } as const,
    });
  });

  it('keeps advanced connect-domain step on domain groups page', () => {
    const items = resolveSetupChecklistItems('advanced');
    const connectStep = items.find((item) => item.id === 'confirm-domain');

    expect(connectStep).toEqual({
      id: 'confirm-domain',
      label: 'Confirm your domain',
      route: '/domain-groups',
    });
  });

  it('routes campaign invite-teammate step to organization page', () => {
    const items = resolveSetupChecklistItems('campaign');
    const inviteStep = items.find((item) => item.id === 'invite-teammate');

    expect(inviteStep).toEqual({
      id: 'invite-teammate',
      label: 'Invite teammate',
      route: '/organization',
    });
  });

  it('routes advanced invite-teammate step to organization page', () => {
    const items = resolveSetupChecklistItems('advanced');
    const inviteStep = items.find((item) => item.id === 'invite-teammate');

    expect(inviteStep).toEqual({
      id: 'invite-teammate',
      label: 'Invite teammate',
      route: '/organization',
    });
  });
});
