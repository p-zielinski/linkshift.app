import { HttpMethod } from './http-method.model';

export type RedirectTestRequestData = {
  method?: HttpMethod;
  protocol?: 'http' | 'https';
  hostname?: string;
  ip?: string;
  userAgent?: string;
  headers?: Record<string, string>;
  query?: Record<string, string | string[] | number | boolean>;
};

export type RedirectTestResult = {
  matched: boolean;
  statusCode: number;
  target: string | null;
};

export type RedirectTest = {
  id: string;
  organizationId: string;
  domainGroupId: string;
  pathWithQuery: string;
  requestData: RedirectTestRequestData;
  expectedResult: RedirectTestResult;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateRedirectTestDto = {
  domainGroupId: string;
  pathWithQuery: string;
  requestData?: RedirectTestRequestData;
  expectedResult: RedirectTestResult;
};

export type UpdateRedirectTestDto = {
  pathWithQuery?: string;
  requestData?: RedirectTestRequestData;
  expectedResult?: RedirectTestResult;
};

export type RedirectTestListQuery = {
  domainGroupId: string;
  limit?: number;
  startAfterId?: string;
  search?: string;
};
