import { of } from 'rxjs';
import {
  buildCampaignSubdomainHost,
  createCampaignConnectDomainModel,
  isCampaignHostStepValid,
  isCampaignSiteStepValid,
  normalizeCampaignWorkspaceName,
  provisionCampaignConnectDomain,
  resolveConnectDomainSuccessMessage,
  validateCampaignCustomDomainName,
  validateCampaignSubdomainName,
} from './campaign-connect-domain.util';

describe('campaign-connect-domain.util', () => {
  it('uses default workspace name when empty', () => {
    expect(normalizeCampaignWorkspaceName('')).toBe('My site');
    expect(normalizeCampaignWorkspaceName('  Summer  ')).toBe('Summer');
  });

  it('builds subdomain host from slug and base host', () => {
    expect(buildCampaignSubdomainHost('Promo', 'go.linkshift.app')).toBe('promo.go.linkshift.app');
  });

  it('validates subdomain and custom domain names', () => {
    expect(validateCampaignSubdomainName('valid-name')).toBeNull();
    expect(validateCampaignSubdomainName('')).not.toBeNull();
    expect(validateCampaignCustomDomainName('links.example.com')).toBeNull();
    expect(validateCampaignCustomDomainName('not a domain')).not.toBeNull();
  });

  it('creates model for existing sites with initial selection', () => {
    expect(
      createCampaignConnectDomainModel({
        hasExistingSites: true,
        initialDomainGroupId: 'group-1',
      }),
    ).toEqual({
      workspaceMode: 'existing',
      selectedDomainGroupId: 'group-1',
      workspaceName: '',
      hostKind: 'subdomain',
      subdomainName: '',
      customDomainName: '',
    });
  });

  it('creates model for first site setup', () => {
    expect(createCampaignConnectDomainModel({ hasExistingSites: false })).toEqual({
      workspaceMode: 'new',
      selectedDomainGroupId: '',
      workspaceName: '',
      hostKind: 'subdomain',
      subdomainName: '',
      customDomainName: '',
    });
  });

  it('checks site and host step validity', () => {
    expect(
      isCampaignSiteStepValid({
        workspaceMode: 'new',
        selectedDomainGroupId: '',
        workspaceName: '',
        hostKind: 'subdomain',
        subdomainName: '',
        customDomainName: '',
      }),
    ).toBe(true);
    expect(
      isCampaignSiteStepValid({
        workspaceMode: 'existing',
        selectedDomainGroupId: '',
        workspaceName: '',
        hostKind: 'subdomain',
        subdomainName: '',
        customDomainName: '',
      }),
    ).toBe(false);
    expect(
      isCampaignHostStepValid({
        workspaceMode: 'existing',
        selectedDomainGroupId: 'group-1',
        workspaceName: '',
        hostKind: 'subdomain',
        subdomainName: 'launch',
        customDomainName: '',
      }),
    ).toBe(true);
    expect(
      isCampaignHostStepValid({
        workspaceMode: 'existing',
        selectedDomainGroupId: 'group-1',
        workspaceName: '',
        hostKind: 'custom-domain',
        subdomainName: '',
        customDomainName: 'links.example.com',
      }),
    ).toBe(true);
  });

  it('creates a domain group when no existing group is provided', async () => {
    const createGroup = vi.fn(() => of({ id: 'group-new' }));
    const createSubdomain = vi.fn(() => of({ id: 'sub-1' }));

    const result = await provisionCampaignConnectDomain({
      model: {
        workspaceMode: 'new',
        selectedDomainGroupId: '',
        workspaceName: 'Summer',
        hostKind: 'subdomain',
        subdomainName: 'launch',
        customDomainName: '',
      },
      subdomainBaseHost: 'go.linkshift.app',
      domainGroupsApi: { create: createGroup } as never,
      subdomainsApi: { create: createSubdomain } as never,
      domainsApi: { create: vi.fn() } as never,
    });

    expect(createGroup).toHaveBeenCalledTimes(1);
    expect(createSubdomain).toHaveBeenCalledWith({
      name: 'launch',
      domainGroupId: 'group-new',
    });
    expect(result).toEqual({
      domainGroupId: 'group-new',
      host: 'launch.go.linkshift.app',
    });
  });

  it('reuses a selected existing domain group', async () => {
    const createGroup = vi.fn();
    const createDomain = vi.fn(() => of({ id: 'dom-1' }));

    const result = await provisionCampaignConnectDomain({
      model: {
        workspaceMode: 'existing',
        selectedDomainGroupId: 'group-existing',
        workspaceName: '',
        hostKind: 'custom-domain',
        subdomainName: '',
        customDomainName: 'links.example.com',
      },
      subdomainBaseHost: 'go.linkshift.app',
      domainGroupsApi: { create: createGroup } as never,
      subdomainsApi: { create: vi.fn() } as never,
      domainsApi: { create: createDomain } as never,
    });

    expect(createGroup).not.toHaveBeenCalled();
    expect(createDomain).toHaveBeenCalledWith({
      name: 'links.example.com',
      domainGroupId: 'group-existing',
    });
    expect(result).toEqual({
      domainGroupId: 'group-existing',
      host: 'links.example.com',
    });
  });

  it('reuses a locked domain group in add-host mode', async () => {
    const createGroup = vi.fn();
    const createDomain = vi.fn(() => of({ id: 'dom-1' }));

    const result = await provisionCampaignConnectDomain({
      model: {
        workspaceMode: 'existing',
        selectedDomainGroupId: '',
        workspaceName: '',
        hostKind: 'custom-domain',
        subdomainName: '',
        customDomainName: 'links.example.com',
      },
      subdomainBaseHost: 'go.linkshift.app',
      lockedDomainGroupId: 'group-existing',
      domainGroupsApi: { create: createGroup } as never,
      subdomainsApi: { create: vi.fn() } as never,
      domainsApi: { create: createDomain } as never,
    });

    expect(createGroup).not.toHaveBeenCalled();
    expect(createDomain).toHaveBeenCalledWith({
      name: 'links.example.com',
      domainGroupId: 'group-existing',
    });
    expect(result).toEqual({
      domainGroupId: 'group-existing',
      host: 'links.example.com',
    });
  });

  it('resolves connect-domain success snackbar copy', () => {
    expect(resolveConnectDomainSuccessMessage(undefined)).toBe('Domain connected.');
    expect(resolveConnectDomainSuccessMessage({})).toBe('Domain connected.');
    expect(resolveConnectDomainSuccessMessage({ addedHostToExistingSite: true })).toBe(
      'Host added.',
    );
    expect(resolveConnectDomainSuccessMessage(undefined, true)).toBe('Host added.');
    expect(resolveConnectDomainSuccessMessage({ addedHostToExistingSite: false }, true)).toBe(
      'Host added.',
    );
  });
});
