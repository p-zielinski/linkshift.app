import { PlanLimits } from '../api/billing-api.service';

const pluralize = (value: number, singular: string, plural: string) =>
  value === 1 ? singular : plural;

export const formatLimitChips = (limits: PlanLimits): string[] => [
  `${limits.maxDomainGroups} ${pluralize(limits.maxDomainGroups, 'domain group', 'domain groups')}`,
  `${limits.maxTotalDomains} ${pluralize(limits.maxTotalDomains, 'domain', 'domains')}`,
  `${limits.maxTotalRules} ${pluralize(limits.maxTotalRules, 'rule', 'rules')}`,
  `${limits.maxTotalTests} ${pluralize(limits.maxTotalTests, 'test', 'tests')}`,
  `${limits.maxLinkMaps} ${pluralize(limits.maxLinkMaps, 'link map', 'link maps')}`,
  `${limits.maxLinkMapEntriesTotal} ${pluralize(limits.maxLinkMapEntriesTotal, 'link map entry', 'link map entries')}`,
  `${limits.maxUsers} ${pluralize(limits.maxUsers, 'seat', 'seats')}`,
  `${limits.redirectionLimitPerMinute} redirects/min`,
];

export const formatLimitSummary = (limits: PlanLimits): string =>
  [
    `${limits.maxDomainGroups} ${pluralize(limits.maxDomainGroups, 'domain group', 'domain groups')}`,
    `${limits.maxTotalDomains} ${pluralize(limits.maxTotalDomains, 'domain', 'domains')}`,
    `${limits.maxTotalRules} ${pluralize(limits.maxTotalRules, 'rule', 'rules')}`,
    `${limits.maxUsers} ${pluralize(limits.maxUsers, 'seat', 'seats')}`,
    `${limits.redirectionLimitPerMinute} redirects/min`,
  ].join(' • ');
