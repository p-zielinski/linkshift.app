import { HttpMethod } from './http-method.model';


export type RedirectRule = {
  id: string;
  source: string;
  destination: string | null;
  statusCode: number;
  matchMethod: HttpMethod[];
  queryMatch: RedirectQueryMatch;
  pathMatch: RedirectPathMatch;
  linkMapId?: string | null;
  priority: number;
  domainGroupId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isBlocked?: boolean;
  blockedAt?: string | null;
};

export type CreateRedirectRuleDto = {
  source: string;
  destination?: string | null;
  statusCode?: number;
  matchMethod?: HttpMethod[];
  queryMatch?: RedirectQueryMatch;
  pathMatch?: RedirectPathMatch;
  linkMapId?: string | null;
  priority?: number;
  domainGroupId: string;
};

export type UpdateRedirectRuleDto = {
  source?: string;
  destination?: string | null;
  statusCode?: number;
  matchMethod?: HttpMethod[];
  queryMatch?: RedirectQueryMatch;
  pathMatch?: RedirectPathMatch;
  linkMapId?: string | null;
  priority?: number;
};

export type RedirectQueryMatch = 'exact' | 'ignore' | 'subset';
export type RedirectPathMatch = 'exact' | 'prefix';

export type RedirectRuleListQuery = {
  domainGroupId: string;
  limit?: number;
  startAfterId?: string;
  search?: string;
};

export type RedirectRuleTopRange = 'day' | 'week' | 'month';

export type RedirectRuleAnalyticsQuery = {
  range?: RedirectRuleTopRange;
  start?: string;
  end?: string;
  limit?: number;
};

export type TopRedirectRuleEntry = {
  rule: RedirectRule;
  hits: number;
  topLinkMapKeys: RedirectRuleAnalyticsLinkMapKey[];
  topRequestVariants: RedirectRuleAnalyticsRequestVariant[];
};

export type RedirectRuleAnalyticsLinkMapKey = {
  key: string;
  hits: number;
};

export type RedirectRuleAnalyticsRequestVariant = {
  requestMethod: string;
  requestPath: string;
  requestQuery: string;
  requestUrl: string;
  destination: string;
  linkMapKey: string | null;
  hits: number;
};

export type RedirectRuleAnalyticsResponse = {
  data: TopRedirectRuleEntry[];
};

export type RedirectSimulationEntry = {
  domainGroupId: string;
  hostname?: string;
  path: string;
  method?: HttpMethod;
  protocol?: 'http' | 'https';
  ip?: string;
  userAgent?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | string[] | number | boolean>;
};

export type RedirectSimulationResult = {
  index: number;
  domainGroupId: string;
  method: string;
  path: string;
  hostname: string;
  matched: boolean;
  statusCode: number;
  target: string | null;
};

export type RedirectSimulationResponse = {
  results: RedirectSimulationResult[];
};
