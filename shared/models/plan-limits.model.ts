export type PlanLimits = {
  maxDomainGroups: number;
  maxDomainsPerGroup: number;
  maxTotalDomains: number;
  maxRulesPerGroup: number;
  maxTotalRules: number;
  maxTestsPerGroup: number;
  maxTotalTests: number;
  maxUsers: number;
  redirectionLimitPerMinute: number;
  maxApiKeys: number | null;
  apiKeyCallsPerMinute: number;
  maxLinkMaps: number;
  maxLinkMapEntriesTotal: number;
  maxLinkMapEntriesPerMap: number;
  analyticsRetentionDays: number;
};

export const DEFAULT_PLAN_LIMITS: Readonly<PlanLimits> = {
  maxDomainGroups: 1,
  maxDomainsPerGroup: 1,
  maxTotalDomains: 1,
  maxRulesPerGroup: 15,
  maxTotalRules: 15,
  maxTestsPerGroup: 30,
  maxTotalTests: 30,
  maxUsers: 1,
  redirectionLimitPerMinute: 10,
  maxApiKeys: 0,
  apiKeyCallsPerMinute: 0,
  maxLinkMaps: 1,
  maxLinkMapEntriesTotal: 100,
  maxLinkMapEntriesPerMap: 100,
  analyticsRetentionDays: 14,
};
