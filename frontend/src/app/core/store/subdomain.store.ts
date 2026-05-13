import { createEntityStore } from './entity/entity-store.factory';
import { SubdomainsApiService } from '../api/subdomains-api.service';
import type {
  Subdomain,
  CreateSubdomainDto,
  UpdateSubdomainDto
} from '../models/subdomain.model';

export const SubdomainStore = createEntityStore<
  Subdomain,
  CreateSubdomainDto,
  UpdateSubdomainDto,
  undefined
>({
  identifier: 'id',
  entityLabel: 'Subdomain',
  api: SubdomainsApiService,
  invalidateUsageOnMutations: true
});
