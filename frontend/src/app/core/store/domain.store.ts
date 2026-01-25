import { createEntityStore } from './entity/entity-store.factory';
import { DomainsApiService } from '../api/domains-api.service';
import type { Domain, CreateDomainDto, UpdateDomainDto } from '../models/domain.model';

export const DomainStore = createEntityStore<
  Domain,
  CreateDomainDto,
  UpdateDomainDto,
  undefined
>({
  identifier: 'id',
  api: DomainsApiService
});
