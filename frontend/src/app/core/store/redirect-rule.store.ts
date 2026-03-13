import { createEntityStore } from './entity/entity-store.factory';
import { RedirectRulesApiService } from '../api/redirect-rules-api.service';
import type {
  RedirectRule,
  CreateRedirectRuleDto,
  UpdateRedirectRuleDto,
  RedirectRuleListQuery
} from '../models/redirect-rule.model';

export const RedirectRuleStore = createEntityStore<
  RedirectRule,
  CreateRedirectRuleDto,
  UpdateRedirectRuleDto,
  RedirectRuleListQuery
>({
  identifier: 'id',
  entityLabel: 'Redirect rule',
  api: RedirectRulesApiService,
  invalidateUsageOnMutations: true
});
