import { canCreateAdditionalDomainGroup } from '@shared/models/plan-limits.model';
import { DEFAULT_ROBOTS_POLICY } from '@shared/models/robots-policy.model';
import type { CreateDomainDto } from '../../core/models/domain.model';
import type { CreateDomainGroupDto } from '../../core/models/domain-group.model';
import type { DomainGroup } from '../../core/models/domain-group.model';
import type { Domain } from '../../core/models/domain.model';
import type { CreateSubdomainDto, Subdomain } from '../../core/models/subdomain.model';
import type { DomainGroupsApiService } from '../../core/api/domain-groups-api.service';
import type { DomainsApiService } from '../../core/api/domains-api.service';
import type { SubdomainsApiService } from '../../core/api/subdomains-api.service';
import { domainSchema } from '../domains/domain.schemas';
import { subdomainSchema } from '../subdomains/subdomain.schemas';
import { firstValueFrom } from 'rxjs';

export const CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY = 'openConnectDomain';

export type ConnectDomainSuccessMessageInput = {
  addedHostToExistingSite?: boolean;
};

export function resolveConnectDomainSuccessMessage(
  result: ConnectDomainSuccessMessageInput | undefined,
  wasAddHost?: boolean,
): string {
  const isAddHost = wasAddHost ?? result?.addedHostToExistingSite ?? false;
  return isAddHost ? 'Host added.' : 'Domain connected.';
}

export type CampaignHostKind = 'subdomain' | 'custom-domain';

export type CampaignWorkspaceMode = 'existing' | 'new';

export type CampaignConnectDomainModel = {
  workspaceMode: CampaignWorkspaceMode;
  selectedDomainGroupId: string;
  workspaceName: string;
  hostKind: CampaignHostKind;
  subdomainName: string;
  customDomainName: string;
};

export type CampaignConnectProvisionResult = {
  domainGroupId: string;
  host: string;
};

export const DEFAULT_CAMPAIGN_WORKSPACE_NAME = 'My site';

export function createCampaignConnectDomainModel(options?: {
  initialDomainGroupId?: string;
  hasExistingSites?: boolean;
  canCreateNewSite?: boolean;
}): CampaignConnectDomainModel {
  const hasExistingSites = options?.hasExistingSites ?? false;
  const canCreateNewSite = options?.canCreateNewSite ?? true;
  const initialDomainGroupId = options?.initialDomainGroupId?.trim() ?? '';

  if (hasExistingSites) {
    return {
      workspaceMode: 'existing',
      selectedDomainGroupId: initialDomainGroupId,
      workspaceName: '',
      hostKind: 'subdomain',
      subdomainName: '',
      customDomainName: '',
    };
  }

  if (!canCreateNewSite) {
    return {
      workspaceMode: 'existing',
      selectedDomainGroupId: initialDomainGroupId,
      workspaceName: '',
      hostKind: 'subdomain',
      subdomainName: '',
      customDomainName: '',
    };
  }

  return {
    workspaceMode: 'new',
    selectedDomainGroupId: '',
    workspaceName: '',
    hostKind: 'subdomain',
    subdomainName: '',
    customDomainName: '',
  };
}

export function resolveCampaignConnectCanCreateNewSite(
  existingSiteCount: number,
  maxDomainGroups: number,
): boolean {
  return canCreateAdditionalDomainGroup(existingSiteCount, maxDomainGroups);
}

export function resolveCampaignConnectInitialDomainGroupId(params: {
  lockedDomainGroupId?: string;
  initialDomainGroupId?: string;
  domainGroups: ReadonlyArray<{ id: string }>;
  canCreateNewSite: boolean;
}): string {
  const locked = params.lockedDomainGroupId?.trim() ?? '';
  if (locked) {
    return locked;
  }

  const initial = params.initialDomainGroupId?.trim() ?? '';
  if (initial) {
    return initial;
  }

  if (!params.canCreateNewSite && params.domainGroups.length === 1) {
    return params.domainGroups[0]?.id ?? '';
  }

  return '';
}

export function normalizeCampaignWorkspaceName(value: string): string {
  const trimmed = value.trim();
  return trimmed || DEFAULT_CAMPAIGN_WORKSPACE_NAME;
}

export function buildCampaignSubdomainHost(subdomainName: string, baseHost: string): string {
  const slug = subdomainName.trim().toLowerCase();
  const host = baseHost.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
  return `${slug}.${host}`;
}

export function validateCampaignSubdomainName(value: string): string | null {
  const result = subdomainSchema.shape.name.safeParse(value.trim().toLowerCase());
  if (result.success) {
    return null;
  }
  return result.error.issues[0]?.message ?? 'Invalid subdomain';
}

export function validateCampaignCustomDomainName(value: string): string | null {
  const result = domainSchema.shape.name.safeParse(value.trim().toLowerCase());
  if (result.success) {
    return null;
  }
  return result.error.issues[0]?.message ?? 'Invalid domain';
}

export function isCampaignSiteStepValid(model: CampaignConnectDomainModel): boolean {
  if (model.workspaceMode === 'existing') {
    return model.selectedDomainGroupId.trim().length > 0;
  }
  return normalizeCampaignWorkspaceName(model.workspaceName).length > 0;
}

export function isCampaignHostStepValid(model: CampaignConnectDomainModel): boolean {
  if (model.hostKind === 'subdomain') {
    return validateCampaignSubdomainName(model.subdomainName) === null;
  }
  return validateCampaignCustomDomainName(model.customDomainName) === null;
}

export function resolveNeedsSubdomainChoice(
  subdomains: ReadonlyArray<Pick<Subdomain, 'id'>>,
  domains: ReadonlyArray<Pick<Domain, 'id'>>,
): boolean {
  if (subdomains.length === 0 && domains.length === 0) {
    return true;
  }

  return subdomains.length === 1 && domains.length === 0;
}

export function buildOnboardingConnectDomainData(params: {
  domainGroups: ReadonlyArray<DomainGroup>;
  subdomains: ReadonlyArray<Subdomain>;
  domains: ReadonlyArray<Domain>;
}): {
  domainGroups: DomainGroup[];
  domainGroupId?: string;
  existingWorkspaceName?: string;
  replaceSubdomainId?: string;
  replaceSubdomainName?: string;
} {
  const domainGroups = [...params.domainGroups];
  const soleSite = domainGroups.length === 1 ? domainGroups[0] : undefined;
  const replaceSubdomain =
    params.subdomains.length === 1 && params.domains.length === 0
      ? params.subdomains[0]
      : undefined;

  return {
    domainGroups,
    ...(soleSite
      ? {
          domainGroupId: soleSite.id,
          existingWorkspaceName: soleSite.name,
        }
      : {}),
    ...(replaceSubdomain
      ? {
          replaceSubdomainId: replaceSubdomain.id,
          replaceSubdomainName: replaceSubdomain.name,
        }
      : {}),
  };
}

export async function provisionCampaignConnectDomain(params: {
  model: CampaignConnectDomainModel;
  subdomainBaseHost: string;
  lockedDomainGroupId?: string;
  replaceSubdomainId?: string;
  replaceSubdomainName?: string;
  domainGroupsApi: DomainGroupsApiService;
  subdomainsApi: SubdomainsApiService;
  domainsApi: DomainsApiService;
}): Promise<CampaignConnectProvisionResult> {
  const domainGroupId = await resolveCampaignConnectDomainGroupId(params);

  if (params.model.hostKind === 'subdomain') {
    const subdomainName = params.model.subdomainName.trim().toLowerCase();
    const existingName = params.replaceSubdomainName?.trim().toLowerCase() ?? '';

    if (params.replaceSubdomainId && existingName === subdomainName) {
      return {
        domainGroupId,
        host: buildCampaignSubdomainHost(subdomainName, params.subdomainBaseHost),
      };
    }

    if (params.replaceSubdomainId) {
      await firstValueFrom(params.subdomainsApi.delete(params.replaceSubdomainId));
    }

    const subdomainPayload: CreateSubdomainDto = {
      name: subdomainName,
      domainGroupId,
    };
    await firstValueFrom(params.subdomainsApi.create(subdomainPayload));
    return {
      domainGroupId,
      host: buildCampaignSubdomainHost(subdomainName, params.subdomainBaseHost),
    };
  }

  const domainName = params.model.customDomainName.trim().toLowerCase();
  const domainPayload: CreateDomainDto = {
    name: domainName,
    domainGroupId,
  };
  await firstValueFrom(params.domainsApi.create(domainPayload));
  return {
    domainGroupId,
    host: domainName,
  };
}

async function resolveCampaignConnectDomainGroupId(params: {
  model: CampaignConnectDomainModel;
  lockedDomainGroupId?: string;
  domainGroupsApi: DomainGroupsApiService;
}): Promise<string> {
  if (params.lockedDomainGroupId) {
    return params.lockedDomainGroupId;
  }

  if (params.model.workspaceMode === 'existing') {
    return params.model.selectedDomainGroupId.trim();
  }

  const workspaceName = normalizeCampaignWorkspaceName(params.model.workspaceName);
  const groupPayload: CreateDomainGroupDto = {
    name: workspaceName,
    robotsPolicy: DEFAULT_ROBOTS_POLICY,
    customRobotsContent: null,
  };
  const group = await firstValueFrom(params.domainGroupsApi.create(groupPayload));
  return group.id;
}
