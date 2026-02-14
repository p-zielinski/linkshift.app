import { createEntityStore } from './entity/entity-store.factory';
import { DomainGroupsApiService } from '../api/domain-groups-api.service';
import type {
  DomainGroup,
  CreateDomainGroupDto,
  UpdateDomainGroupDto
} from '../models/domain-group.model';

export const DomainGroupStore = createEntityStore<
  DomainGroup,
  CreateDomainGroupDto,
  UpdateDomainGroupDto,
  undefined
>({
  identifier: 'id',
  entityLabel: 'Domain group',
  api: DomainGroupsApiService
});
