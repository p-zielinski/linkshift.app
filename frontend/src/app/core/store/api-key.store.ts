import { createEntityStore } from './entity/entity-store.factory';
import { ApiKeysApiService } from '../api/api-keys-api.service';
import type { ApiKey, CreateApiKeyDto, UpdateApiKeyDto } from '../models/api-key.model';

export const ApiKeyStore = createEntityStore<
  ApiKey,
  CreateApiKeyDto,
  UpdateApiKeyDto,
  undefined
>({
  identifier: 'id',
  entityLabel: 'API key',
  api: ApiKeysApiService,
  invalidateUsageOnMutations: true,
});
