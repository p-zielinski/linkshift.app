import { createEntityStore } from './entity/entity-store.factory';
import { RedirectTestsApiService } from '../api/redirect-tests-api.service';
import type {
  RedirectTest,
  CreateRedirectTestDto,
  UpdateRedirectTestDto,
  RedirectTestListQuery
} from '../models/redirect-test.model';

export const RedirectTestStore = createEntityStore<
  RedirectTest,
  CreateRedirectTestDto,
  UpdateRedirectTestDto,
  RedirectTestListQuery
>({
  identifier: 'id',
  entityLabel: 'Redirect test',
  api: RedirectTestsApiService,
  invalidateUsageOnMutations: true
});
