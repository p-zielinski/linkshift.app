import { createEntityStore } from './entity/entity-store.factory';
import { LinkMapEntriesApiService } from '../api/link-map-entries-api.service';
import type {
  CreateLinkMapEntryDto,
  LinkMapEntry,
  LinkMapEntryListQuery,
  UpdateLinkMapEntryDto,
} from '../models/link-map.model';

export const LinkMapEntryStore = createEntityStore<
  LinkMapEntry,
  CreateLinkMapEntryDto,
  UpdateLinkMapEntryDto,
  LinkMapEntryListQuery
>({
  identifier: 'id',
  entityLabel: 'Link map entry',
  api: LinkMapEntriesApiService,
  invalidateUsageOnMutations: true,
});
