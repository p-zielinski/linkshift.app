import type { OrganizationUsage } from '../models/organization-usage.model';
import type { PlanLimits } from '@shared/models/plan-limits.model';
import type { DashboardMode } from './dashboard-mode.service';

export type PlanLimitTileConfig = {
  id: 'domains' | 'rules' | 'users' | 'linkMaps' | 'linkMapEntries';
  label: string;
  usageField: keyof OrganizationUsage;
  limitField: keyof PlanLimits;
};

export type PlanLimitView = {
  sectionSubtitle: string;
  primaryTiles: PlanLimitTileConfig[];
  technicalTiles: PlanLimitTileConfig[];
};

const ADVANCED_TILES: PlanLimitTileConfig[] = [
  {
    id: 'domains',
    label: 'Domains',
    usageField: 'domains',
    limitField: 'maxTotalDomains',
  },
  {
    id: 'rules',
    label: 'Rules',
    usageField: 'rules',
    limitField: 'maxTotalRules',
  },
  {
    id: 'users',
    label: 'Active users',
    usageField: 'users',
    limitField: 'maxUsers',
  },
  {
    id: 'linkMaps',
    label: 'Link maps',
    usageField: 'linkMaps',
    limitField: 'maxLinkMaps',
  },
];

const CAMPAIGN_PRIMARY_TILES: PlanLimitTileConfig[] = [
  {
    id: 'domains',
    label: 'Short link hosts',
    usageField: 'domains',
    limitField: 'maxTotalDomains',
  },
  {
    id: 'linkMapEntries',
    label: 'Active links',
    usageField: 'linkMapEntries',
    limitField: 'maxLinkMapEntriesTotal',
  },
  {
    id: 'users',
    label: 'Team seats',
    usageField: 'users',
    limitField: 'maxUsers',
  },
];

const CAMPAIGN_TECHNICAL_TILES: PlanLimitTileConfig[] = [
  {
    id: 'rules',
    label: 'Redirect rules',
    usageField: 'rules',
    limitField: 'maxTotalRules',
  },
  {
    id: 'linkMaps',
    label: 'Link maps',
    usageField: 'linkMaps',
    limitField: 'maxLinkMaps',
  },
];

/** Plan limit tile labels and grouping for campaign vs advanced dashboard modes. */
export function resolvePlanLimitView(mode: DashboardMode): PlanLimitView {
  if (mode === 'campaign') {
    return {
      sectionSubtitle: 'Limits for your short links and team',
      primaryTiles: CAMPAIGN_PRIMARY_TILES,
      technicalTiles: CAMPAIGN_TECHNICAL_TILES,
    };
  }

  return {
    sectionSubtitle: 'Key limits for your workspace',
    primaryTiles: ADVANCED_TILES,
    technicalTiles: [],
  };
}

export function isPlanLimitReached(
  usage: OrganizationUsage | null,
  limits: PlanLimits,
  tile: PlanLimitTileConfig,
): boolean {
  if (!usage) {
    return false;
  }

  const max = limits[tile.limitField];
  if (typeof max !== 'number') {
    return false;
  }

  return usage[tile.usageField] >= max;
}
