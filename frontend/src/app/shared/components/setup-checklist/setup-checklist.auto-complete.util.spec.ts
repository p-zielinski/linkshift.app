import type { Domain } from '../../../core/models/domain.model';
import type { DomainGroup } from '../../../core/models/domain-group.model';
import type { Subdomain } from '../../../core/models/subdomain.model';
import {
  SETUP_CHECKLIST_INVITE_SENT_KEY,
  SETUP_CHECKLIST_REDIRECT_TESTER_USED_KEY,
  countOrganizationHosts,
  deriveSetupChecklistAutoComplete,
  isSetupChecklistItemAutoCompleted,
  isSetupChecklistItemEffectivelyChecked,
  organizationHasConnectedHosts,
  readSetupChecklistLocalFlag,
  setupChecklistEffectiveCompletedCount,
  writeSetupChecklistLocalFlag,
} from './setup-checklist.auto-complete.util';

const sampleGroup: DomainGroup = {
  id: 'group-1',
  name: 'Marketing',
  organizationId: 'org-1',
  robotsPolicy: 'NONE',
  redirectDeliveryMode: 'INSTANT',
  customRobotsContent: null,
  createdAt: '',
  updatedAt: '',
};

const sampleSubdomain: Subdomain = {
  id: 'sub-1',
  name: 'promo',
  domainGroupId: 'group-1',
  createdAt: '',
  updatedAt: '',
};

const sampleDomain: Domain = {
  id: 'dom-1',
  name: 'campaign.example.com',
  domainGroupId: 'group-1',
  createdAt: '',
  updatedAt: '',
};

describe('setup-checklist.auto-complete.util', () => {
  it('counts hosts across domain groups', () => {
    expect(
      countOrganizationHosts([sampleGroup], [sampleSubdomain], [sampleDomain], 'linkshift.dev'),
    ).toBe(2);
  });

  it('requires at least one domain group and one host for confirm-domain', () => {
    expect(organizationHasConnectedHosts(1, 1)).toBe(true);
    expect(organizationHasConnectedHosts(0, 1)).toBe(false);
    expect(organizationHasConnectedHosts(1, 0)).toBe(false);
  });

  it('auto-completes campaign checklist items from app signals', () => {
    expect(
      deriveSetupChecklistAutoComplete({
        mode: 'campaign',
        domainGroupCount: 1,
        hostCount: 1,
        linkMapEntryCount: 3,
        redirectTestCount: 0,
        memberCount: 1,
        inviteSentRecorded: false,
        redirectTesterUsedRecorded: true,
      }),
    ).toEqual({
      'confirm-domain': true,
      'create-link': true,
      'run-test': true,
    });
  });

  it('does not auto-complete campaign run-test from organization redirect tests alone', () => {
    expect(
      deriveSetupChecklistAutoComplete({
        mode: 'campaign',
        domainGroupCount: 0,
        hostCount: 0,
        linkMapEntryCount: 0,
        redirectTestCount: 2,
        memberCount: 1,
        inviteSentRecorded: false,
        redirectTesterUsedRecorded: false,
      }),
    ).toEqual({});
  });

  it('auto-completes campaign run-test when redirect tester usage was recorded', () => {
    expect(
      deriveSetupChecklistAutoComplete({
        mode: 'campaign',
        domainGroupCount: 0,
        hostCount: 0,
        linkMapEntryCount: 0,
        redirectTestCount: 0,
        memberCount: 1,
        inviteSentRecorded: false,
        redirectTesterUsedRecorded: true,
      }),
    ).toEqual({
      'run-test': true,
    });
  });

  it('auto-completes run-test from redirect test usage in advanced mode', () => {
    expect(
      deriveSetupChecklistAutoComplete({
        mode: 'advanced',
        domainGroupCount: 1,
        hostCount: 1,
        linkMapEntryCount: 0,
        redirectTestCount: 2,
        memberCount: 1,
        inviteSentRecorded: false,
        redirectTesterUsedRecorded: false,
      }),
    ).toEqual({
      'confirm-domain': true,
      'run-test': true,
    });
  });

  it('auto-completes invite teammate when multiple members exist', () => {
    expect(
      deriveSetupChecklistAutoComplete({
        mode: 'campaign',
        domainGroupCount: 0,
        hostCount: 0,
        linkMapEntryCount: 0,
        redirectTestCount: 0,
        memberCount: 2,
        inviteSentRecorded: false,
        redirectTesterUsedRecorded: false,
      }),
    ).toEqual({
      'invite-teammate': true,
    });
  });

  it('auto-completes invite teammate when a pending invite was recorded', () => {
    expect(
      deriveSetupChecklistAutoComplete({
        mode: 'campaign',
        domainGroupCount: 0,
        hostCount: 0,
        linkMapEntryCount: 0,
        redirectTestCount: 0,
        memberCount: 1,
        inviteSentRecorded: true,
        redirectTesterUsedRecorded: false,
      }),
    ).toEqual({
      'invite-teammate': true,
    });
  });

  it('merges manual and auto completion for effective checked state', () => {
    const manual = { 'create-link': true };
    const auto = { 'confirm-domain': true };

    expect(isSetupChecklistItemEffectivelyChecked(manual, auto, 'confirm-domain')).toBe(true);
    expect(isSetupChecklistItemEffectivelyChecked(manual, auto, 'run-test')).toBe(false);
    expect(setupChecklistEffectiveCompletedCount(manual, auto)).toBe(2);
  });

  it('identifies auto-completed items and ignores manual false overrides', () => {
    const auto = { 'run-test': true };
    const manual = { 'run-test': false };

    expect(isSetupChecklistItemAutoCompleted(auto, 'run-test')).toBe(true);
    expect(isSetupChecklistItemEffectivelyChecked(manual, auto, 'run-test')).toBe(true);
  });

  it('reads and writes lightweight localStorage flags', () => {
    const storage = new Map<string, string>();

    for (const key of [
      SETUP_CHECKLIST_INVITE_SENT_KEY,
      SETUP_CHECKLIST_REDIRECT_TESTER_USED_KEY,
    ]) {
      expect(
        readSetupChecklistLocalFlag(
          {
            getItem: (flagKey) => storage.get(flagKey) ?? null,
          },
          key,
        ),
      ).toBe(false);

      writeSetupChecklistLocalFlag(
        {
          setItem: (flagKey, value) => storage.set(flagKey, value),
        },
        key,
      );

      expect(
        readSetupChecklistLocalFlag(
          {
            getItem: (flagKey) => storage.get(flagKey) ?? null,
          },
          key,
        ),
      ).toBe(true);
    }
  });
});
