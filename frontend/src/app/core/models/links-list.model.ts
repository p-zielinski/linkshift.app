import type { AggregatedLinkRow as SharedAggregatedLinkRow } from '@shared/models/links-list.model';

export type AggregatedLinkRow = SharedAggregatedLinkRow;

export type LinksListQuery = {
  domainGroupId?: string;
  linkMapId?: string;
  search?: string;
  limit?: number;
  startAfterId?: string;
};
