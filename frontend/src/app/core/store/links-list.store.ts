import { createEntityStore } from './entity/entity-store.factory';
import { LinksListApiService } from '../api/links-list-api.service';
import type { AggregatedLinkRow, LinksListQuery } from '../models/links-list.model';

export const LinksListStore = createEntityStore<
  AggregatedLinkRow,
  never,
  never,
  LinksListQuery
>({
  identifier: 'id',
  entityLabel: 'Link',
  api: LinksListApiService,
});
