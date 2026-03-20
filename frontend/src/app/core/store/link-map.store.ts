import { createEntityStore } from './entity/entity-store.factory';
import { LinkMapsApiService } from '../api/link-maps-api.service';
import type {
  LinkMap,
  CreateLinkMapDto,
  UpdateLinkMapDto,
  LinkMapListQuery
} from '../models/link-map.model';

export const LinkMapStore = createEntityStore<
  LinkMap,
  CreateLinkMapDto,
  UpdateLinkMapDto,
  LinkMapListQuery
>({
  identifier: 'id',
  entityLabel: 'Link map',
  api: LinkMapsApiService,
  invalidateUsageOnMutations: true
});
