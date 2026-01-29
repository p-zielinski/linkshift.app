import { HttpMethod } from './http-method.model';


export type RedirectRule = {
  id: string;
  source: string;
  destination: string;
  statusCode: number;
  matchMethod: HttpMethod[];
  priority: number;
  domainGroupId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateRedirectRuleDto = {
  source: string;
  destination: string;
  statusCode?: number;
  matchMethod?: HttpMethod[];
  priority?: number;
  domainGroupId: string;
};

export type UpdateRedirectRuleDto = {
  source?: string;
  destination?: string;
  statusCode?: number;
  matchMethod?: HttpMethod[];
  priority?: number;
};

export type RedirectRuleListQuery = {
  domainGroupId: string;
  limit?: number;
  startAfterId?: string;
  search?: string;
};

export type RedirectSimulationEntry = {
  domainGroupId: string;
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
