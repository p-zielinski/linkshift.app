export type RedirectRule = {
  id: string;
  source: string;
  destination: string;
  statusCode: number;
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
  priority?: number;
  domainGroupId: string;
};

export type UpdateRedirectRuleDto = {
  source?: string;
  destination?: string;
  statusCode?: number;
  priority?: number;
};

export type RedirectRuleListQuery = {
  domainGroupId: string;
  limit?: number;
  startAfterId?: string;
  search?: string;
};
