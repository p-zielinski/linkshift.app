import { describe, expect, it } from 'vitest';
import { DEFAULT_PLAN_LIMITS } from '@shared/models/plan-limits.model';
import type { OrganizationUsage } from '../models/organization-usage.model';
import { isPlanLimitReached, resolvePlanLimitView } from './plan-limit-labels.util';

const baseUsage: OrganizationUsage = {
  domainGroups: 1,
  domains: 1,
  subdomains: 0,
  rules: 5,
  tests: 0,
  users: 1,
  apiKeys: 0,
  linkMaps: 1,
  linkMapEntries: 10,
};

describe('resolvePlanLimitView', () => {
  it('uses marketer labels and technical tiles in campaign mode', () => {
    const view = resolvePlanLimitView('campaign');

    expect(view.sectionSubtitle).toBe('Limits for your short links and team');
    expect(view.primaryTiles.map((tile) => tile.label)).toEqual([
      'Short link hosts',
      'Active links',
      'Team seats',
    ]);
    expect(view.primaryTiles[1]?.usageField).toBe('linkMapEntries');
    expect(view.technicalTiles.map((tile) => tile.label)).toEqual(['Redirect rules', 'Link maps']);
  });

  it('keeps infrastructure labels in advanced mode', () => {
    const view = resolvePlanLimitView('advanced');

    expect(view.sectionSubtitle).toBe('Key limits for your workspace');
    expect(view.primaryTiles.map((tile) => tile.label)).toEqual([
      'Domains',
      'Rules',
      'Active users',
      'Link maps',
    ]);
    expect(view.technicalTiles).toEqual([]);
  });
});

describe('isPlanLimitReached', () => {
  it('returns false when usage is unavailable', () => {
    const tile = resolvePlanLimitView('campaign').primaryTiles[1]!;

    expect(isPlanLimitReached(null, DEFAULT_PLAN_LIMITS, tile)).toBe(false);
  });

  it('compares usage against the tile limit field', () => {
    const tile = resolvePlanLimitView('campaign').primaryTiles[1]!;
    const usage = { ...baseUsage, linkMapEntries: DEFAULT_PLAN_LIMITS.maxLinkMapEntriesTotal };

    expect(isPlanLimitReached(usage, DEFAULT_PLAN_LIMITS, tile)).toBe(true);
  });
});
