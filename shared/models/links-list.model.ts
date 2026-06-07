/**
 * Aggregated link row for dashboard list/table display (GET /api/v1/links).
 * Shape must stay aligned with frontend `links-aggregation.util.ts` AggregatedLinkRow.
 */
export type AggregatedLinkRow = {
  id: string;
  domainGroupId: string;
  linkMapId: string;
  linkMapName: string;
  redirectRuleId: string | null;
  host: string;
  shortPath: string;
  /** Empty from API; UI lazy-expands full URLs per host. */
  shortUrls: string[];
  shortUrl: string;
  key: string;
  destination: string;
  updatedAt: string;
};
