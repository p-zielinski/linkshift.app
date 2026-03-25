import type { PlanLimits } from '@shared/models/plan-limits.model';

const pluralize = (value: number, singular: string, plural: string) =>
  value === 1 ? singular : plural;

export const formatLimitChips = (limits: PlanLimits): string[] => [
  `${limits.maxDomainGroups} ${pluralize(limits.maxDomainGroups, 'domain group', 'domain groups')}`,
  `${limits.maxDomainsPerGroup} ${pluralize(limits.maxDomainsPerGroup, 'domain per group', 'domains per group')}`,
  `${limits.maxTotalDomains} ${pluralize(limits.maxTotalDomains, 'total domain', 'total domains')}`,

  `${limits.maxRulesPerGroup} ${pluralize(limits.maxRulesPerGroup, 'rule per group', 'rules per group')}`,
  `${limits.maxTotalRules} ${pluralize(limits.maxTotalRules, 'total rule', 'total rules')}`,

  `${limits.maxTestsPerGroup} ${pluralize(limits.maxTestsPerGroup, 'test per group', 'tests per group')}`,
  `${limits.maxTotalTests} ${pluralize(limits.maxTotalTests, 'total test', 'total tests')}`,

  `${limits.maxLinkMaps} ${pluralize(limits.maxLinkMaps, 'link map', 'link maps')}`,
  `${limits.maxLinkMapEntriesPerMap} ${pluralize(limits.maxLinkMapEntriesPerMap, 'entry per link map', 'entries per link map')}`,
  `${limits.maxLinkMapEntriesTotal} ${pluralize(limits.maxLinkMapEntriesTotal, 'total link map entry', 'total link map entries')}`,

  `${limits.maxUsers} ${pluralize(limits.maxUsers, 'seat', 'seats')}`,
  `${limits.redirectionLimitPerMinute} redirects/min`,
  `${limits.analyticsRetentionDays} ${pluralize(limits.analyticsRetentionDays, 'day', 'days')} analytics retention`,
];

export const formatLimitSummary = (limits: PlanLimits): string =>
  [
    `${limits.maxDomainGroups} ${pluralize(limits.maxDomainGroups, 'domain group', 'domain groups')}`,
    `${limits.maxTotalDomains} ${pluralize(limits.maxTotalDomains, 'total domain', 'total domains')}`,
    `${limits.maxTotalRules} ${pluralize(limits.maxTotalRules, 'total rule', 'total rules')}`,
    `${limits.maxUsers} ${pluralize(limits.maxUsers, 'seat', 'seats')}`,
    `${limits.redirectionLimitPerMinute} redirects/min`,
  ].join(' • ');
