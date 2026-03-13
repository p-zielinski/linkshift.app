import { createEntityStore } from './entity/entity-store.factory';
import { LinkMapsApiService } from '../api/link-maps-api.service';
import type {
  LinkMap,
  LinkMapEntry,
  CreateLinkMapDto,
  UpdateLinkMapDto,
  LinkMapListQuery
} from '../models/link-map.model';

type LinkMapEntity = LinkMap & { entries?: LinkMapEntry[] };

export const LinkMapStore = createEntityStore<
  LinkMapEntity,
  CreateLinkMapDto,
  UpdateLinkMapDto,
  LinkMapListQuery
>({
  identifier: 'id',
  entityLabel: 'Link map',
  api: LinkMapsApiService,
  invalidateUsageOnMutations: true
});
