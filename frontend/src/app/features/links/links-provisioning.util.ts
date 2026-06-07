import type { CreateLinkMapDto, LinkMap } from '../../core/models/link-map.model';
import type { CreateRedirectRuleDto, RedirectRule } from '../../core/models/redirect-rule.model';
import { normalizeRuleSourcePath } from './links-aggregation.util';

export const DEFAULT_LINK_MAP_NAME = 'Default links';
export const DEFAULT_LINK_RULE_SOURCE = '/go';
export const LINK_KEY_SLUG_REGEX = /^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/;

export type LinkProvisioningPlan = {
  selectedMap: LinkMap | null;
  sourcePath: string;
  createDefaultMap: boolean;
  createPrefixRule: boolean;
};

export function sanitizeLinkKey(value: string): string {
  return value.trim().toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '');
}

export function isValidLinkKey(value: string): boolean {
  return LINK_KEY_SLUG_REGEX.test(sanitizeLinkKey(value));
}

export function normalizeDestinationUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isValidHttpsDestination(value: string): boolean {
  const normalized = normalizeDestinationUrl(value);
  if (!normalized) {
    return false;
  }

  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function planLinkProvisioning(params: {
  domainGroupId: string;
  linkMaps: LinkMap[];
  redirectRules: RedirectRule[];
  preferredSourcePath?: string;
}): LinkProvisioningPlan {
  const preferredSourcePath = params.preferredSourcePath ?? DEFAULT_LINK_RULE_SOURCE;
  const groupMaps = params.linkMaps.filter((map) => map.domainGroupId === params.domainGroupId);
  const mapById = new Map(groupMaps.map((map) => [map.id, map]));

  const routingRule = params.redirectRules
    .filter(
      (rule) =>
        rule.domainGroupId === params.domainGroupId &&
        !!rule.linkMapId &&
        rule.pathMatch === 'prefix' &&
        rule.queryMatch === 'ignore' &&
        !rule.isBlocked,
    )
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }
      return left.createdAt.localeCompare(right.createdAt);
    })
    .find((rule) => mapById.has(rule.linkMapId as string));

  if (routingRule?.linkMapId) {
    return {
      selectedMap: mapById.get(routingRule.linkMapId) ?? null,
      sourcePath: normalizeRuleSourcePath(routingRule.source) ?? preferredSourcePath,
      createDefaultMap: false,
      createPrefixRule: false,
    };
  }

  const defaultMap = groupMaps.find((map) => map.name === DEFAULT_LINK_MAP_NAME) ?? groupMaps[0] ?? null;

  if (defaultMap) {
    return {
      selectedMap: defaultMap,
      sourcePath: preferredSourcePath,
      createDefaultMap: false,
      createPrefixRule: true,
    };
  }

  return {
    selectedMap: null,
    sourcePath: preferredSourcePath,
    createDefaultMap: true,
    createPrefixRule: true,
  };
}

export function buildDefaultLinkMapPayload(domainGroupId: string): CreateLinkMapDto {
  return {
    name: DEFAULT_LINK_MAP_NAME,
    domainGroupId,
    caseSensitive: false,
    queryMatch: 'ignore',
  };
}

export function buildDefaultPrefixRulePayload(params: {
  domainGroupId: string;
  linkMapId: string;
  sourcePath: string;
}): CreateRedirectRuleDto {
  return {
    domainGroupId: params.domainGroupId,
    source: normalizeRuleSourcePath(params.sourcePath) ?? DEFAULT_LINK_RULE_SOURCE,
    destination: null,
    statusCode: 302,
    pathMatch: 'prefix',
    queryMatch: 'ignore',
    priority: 0,
    linkMapId: params.linkMapId,
    matchMethod: [],
  };
}
